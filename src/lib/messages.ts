import { format, isToday, isYesterday, parseISO } from 'date-fns';
import type {
  ConversationPreview,
  MessageRow,
  ProfileRow,
} from '../types/database';
import { logSupabaseResult } from './auth';
import { mapProfileRow } from './profileMapper';
import { getBlockedUserIds } from './moderation';
import { fetchPublicProfilesByIds, getCurrentUserId } from './profiles';
import { supabase } from './supabase';

export type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  readAt: string | null;
  isMine: boolean;
};

function rowToChatMessage(row: MessageRow, userId: string | null): ChatMessage {
  return {
    id: row.id,
    body: row.body,
    senderId: row.sender_id,
    createdAt: row.created_at,
    readAt: row.read_at ?? null,
    isMine: row.sender_id === userId,
  };
}

export function formatMessageTime(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export async function fetchConversations(): Promise<ConversationPreview[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.log('[messages] fetchConversations — no authenticated user');
    return [];
  }

  const { data: matchRows, error: matchError } = await supabase
    .from('matches')
    .select('id, user_a_id, user_b_id, created_at')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  logSupabaseResult('messages.matches', matchRows, matchError);
  if (matchError) throw matchError;
  if (!matchRows?.length) return [];

  const blockedSet = await getBlockedUserIds(userId);
  const visibleMatches = matchRows.filter((match) => {
    const otherId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
    return !blockedSet.has(otherId);
  });
  if (!visibleMatches.length) return [];

  const { data: me, error: meError } = await supabase
    .from('profiles')
    .select('genotype')
    .eq('id', userId)
    .maybeSingle();

  logSupabaseResult('messages.viewerGenotype', me, meError);
  if (meError) throw meError;
  const viewerGenotype = (me as { genotype: ProfileRow['genotype'] } | null)?.genotype ?? null;

  const otherIds = visibleMatches.map((m) =>
    m.user_a_id === userId ? m.user_b_id : m.user_a_id
  );

  const profiles = await fetchPublicProfilesByIds(otherIds);

  logSupabaseResult('messages.matchedProfiles', profiles, null);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const matchIds = visibleMatches.map((m) => m.id);
  const { data: latestMessages, error: messagesError } = await supabase
    .from('messages')
    .select('id, match_id, sender_id, body, created_at, read_at')
    .in('match_id', matchIds)
    .order('created_at', { ascending: false });

  logSupabaseResult('messages.latestMessages', latestMessages, messagesError);
  if (messagesError) throw messagesError;

  const lastByMatch = new Map<string, MessageRow>();
  for (const msg of (latestMessages ?? []) as MessageRow[]) {
    if (!lastByMatch.has(msg.match_id)) {
      lastByMatch.set(msg.match_id, msg);
    }
  }

  return visibleMatches
    .map((match) => {
      const otherId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
      const row = profileMap.get(otherId);
      if (!row) return null;

      const last = lastByMatch.get(match.id);
      const unread =
        !!last &&
        last.sender_id !== userId &&
        (last.read_at == null || last.read_at === '');

      return {
        matchId: match.id,
        profile: mapProfileRow(row, viewerGenotype),
        lastMessage: last?.body ?? null,
        lastMessageAt: last?.created_at ?? match.created_at,
        unread,
      };
    })
    .filter((item): item is ConversationPreview => item !== null);
}

export async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('id, match_id, sender_id, body, created_at, read_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as MessageRow[]).map((row) => rowToChatMessage(row, userId));
}

/** Mark all unread messages from the other person in this match as read. */
export async function markMessagesAsRead(matchId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('messages')
    .update({ read_at: now })
    .eq('match_id', matchId)
    .neq('sender_id', userId)
    .is('read_at', null);

  if (error) throw error;
}

export async function sendMessage(matchId: string, body: string): Promise<ChatMessage> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not signed in');

  const trimmed = body.trim();
  if (!trimmed) throw new Error('Message cannot be empty');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: userId,
      body: trimmed,
    })
    .select('id, match_id, sender_id, body, created_at, read_at')
    .single();

  if (error) throw error;

  return rowToChatMessage(data as MessageRow, userId);
}

export type ChatRealtimeCallbacks = {
  onMessage: (message: ChatMessage) => void;
  onMessageUpdated: (message: ChatMessage) => void;
  onTyping: (isTyping: boolean) => void;
};

export type ChatRealtimeHandle = {
  broadcastTyping: (isTyping: boolean) => void;
  unsubscribe: () => void;
};

/** Realtime: new messages, read receipt updates, and typing broadcasts. */
export function subscribeToChatRealtime(
  matchId: string,
  otherUserId: string,
  callbacks: ChatRealtimeCallbacks
): ChatRealtimeHandle {
  const channel = supabase.channel(`chat:${matchId}`, {
    config: { broadcast: { self: false } },
  });

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      async (payload) => {
        const userId = await getCurrentUserId();
        callbacks.onMessage(rowToChatMessage(payload.new as MessageRow, userId));
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      async (payload) => {
        const userId = await getCurrentUserId();
        callbacks.onMessageUpdated(rowToChatMessage(payload.new as MessageRow, userId));
      }
    )
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      const data = payload as { userId?: string; isTyping?: boolean };
      if (data.userId === otherUserId) {
        callbacks.onTyping(!!data.isTyping);
      }
    })
    .subscribe();

  return {
    broadcastTyping(isTyping: boolean) {
      void getCurrentUserId().then((userId) => {
        if (!userId) return;
        void channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, isTyping },
        });
      });
    },
    unsubscribe() {
      supabase.removeChannel(channel);
    },
  };
}

/** @deprecated Use subscribeToChatRealtime */
export function subscribeToMessages(
  matchId: string,
  onMessage: (message: ChatMessage) => void
) {
  const handle = subscribeToChatRealtime(matchId, '', {
    onMessage,
    onMessageUpdated: () => {},
    onTyping: () => {},
  });
  return handle.unsubscribe;
}
