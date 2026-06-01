import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ProfileAvatar from '../src/components/ProfileAvatar';
import {
  COLORS,
  MOCK_MATCHES,
  MockProfile,
  getFirstName,
} from '../src/data/mockData';

type ChatMessage = {
  id: string;
  text: string;
  sent: boolean;
};

type MessagesProps = {
  initialChatId?: string | null;
  onChatOpened?: () => void;
};

export default function Messages({ initialChatId, onChatOpened }: MessagesProps) {
  const [activeChat, setActiveChat] = useState<MockProfile | null>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!initialChatId) return;
    const match = MOCK_MATCHES.find((m) => m.id === initialChatId);
    if (match) {
      setActiveChat(match);
      setMessages([]);
      onChatOpened?.();
    }
  }, [initialChatId, onChatOpened]);

  const openChat = (match: MockProfile) => {
    setActiveChat(match);
    setMessages([]);
    setDraft('');
  };

  const closeChat = () => {
    setActiveChat(null);
    setMessages([]);
    setDraft('');
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeChat) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, text, sent: true },
    ]);
    setDraft('');

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (activeChat) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <StatusBar style="dark" />

        <View style={styles.chatHeader}>
          <Pressable style={styles.backBtn} onPress={closeChat}>
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <ProfileAvatar name={activeChat.name} gradient={activeChat.gradient} size={40} />
          <View style={styles.chatHeaderText}>
            <Text style={styles.chatName}>{activeChat.name}</Text>
            <Text style={styles.chatMeta}>{activeChat.compatibility}% compatible</Text>
          </View>
        </View>

        <ScrollView
          ref={listRef}
          style={styles.chatMessages}
          contentContainerStyle={styles.chatMessagesContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.chatHint}>
            <Text style={styles.chatHintText}>
              You matched with {getFirstName(activeChat.name)}. Say hello! 👋
            </Text>
          </View>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.sent ? styles.bubbleSent : styles.bubbleReceived]}
            >
              <Text style={[styles.bubbleText, msg.sent && styles.bubbleTextSent]}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor="rgba(7, 77, 46, 0.35)"
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!draft.trim()}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Start a conversation with your matches</Text>
      </View>

      <FlatList
        data={MOCK_MATCHES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => openChat(item)}
          >
            <ProfileAvatar name={item.name} gradient={item.gradient} size={54} />
            <View style={styles.rowBody}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.lastMessageAt ?? 'Now'}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                Say hello! 👋
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ivory,
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.forest,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(7, 77, 46, 0.6)',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.08)',
  },
  rowPressed: {
    backgroundColor: 'rgba(168, 213, 186, 0.15)',
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.forest,
  },
  time: {
    fontSize: 12,
    color: 'rgba(7, 77, 46, 0.45)',
    fontWeight: '600',
  },
  preview: {
    fontSize: 14,
    color: 'rgba(7, 77, 46, 0.6)',
    fontWeight: '500',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(7, 77, 46, 0.08)',
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 213, 186, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 22,
    color: COLORS.forest,
    fontWeight: '700',
  },
  chatHeaderText: {
    flex: 1,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.forest,
  },
  chatMeta: {
    fontSize: 12,
    color: 'rgba(7, 77, 46, 0.55)',
    fontWeight: '600',
    marginTop: 2,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },
  chatHint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(168, 213, 186, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  chatHintText: {
    fontSize: 13,
    color: COLORS.forest,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleSent: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.forest,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(7, 77, 46, 0.1)',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    color: COLORS.forest,
    fontWeight: '500',
  },
  bubbleTextSent: {
    color: COLORS.ivory,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(7, 77, 46, 0.08)',
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 77, 46, 0.12)',
    backgroundColor: COLORS.ivory,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.forest,
    fontWeight: '500',
  },
  sendBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.forest,
  },
});
