import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import FamilyPlanningCard from '../src/components/FamilyPlanningCard';
import ProfileAvatar from '../src/components/ProfileAvatar';
import ReportBlockSheet from '../src/components/ReportBlockSheet';
import ChatMessageBubble from '../src/components/messages/ChatMessageBubble';
import { GenoGlassSurface, GenoPremiumChrome } from '../src/brand/graphics';
import { GenoGlassIconButton } from '../src/components/inbox';
import { getInitials } from '../src/data/mockData';
import { FONT_FAMILY, COLORS, RADIUS, SHADOWS } from '../src/theme';
import { getAuthenticatedUserId, peekUserId } from '../src/lib/auth';
import { setOpenChatMatchId } from '../src/lib/activeChat';
import { subscribeToLiveMatch } from '../src/lib/chatLive';
import type { DiscoveryProfile, Genotype, MatchWithProfile } from '../src/types/database';
import { getCurrentProfile } from '../src/lib/profiles';
import { rateLimitAction } from '../src/lib/rateLimit';
import {
  appendMessageToList,
  ChatMessage,
  fetchMessages,
  markMessagesAsRead,
  peekCachedMessages,
  sendMessage,
  subscribeToChatRealtime,
  upsertMessageInList,
} from '../src/lib/messages';
import MatchProfile from './MatchProfile';

const TYPING_STOP_MS = 2000;
const MARK_READ_DELAY_MS = 350;

type ChatScreenProps = {
  matchId: string;
  profile: DiscoveryProfile;
  userId?: string | null;
  onBack: () => void;
};

export default function ChatScreen({ matchId, profile, userId: userIdProp, onBack }: ChatScreenProps) {
  const initialCache = peekCachedMessages(matchId);
  const [messages, setMessages] = useState<ChatMessage[]>(initialCache ?? []);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showModerationSheet, setShowModerationSheet] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [viewerGenotype, setViewerGenotype] = useState<Genotype | null>(null);
  const [userId, setUserId] = useState<string | null>(() => userIdProp ?? peekUserId());
  const listRef = useRef<FlatList<{ item: ChatMessage; prevCreatedAt: string | null }>>(null);
  const realtimeRef = useRef<ReturnType<typeof subscribeToChatRealtime> | null>(null);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const match: MatchWithProfile = {
    matchId,
    profile,
    matchedAt: new Date().toISOString(),
  };

  const scrollToEnd = useCallback((animated = false) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const scheduleMarkRead = useCallback(() => {
    if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    markReadTimerRef.current = setTimeout(() => {
      void markMessagesAsRead(matchId).catch(() => {});
    }, MARK_READ_DELAY_MS);
  }, [matchId]);

  const syncMessages = useCallback(
    async (background = false) => {
      try {
        const rows = await fetchMessages(matchId, { force: true });
        setMessages(rows);
        scheduleMarkRead();
      } catch (err) {
        if (!background && messagesRef.current.length === 0) {
          setError(err instanceof Error ? err.message : 'Could not load messages');
        }
      }
    },
    [matchId, scheduleMarkRead]
  );

  useEffect(() => {
    setOpenChatMatchId(matchId);
    return () => setOpenChatMatchId(null);
  }, [matchId]);

  useEffect(() => {
    if (userIdProp) {
      setUserId(userIdProp);
      return;
    }
    if (userId) return;
    void getAuthenticatedUserId().then((id) => {
      if (id) setUserId(id);
    });
  }, [userId, userIdProp]);

  useEffect(() => {
    void getCurrentProfile().then((row) => setViewerGenotype(row?.genotype ?? null));
  }, []);

  useEffect(() => {
    void syncMessages(!!initialCache?.length);
  }, [matchId, syncMessages]);

  useEffect(() => {
    const unsubLive = subscribeToLiveMatch(matchId, {
      onMessage: (incoming) => {
        setMessages((prev) => appendMessageToList(prev, incoming));
        if (!incoming.isMine) scheduleMarkRead();
        scrollToEnd(false);
      },
      onMessageUpdated: (updated) => {
        setMessages((prev) => upsertMessageInList(prev, updated));
      },
    });
    return unsubLive;
  }, [matchId, scheduleMarkRead, scrollToEnd]);

  useEffect(() => {
    if (!userId) return;

    const handle = subscribeToChatRealtime(matchId, profile.id, userId, {
      onMessage: () => {},
      onMessageUpdated: () => {},
      onTyping: setOtherTyping,
    });
    realtimeRef.current = handle;
    return () => {
      handle.unsubscribe();
      realtimeRef.current = null;
    };
  }, [matchId, profile.id, userId]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;
    realtimeRef.current?.broadcastTyping(isTyping);
  }, []);

  const handleDraftChange = (text: string) => {
    setDraft(text);
    if (typingStopRef.current) clearTimeout(typingStopRef.current);

    if (text.trim()) {
      setTyping(true);
      typingStopRef.current = setTimeout(() => setTyping(false), TYPING_STOP_MS);
    } else {
      setTyping(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
      setTyping(false);
    };
  }, [setTyping]);

  const handleSend = () => {
    const text = draft.trim();
    const senderId = userId ?? peekUserId();
    if (!text || !senderId) return;

    if (!rateLimitAction('message_send', 50, 3_600_000)) {
      setError('Message limit reached. You can send up to 50 messages per hour.');
      return;
    }

    setTyping(false);
    setError('');
    setDraft('');

    const optimisticId = `pending-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      body: text,
      senderId,
      createdAt: new Date().toISOString(),
      readAt: null,
      isMine: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    scrollToEnd(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    void sendMessage(matchId, text, { userId: senderId })
      .then((sent) => {
        setMessages((prev) => {
          const withoutPending = prev.filter((m) => m.id !== optimisticId);
          return appendMessageToList(withoutPending, sent);
        });
        scrollToEnd(false);
      })
      .catch((err) => {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        setDraft(text);
        setError(err instanceof Error ? err.message : 'Failed to send message');
      });
  };

  const lastMineId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].isMine) return messages[i].id;
    }
    return null;
  }, [messages]);

  const messageRows = useMemo(
    () =>
      messages.map((item, index) => ({
        item,
        prevCreatedAt: index > 0 ? messages[index - 1].createdAt : null,
      })),
    [messages]
  );

  const renderItem = useCallback(
    ({ item: row }: { item: { item: ChatMessage; prevCreatedAt: string | null } }) => (
      <ChatMessageBubble
        item={row.item}
        prevCreatedAt={row.prevCreatedAt}
        showRead={row.item.isMine && !!row.item.readAt && row.item.id === lastMineId}
      />
    ),
    [lastMineId]
  );

  if (showProfile) {
    return (
      <MatchProfile
        match={match}
        onBack={() => setShowProfile(false)}
        onSendMessage={() => setShowProfile(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
    >
      <GenoPremiumChrome variant="discover" />
      <StatusBar style="dark" />

      <GenoGlassSurface
        variant="linen"
        borderRadius={0}
        shadow="glass"
        showTopRule
        style={styles.headerGlass}
        contentStyle={styles.header}
      >
        <GenoGlassIconButton onPress={onBack} accessibilityLabel="Go back" size={40}>
          <Ionicons name="chevron-back" size={20} color={COLORS.forestDeep} />
        </GenoGlassIconButton>
        <Pressable
          style={({ pressed }) => [styles.headerProfileTap, pressed && styles.headerIconBtnPressed]}
          onPress={() => setShowProfile(true)}
        >
          {profile.avatarUrl?.trim() || profile.photos[0]?.trim() ? (
            <ProfileAvatar
              name={profile.name}
              gradient={profile.gradient}
              avatarUrl={profile.avatarUrl ?? profile.photos[0]}
              size={42}
              noPhotoBackground={COLORS.forest}
              noPhotoInitialColor={COLORS.linen}
            />
          ) : (
            <View style={styles.chatHeaderAvatarFallback}>
              <Text style={styles.chatHeaderAvatarInitials}>{getInitials(profile.name)}</Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.chatName}>{profile.name}</Text>
            {otherTyping ? (
              <Text style={styles.typingMeta}>typing…</Text>
            ) : (
              <Text style={styles.chatMeta}>{profile.compatibility}% genotype match</Text>
            )}
          </View>
        </Pressable>
        <GenoGlassIconButton
          onPress={() => setShowProfile(true)}
          accessibilityLabel="View profile"
          size={40}
        >
          <Ionicons name="person-circle-outline" size={20} color={COLORS.forestDeep} />
        </GenoGlassIconButton>
        <GenoGlassIconButton
          onPress={() => setShowModerationSheet(true)}
          accessibilityLabel="Report or block"
          size={40}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={COLORS.forestDeep} />
        </GenoGlassIconButton>
      </GenoGlassSurface>

      <ReportBlockSheet
        visible={showModerationSheet}
        onClose={() => setShowModerationSheet(false)}
        targetUserId={profile.id}
        targetName={profile.name}
        onBlocked={onBack}
      />

      {error ? (
        <View style={styles.errorWrap}>
          <GenoGlassSurface
            variant="light"
            borderRadius={RADIUS.md}
            shadow="glass"
            style={styles.errorGlass}
            contentStyle={styles.errorBanner}
          >
            <Text style={styles.errorText}>{error}</Text>
          </GenoGlassSurface>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={messageRows}
        keyExtractor={(row) => row.item.id}
        extraData={lastMineId}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        initialNumToRender={18}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => scrollToEnd(false)}
        ListEmptyComponent={
          <View style={styles.emptyHint}>
            <FamilyPlanningCard
              viewerGenotype={viewerGenotype}
              candidateGenotype={profile.genotype}
            />
            <Text style={styles.emptyHintText}>
              You matched! Say hello and start your compatibility journey.
            </Text>
          </View>
        }
      />

      <GenoGlassSurface
        variant="linen"
        borderRadius={0}
        showTopRule
        shadow="glass"
        style={styles.composerGlass}
        contentStyle={styles.composer}
      >
        <TextInput
          style={styles.composerInput}
          value={draft}
          onChangeText={handleDraftChange}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSubtle}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendBtnWrap,
            pressed && styles.sendBtnPressed,
            !draft.trim() && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!draft.trim()}
        >
          <View style={styles.sendBtn}>
            <Text style={styles.sendBtnText}>Send</Text>
          </View>
        </Pressable>
      </GenoGlassSurface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.linen,
  },
  headerGlass: {
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  headerProfileTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  headerIconBtnPressed: {
    opacity: 0.88,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  chatHeaderAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 67, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chatHeaderAvatarInitials: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 16,
    color: COLORS.gold,
    textAlign: 'center',
  },
  chatName: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 17,
    letterSpacing: -0.2,
    color: COLORS.forestDeep,
  },
  chatMeta: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  typingMeta: {
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 12,
    color: COLORS.sage,
    fontStyle: 'italic',
    marginTop: 2,
  },
  errorWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  errorGlass: {
    overflow: 'hidden',
  },
  errorBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorText: {
    fontFamily: FONT_FAMILY.gothamMedium,
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyHint: {
    alignSelf: 'stretch',
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 14,
    maxWidth: '100%',
  },
  emptyHintText: {
    alignSelf: 'center',
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 13,
    color: COLORS.forest,
    textAlign: 'center',
    lineHeight: 19,
    backgroundColor: COLORS.chipFill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  composerGlass: {
    overflow: 'hidden',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 10,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONT_FAMILY.gothamMedium,
    fontSize: 16,
    color: COLORS.forest,
  },
  sendBtnWrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  sendBtnPressed: {
    opacity: 0.9,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtn: {
    minWidth: 76,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#D4A843',
  },
  sendBtnText: {
    fontFamily: FONT_FAMILY.gothamBold,
    fontSize: 15,
    color: '#0D2818',
  },
});
