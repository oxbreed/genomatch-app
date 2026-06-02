import { format, isToday, isYesterday, parseISO } from 'date-fns';
import type {
  ConversationPreview,
  MessageRow,
  ProfileRow,
} from '../types/database';
import { logSupabaseResult } from './auth';
import { mapProfileRow } from './profileMapper';
import { getCurrentUserId } from './profiles';
import { supabase } from './supabase';

export type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  isMine: boolean;
};

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

  const { data: me, error: meError } = await supabase
    .from('profiles')
    .select('genotype')
    .eq('id', userId)
    .maybeSingle();

  logSupabaseResult('messages.viewerGenotype', me, meError);
  if (meError) throw meError;
  const viewerGenotype = (me as { genotype: ProfileRow['genotype'] } | null)?.genotype ?? null;

  const otherIds = matchRows.map((m) =>
    m.user_a_id === userId ? m.user_b_id : m.user_a_id
  );

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(
      'id, display_name, genotype, city, bio, interests, relationship_goal, avatar_url, date_of_birth'
    )
    .in('id', otherIds);

  logSupabaseResult('messages.matchedProfiles', profiles, profilesError);
  if (profilesError) throw profilesError;

  const profileMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p])
  );

  const matchIds = matchRows.map((m) => m.id);
  const { data: latestMessages, error: messagesError } = await supabase
    .from('messages')
    .select('id, match_id, sender_id, body, created_at')
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

  return matchRows
    .map((match) => {
      const otherId = match.user_a_id === userId ? match.user_b_id : match.user_a_id;
      const row = profileMap.get(otherId);
      if (!row) return null;

      const last = lastByMatch.get(match.id);
      return {
        matchId: match.id,
        profile: mapProfileRow(row, viewerGenotype),
        lastMessage: last?.body ?? null,
        lastMessageAt: last?.created_at ?? match.created_at,
        unread: false,
      };
    })
    .filter((item): item is ConversationPreview => item !== null);
}

export async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as MessageRow[]).map((row) => ({
    id: row.id,
    body: row.body,
    senderId: row.sender_id,
    createdAt: row.created_at,
    isMine: row.sender_id === userId,
  }));
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
    .select('*')
    .single();

  if (error) throw error;

  const row = data as MessageRow;
  return {
    id: row.id,
    body: row.body,
    senderId: row.sender_id,
    createdAt: row.created_at,
    isMine: true,
  };
}

export function subscribeToMessages(
  matchId: string,
  onMessage: (message: ChatMessage) => void
) {
  const channel = supabase
    .channel(`messages:${matchId}`)
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
        const row = payload.new as MessageRow;
        onMessage({
          id: row.id,
          body: row.body,
          senderId: row.sender_id,
          createdAt: row.created_at,
          isMine: row.sender_id === userId,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
