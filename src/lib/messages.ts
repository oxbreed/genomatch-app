import { format, isToday, isYesterday, parseISO } from 'date-fns';
import type {
  ConversationPreview,
  MessageRow,
  ProfileRow,
} from '../types/database';
import { getOpenChatMatchId } from './activeChat';
import { peekUserId, logSupabaseResult } from './auth';
import { publishLiveMessage, publishLiveMessageUpdated } from './chatLive';
import { mapProfileRow } from './profileMapper';
import { getBlockedUserIds } from './moderation';
import { fetchPublicProfilesByIds, getCurrentUserId } from './profiles';
import { supabase } from './supabase';
import { validateMessage } from './validation';

type ConversationPreviewRow = {
  match_id: string;
  other_user_id: string;
  last_message_body: string | null;
  last_message_at: string;
  last_sender_id: string | null;
  last_read_at: string | null;
  match_created_at: string;
};

const messagesByMatch = new Map<string, ChatMessage[]>();

export function peekCachedMessages(matchId: string): ChatMessage[] | undefined {
  const cached = messagesByMatch.get(matchId);
  return cached ? [...cached] : undefined;
}

export function setCachedMessages(matchId: string, messages: ChatMessage[]): void {
  messagesByMatch.set(matchId, messages);
}

function mergeCachedMessage(matchId: string, message: ChatMessage): void {
  const prev = messagesByMatch.get(matchId) ?? [];
  if (prev.some((m) => m.id === message.id)) {
    messagesByMatch.set(
      matchId,
      prev.map((m) => (m.id === message.id ? message : m))
    );
    return;
  }
  messagesByMatch.set(matchId, [...prev, message]);
}

export function appendMessageToList(prev: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
  const base = incoming.isMine ? prev.filter((m) => !m.id.startsWith('pending-')) : prev;
  if (base.some((m) => m.id === incoming.id)) return base;
  return [...base, incoming];
}

export function upsertMessageInList(prev: ChatMessage[], updated: ChatMessage): ChatMessage[] {
  const idx = prev.findIndex((m) => m.id === updated.id);
  if (idx >= 0) {
    const copy = [...prev];
    copy[idx] = updated;
    return copy;
  }
  return [...prev, updated];
}

function deliverLiveMessage(matchId: string, message: ChatMessage): void {
  mergeCachedMessage(matchId, message);
  publishLiveMessage(matchId, message);
}

function deliverLiveMessageUpdated(matchId: string, message: ChatMessage): void {
  mergeCachedMessage(matchId, message);
  publishLiveMessageUpdated(matchId, message);
}

export function clearMessageCache(matchId?: string): void {
  if (matchId) {
    messagesByMatch.delete(matchId);
    return;
  }
  messagesByMatch.clear();
}

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

  const { data: previewRows, error: previewError } = await supabase.rpc(
    'get_my_conversation_previews'
  );

  logSupabaseResult('messages.conversationPreviews', previewRows, previewError);

  let lastByMatch = new Map<string, MessageRow>();

  if (previewError) {
    if (previewError.code !== 'PGRST202' && previewError.code !== '42883') {
      throw previewError;
    }

    const { data: latestMessages, error: messagesError } = await supabase
      .from('messages')
      .select('id, match_id, sender_id, body, created_at, read_at')
      .in('match_id', matchIds)
      .order('created_at', { ascending: false });

    logSupabaseResult('messages.latestMessages', latestMessages, messagesError);
    if (messagesError) throw messagesError;

    for (const msg of (latestMessages ?? []) as MessageRow[]) {
      if (!lastByMatch.has(msg.match_id)) {
        lastByMatch.set(msg.match_id, msg);
      }
    }
  } else {
    for (const row of (previewRows ?? []) as ConversationPreviewRow[]) {
      if (!row.last_message_body || !row.last_sender_id) continue;
      lastByMatch.set(row.match_id, {
        id: row.match_id,
        match_id: row.match_id,
        sender_id: row.last_sender_id,
        body: row.last_message_body,
        created_at: row.last_message_at,
        read_at: row.last_read_at,
      });
    }
  }

  const previewTimeByMatch = new Map<string, string>();
  if (!previewError) {
    for (const row of (previewRows ?? []) as ConversationPreviewRow[]) {
      previewTimeByMatch.set(row.match_id, row.last_message_at);
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
        lastMessageAt: previewTimeByMatch.get(match.id) ?? last?.created_at ?? match.created_at,
        unread,
      };
    })
    .filter((item): item is ConversationPreview => item !== null);
}

export async function fetchMessages(
  matchId: string,
  options?: { force?: boolean }
): Promise<ChatMessage[]> {
  if (!options?.force) {
    const cached = peekCachedMessages(matchId);
    if (cached) return cached;
  }

  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('id, match_id, sender_id, body, created_at, read_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const rows = ((data ?? []) as MessageRow[]).map((row) => rowToChatMessage(row, userId));
  setCachedMessages(matchId, rows);
  return rows;
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

export async function sendMessage(
  matchId: string,
  body: string,
  options?: { userId?: string }
): Promise<ChatMessage> {
  const userId = options?.userId ?? (await getCurrentUserId());
  if (!userId) throw new Error('Not signed in');

  const sanitized = validateMessage(body);
  if (!sanitized) throw new Error('Message cannot be empty');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: userId,
      body: sanitized,
    })
    .select('id, match_id, sender_id, body, created_at, read_at')
    .single();

  if (error) throw error;

  const message = rowToChatMessage(data as MessageRow, userId);
  mergeCachedMessage(matchId, message);
  return message;
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
  userId: string,
  callbacks: ChatRealtimeCallbacks
): ChatRealtimeHandle {
  const channel = supabase.channel(`chat:${matchId}:${userId}`, {
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
      (payload) => {
        const message = rowToChatMessage(payload.new as MessageRow, userId);
        deliverLiveMessage(matchId, message);
        callbacks.onMessage(message);
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
      (payload) => {
        const message = rowToChatMessage(payload.new as MessageRow, userId);
        deliverLiveMessageUpdated(matchId, message);
        callbacks.onMessageUpdated(message);
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
      void channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping },
      });
    },
    unsubscribe() {
      supabase.removeChannel(channel);
    },
  };
}

export type InboxRealtimeCallbacks = {
  onNewMessage: (row: MessageRow) => void;
  onMessageUpdated: (row: MessageRow) => void;
  onNewMatch: () => void;
};

/** Start the shared inbox realtime channel as early as possible. */
export function startInboxRealtime(): void {
  ensureInboxChannel();
}

/** Inbox-wide realtime for conversation list + badges (RLS-scoped). */
export function subscribeToInboxRealtime(callbacks: InboxRealtimeCallbacks): () => void {
  inboxListeners.add(callbacks);
  ensureInboxChannel();

  return () => {
    inboxListeners.delete(callbacks);
    if (inboxListeners.size === 0 && inboxChannel) {
      supabase.removeChannel(inboxChannel);
      inboxChannel = null;
    }
  };
}

const inboxListeners = new Set<InboxRealtimeCallbacks>();
let inboxChannel: ReturnType<typeof supabase.channel> | null = null;

function emitInboxEvent(
  event: keyof InboxRealtimeCallbacks,
  ...args: Parameters<InboxRealtimeCallbacks[typeof event]>
): void {
  inboxListeners.forEach((listener) => {
    const handler = listener[event] as (...handlerArgs: unknown[]) => void;
    handler(...args);
  });
}

function routeRowToLiveChat(row: MessageRow, kind: 'insert' | 'update'): void {
  const userId = peekUserId();
  if (!userId) return;

  const message = rowToChatMessage(row, userId);
  const openMatchId = getOpenChatMatchId();
  if (openMatchId && openMatchId === row.match_id) {
    if (kind === 'insert') {
      deliverLiveMessage(row.match_id, message);
    } else {
      deliverLiveMessageUpdated(row.match_id, message);
    }
  }
}

function ensureInboxChannel(): void {
  if (inboxChannel) return;

  inboxChannel = supabase
    .channel('inbox:feed')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const row = payload.new as MessageRow;
        routeRowToLiveChat(row, 'insert');
        emitInboxEvent('onNewMessage', row);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages' },
      (payload) => {
        const row = payload.new as MessageRow;
        routeRowToLiveChat(row, 'update');
        emitInboxEvent('onMessageUpdated', row);
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'matches' },
      () => {
        emitInboxEvent('onNewMatch');
      }
    )
    .subscribe();
}

export function applyInboxMessageToConversations(
  conversations: ConversationPreview[],
  row: MessageRow,
  userId: string
): ConversationPreview[] | null {
  const existingIdx = conversations.findIndex((c) => c.matchId === row.match_id);

  if (existingIdx < 0) {
    return null;
  }

  const existing = conversations[existingIdx];
  const updated: ConversationPreview = {
    ...existing,
    lastMessage: row.body,
    lastMessageAt: row.created_at,
    unread:
      getOpenChatMatchId() === row.match_id
        ? false
        : row.sender_id !== userId && (row.read_at == null || row.read_at === ''),
  };
  const next = [...conversations];
  next.splice(existingIdx, 1);
  return [updated, ...next];
}

/** @deprecated Use subscribeToChatRealtime */
export function subscribeToMessages(
  matchId: string,
  onMessage: (message: ChatMessage) => void
) {
  const handle = subscribeToChatRealtime(matchId, '', '', {
    onMessage,
    onMessageUpdated: () => {},
    onTyping: () => {},
  });
  return handle.unsubscribe;
}
