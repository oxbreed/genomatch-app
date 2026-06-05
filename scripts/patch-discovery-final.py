#!/usr/bin/env python3
"""Wire report/block, match chat navigation, and matchId tracking in Discovery."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

# Props: add onStartChat
text = text.replace(
    "type DiscoveryProps = { onMatchCreated?: () => void };",
    "type DiscoveryProps = {\n  onMatchCreated?: () => void;\n  onStartChat?: (matchId: string) => void;\n};",
    1,
)
text = text.replace(
    "export default function Discovery({ onMatchCreated }: DiscoveryProps = {}) {",
    "export default function Discovery({ onMatchCreated, onStartChat }: DiscoveryProps = {}) {",
    1,
)

# Import getMatchIdForProfile if missing
if "getMatchIdForProfile" not in text:
    text = text.replace(
        "import { recordLike, recordPass } from '../src/lib/likes';",
        "import { recordLike, recordPass } from '../src/lib/likes';\nimport { getMatchIdForProfile } from '../src/lib/matches';",
        1,
    )

# matchedMatchId state
if "matchedMatchId" not in text:
    text = text.replace(
        "  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);",
        "  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);\n  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null);",
        1,
    )

# dismissMatchOverlay clears matchId
text = text.replace(
    """  const dismissMatchOverlay = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
  }, []);""",
    """  const dismissMatchOverlay = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
    setMatchedMatchId(null);
  }, []);""",
    1,
)

# showMatchOverlay accepts optional matchId
text = text.replace(
    """  const showMatchOverlay = useCallback((name: string, matched: DiscoveryProfile) => {
    triggerMatchCelebrationHaptic();
    setMatchedName(name);
    setMatchedProfile(matched);
    setShowMatch(true);
    onMatchCreated?.();
  }, [onMatchCreated]);""",
    """  const showMatchOverlay = useCallback(
    (name: string, matched: DiscoveryProfile, matchId: string | null = null) => {
      triggerMatchCelebrationHaptic();
      setMatchedName(name);
      setMatchedProfile(matched);
      setMatchedMatchId(matchId);
      setShowMatch(true);
      onMatchCreated?.();
    },
    [onMatchCreated]
  );""",
    1,
)

# recordLike stores matchId
text = text.replace(
    """            const { isMutualMatch } = await recordLike(profile.id);
            if (isMutualMatch) {
              showMatchOverlay(firstName, profile);
            }""",
    """            const { isMutualMatch, matchId } = await recordLike(profile.id);
            if (isMutualMatch) {
              showMatchOverlay(firstName, profile, matchId);
            }""",
    1,
)

# handleSendMessageFromMatch
if "handleSendMessageFromMatch" not in text:
    insert_after = """  const dismissMatchOverlay = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
    setMatchedMatchId(null);
  }, []);

"""
    handler = """  const handleSendMessageFromMatch = useCallback(async () => {
    const profileId = matchedProfile?.id;
    let matchId = matchedMatchId;
    dismissMatchOverlay();
    if (!matchId && profileId && !matchedProfile?.isMock) {
      matchId = await getMatchIdForProfile(profileId);
    }
    if (matchId) {
      onStartChat?.(matchId);
    }
  }, [dismissMatchOverlay, matchedMatchId, matchedProfile, onStartChat]);

"""
    text = text.replace(insert_after, insert_after + handler, 1)

# Match modal onSendMessage
text = text.replace(
    "        onSendMessage={dismissMatchOverlay}",
    "        onSendMessage={() => { void handleSendMessageFromMatch(); }}",
    1,
)

# handleBlockedFromDiscover
if "handleBlockedFromDiscover" not in text:
    handler = """  const handleBlockedFromDiscover = useCallback(() => {
    if (!profile) return;
    const blockedId = profile.id;
    setAllProfiles((prev) => prev.filter((p) => p.id !== blockedId));
    setShowModerationSheet(false);
    closeProfileSheet();
    setIndex((i) => Math.min(i, Math.max(0, profiles.length - 2)));
  }, [closeProfileSheet, profile, profiles.length]);

"""
    text = text.replace(
        "  const closeProfileSheet = useCallback(() => {",
        handler + "  const closeProfileSheet = useCallback(() => {",
        1,
    )

# Report button in profile sheet before Start Chat
OLD_CHAT_BTN = """            <Pressable
              style={({ pressed }) => [
                styles.profileSheetChatBtn,
                pressed && styles.profileSheetChatBtnPressed,
              ]}
              onPress={() => {
                closeProfileSheet();
                processSwipe('like');
              }}
            >
              <Text style={styles.profileSheetChatBtnText}>Start Chat</Text>
            </Pressable>"""

NEW_CHAT_BTN = """            <Pressable
              style={({ pressed }) => [
                styles.profileSheetSafetyBtn,
                pressed && styles.profileSheetChatBtnPressed,
              ]}
              onPress={() => setShowModerationSheet(true)}
            >
              <Ionicons name="shield-outline" size={18} color={COLORS.sage} />
              <Text style={styles.profileSheetSafetyText}>Report or block</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.profileSheetChatBtn,
                pressed && styles.profileSheetChatBtnPressed,
              ]}
              onPress={() => {
                closeProfileSheet();
                processSwipe('like');
              }}
            >
              <Text style={styles.profileSheetChatBtnText}>Start Chat</Text>
            </Pressable>"""

if OLD_CHAT_BTN in text:
    text = text.replace(OLD_CHAT_BTN, NEW_CHAT_BTN, 1)

# ReportBlockSheet component before DiscoverMatchModal
if "<ReportBlockSheet" not in text:
    text = text.replace(
        """      <DiscoverMatchModal
        visible={showMatch}""",
        """      {profile ? (
        <ReportBlockSheet
          visible={showModerationSheet}
          onClose={() => setShowModerationSheet(false)}
          targetUserId={profile.id}
          targetName={profile.name}
          onBlocked={handleBlockedFromDiscover}
        />
      ) : null}

      <DiscoverMatchModal
        visible={showMatch}""",
        1,
    )

# Safety button styles
if "profileSheetSafetyBtn" not in text:
    text = text.replace(
        """  profileSheetChatBtn: {""",
        """  profileSheetSafetyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileSheetSafetyText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: COLORS.sage,
  },
  profileSheetChatBtn: {""",
        1,
    )

PATH.write_text(text)
print("Patched Discovery final QA items")
