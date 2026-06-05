#!/usr/bin/env python3
"""Replace inline match modal with DiscoverMatchModal component."""

from pathlib import Path
import re

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

if "DiscoverMatchModal" in text:
    print("Already patched")
    raise SystemExit(0)

# Import
OLD_IMPORT = "import { DiscoverSeenAllState } from '../src/components/discover';"
NEW_IMPORT = "import { DiscoverMatchModal, DiscoverSeenAllState } from '../src/components/discover';"
if OLD_IMPORT not in text:
    raise SystemExit("Import anchor not found")
text = text.replace(OLD_IMPORT, NEW_IMPORT, 1)

# State
OLD_STATE = "  const [matchedName, setMatchedName] = useState('');"
NEW_STATE = """  const [matchedName, setMatchedName] = useState('');
  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);"""
text = text.replace(OLD_STATE, NEW_STATE, 1)

# showMatchOverlay
OLD_OVERLAY = """  const showMatchOverlay = useCallback((name: string) => {
    triggerMatchCelebrationHaptic();
    setMatchedName(name);
    setShowMatch(true);
  }, []);"""

NEW_OVERLAY = """  const showMatchOverlay = useCallback((name: string, matched: DiscoveryProfile) => {
    triggerMatchCelebrationHaptic();
    setMatchedName(name);
    setMatchedProfile(matched);
    setShowMatch(true);
  }, []);"""
text = text.replace(OLD_OVERLAY, NEW_OVERLAY, 1)

# dismiss
OLD_DISMISS = """  const dismissMatchOverlay = useCallback(() => {
    setShowMatch(false);
  }, []);"""
NEW_DISMISS = """  const dismissMatchOverlay = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
  }, []);"""
text = text.replace(OLD_DISMISS, NEW_DISMISS, 1)

# showMatchOverlay calls
text = text.replace("showMatchOverlay(firstName);", "showMatchOverlay(firstName, profile);")

# Replace modal block
OLD_MODAL = re.compile(
    r"""      <Modal
        visible=\{showMatch\}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose=\{dismissMatchOverlay\}
      >
        <View style=\{styles\.matchModalBackdrop\}>
          <View style=\{styles\.matchCard\}>
            <Text style=\{styles\.matchTitle\} numberOfLines=\{1\}>
              It's a Match!
            </Text>
            <Text style=\{styles\.matchSubtitle\} numberOfLines=\{1\}>
              You matched with \{matchedName\}!
            </Text>
            <View style=\{styles\.matchIconWrap\}>
              <Ionicons name="heart" size=\{44\} color="#D4A843" />
            </View>
            <Pressable
              style=\{\(\{ pressed \}\) => \[
                styles\.matchContinueBtn,
                pressed && styles\.matchContinueBtnPressed,
              \]\}
              onPress=\{dismissMatchOverlay\}
            >
              <Text style=\{styles\.matchContinueText\}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>""",
    re.MULTILINE,
)

NEW_MODAL = """      <DiscoverMatchModal
        visible={showMatch}
        matchName={matchedName}
        profile={matchedProfile}
        onContinue={dismissMatchOverlay}
      />"""

if not OLD_MODAL.search(text):
    raise SystemExit("Modal block not found")
text = OLD_MODAL.sub(NEW_MODAL, text, count=1)

# Remove old match styles
OLD_STYLES = re.compile(
    r"""  matchModalBackdrop: \{
    flex: 1,
    backgroundColor: 'rgba\(13,40,24,0\.97\)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  \},
  matchCard: \{
    backgroundColor: COLORS\.forest,
    borderRadius: 20,
    padding: 40,
    width: '100%',
    alignItems: 'center',
  \},
  matchTitle: \{
    fontSize: 34,
    fontWeight: '700',
    color: '#D4A843',
    width: '100%',
    textAlign: 'center',
    marginBottom: 12,
  \},
  matchSubtitle: \{
    fontFamily: 'Satoshi-Medium',
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  \},
  matchIconWrap: \{
    marginTop: 20,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  \},
  matchContinueBtn: \{
    width: '100%',
    backgroundColor: COLORS\.gold,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  \},
  matchContinueBtnPressed: \{
    opacity: 0\.88,
  \},
  matchContinueText: \{
    fontSize: 17,
    fontWeight: '700',
    color: COLORS\.forest,
  \},
\}\);""",
    re.MULTILINE,
)

text = OLD_STYLES.sub("});", text, count=1)

PATH.write_text(text)
print("Patched Discovery match modal")
