#!/usr/bin/env python3
"""Wire premium swipe card, match celebration, action dock, filter preview."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text(encoding="utf-8")

# --- imports: add discover components ---
old = """import { DiscoverSeenAllState, GenoDiscoverHeader } from '../src/components/discover';"""
new = """import {
  DiscoverActionDock,
  DiscoverMatchCelebration,
  DiscoverSeenAllState,
  DiscoverSwipeCard,
  DiscoverSwipeStamp,
  GenoDiscoverHeader,
} from '../src/components/discover';
import { getGenotypeRiskShort } from '../src/lib/compatibility';"""

if old in text and "DiscoverSwipeCard" not in text:
    text = text.replace(old, new)

# remove getGenotypeCompatibilityLine local if still present
start = text.find("function getGenotypeCompatibilityLine(")
if start != -1:
    end = text.find("function getCompatDotColor(", start)
    if end != -1:
        text = text[:start] + text[end:]

# remove getCompatDotColor if only used in removed ProfileCard - DiscoverSwipeCard has own
start = text.find("function getCompatDotColor(")
if start != -1:
    end = text.find("function MatchPill", start)
    if end == -1:
        end = text.find("type SuperLikeButtonProps", start)
    if end != -1:
        text = text[:start] + text[end:]

# remove SuperLikeButton block
start = text.find("type SuperLikeButtonProps = {")
if start != -1:
    end = text.find("function MatchPill({ percent }", start)
    if end == -1:
        end = text.find("type ProfileCardProps", start)
    if end != -1:
        text = text[:start] + text[end:]

# remove MatchPill + ProfileCard
start = text.find("function MatchPill({ percent }")
if start != -1:
    end = text.find("export default function Discovery()", start)
    if end != -1:
        text = text[:start] + text[end:]

# matchedProfile state
if "matchedProfile" not in text:
    text = text.replace(
        "  const [matchedName, setMatchedName] = useState('');\n",
        "  const [matchedName, setMatchedName] = useState('');\n"
        "  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);\n",
        1,
    )

# showMatchOverlay
text = text.replace(
    """  const showMatchOverlay = useCallback((name: string) => {
    triggerMatchCelebrationHaptic();
    setMatchedName(name);
    setShowMatch(true);
  }, []);""",
    """  const showMatchOverlay = useCallback((name: string, matched: DiscoveryProfile) => {
    triggerMatchCelebrationHaptic();
    setMatchedName(name);
    setMatchedProfile(matched);
    setShowMatch(true);
  }, []);""",
)

text = text.replace(
    "  const dismissMatchOverlay = useCallback(() => {\n    setShowMatch(false);\n  }, []);\n",
    "  const dismissMatchOverlay = useCallback(() => {\n    setShowMatch(false);\n    setMatchedProfile(null);\n  }, []);\n",
)

text = text.replace("showMatchOverlay(firstName);", "showMatchOverlay(firstName, profile);")

# filter preview count
if "previewCount=" not in text:
    text = text.replace(
        """        <FilterSheet
          visible={showFilterSheet}
          filters={filters}
          onClose={() => setShowFilterSheet(false)}
          onApply={setFilters}
        />""",
        """        <FilterSheet
          visible={showFilterSheet}
          filters={filters}
          previewCount={applyDiscoveryFilters(allProfiles, filters).length}
          onClose={() => setShowFilterSheet(false)}
          onApply={setFilters}
        />""",
    )

# ProfileCard -> DiscoverSwipeCard
text = text.replace("<ProfileCard", "<DiscoverSwipeCard")
text = text.replace("</ProfileCard>", "</DiscoverSwipeCard>")

# stamps
old_stamps = """                          <Animated.View
                            style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}
                          >
                            <Text style={styles.stampLikeText}>LIKE</Text>
                          </Animated.View>
                          <Animated.View
                            style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}
                          >
                            <Text style={styles.stampNopeText}>NOPE</Text>
                          </Animated.View>"""

new_stamps = """                          <DiscoverSwipeStamp side="like" opacity={likeOpacity} />
                          <DiscoverSwipeStamp side="nope" opacity={nopeOpacity} />"""

if old_stamps in text:
    text = text.replace(old_stamps, new_stamps)

# action dock
old_actions = """              <View style={styles.actions}>
                {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
                <Pressable
                  style={({ pressed }) => [styles.passBtn, pressed && styles.btnPressed]}
                  onPress={handlePass}
                  disabled={showMatch}
                >
                  <Ionicons name="close" size={24} color="#8FAF95" />
                </Pressable>
                <SuperLikeButton onPress={handleSuperLike} disabled={showMatch} />
                <Animated.View style={{ transform: [{ scale: likePulseScale }] }}>
                  <Pressable
                    style={({ pressed }) => [styles.likeBtn, pressed && styles.btnPressed]}
                    onPress={handleLike}
                    disabled={showMatch}
                  >
                    <Ionicons name="heart" size={28} color="#FFFFFF" />
                  </Pressable>
                </Animated.View>
              </View>"""

new_actions = """              <DiscoverActionDock
                onPass={handlePass}
                onLike={handleLike}
                onSuperLike={handleSuperLike}
                likePulseScale={likePulseScale}
                disabled={showMatch}
                errorText={actionError || undefined}
              />"""

if old_actions in text:
    text = text.replace(old_actions, new_actions)

# match modal
old_match = """      <Modal
        visible={showMatch}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={dismissMatchOverlay}
      >
        <View style={styles.matchModalBackdrop}>
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle} numberOfLines={1}>
              It's a Match!
            </Text>
            <Text style={styles.matchSubtitle} numberOfLines={1}>
              You matched with {matchedName}!
            </Text>
            <View style={styles.matchIconWrap}>
              <Ionicons name="heart" size={44} color="#D4A843" />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.matchContinueBtn,
                pressed && styles.matchContinueBtnPressed,
              ]}
              onPress={dismissMatchOverlay}
            >
              <Text style={styles.matchContinueText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>"""

new_match = """      <DiscoverMatchCelebration
        visible={showMatch}
        matchName={matchedName}
        profile={matchedProfile}
        onContinue={dismissMatchOverlay}
      />"""

if old_match in text:
    text = text.replace(old_match, new_match)

PATH.write_text(text, encoding="utf-8")
print("Patched", PATH)
