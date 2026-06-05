#!/usr/bin/env python3
"""Wire premium Discover graphics into screens/Discovery.tsx (disk only)."""
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text(encoding="utf-8")

# --- imports ---
old_imports = """import EmptyState from '../src/components/EmptyState';
import FilterSheet, {
  DEFAULT_DISCOVERY_FILTERS,
  hasActiveDiscoveryFilters,
  type DiscoveryFilters,
} from '../src/components/FilterSheet';"""

new_imports = """import { LinearGradient } from 'expo-linear-gradient';
import EmptyState from '../src/components/EmptyState';
import DiscoverChrome from '../src/components/DiscoverChrome';
import FilterSheet, {
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  countActiveDiscoveryFilters,
  hasActiveDiscoveryFilters,
  type DiscoveryFilters,
} from '../src/components/FilterSheet';
import {
  DiscoverActionDock,
  DiscoverMatchCelebration,
  DiscoverSwipeStamp,
} from '../src/components/discover';
import { GenoBrandHeader } from '../src/brand';
import { getGenotypeCompatibilityLine } from '../src/lib/compatibility';
import ProfileAvatar from '../src/components/ProfileAvatar';"""

if old_imports not in text:
    raise SystemExit("import block not found")
text = text.replace(old_imports, new_imports, 1)

# add ScrollView to react-native import
text = text.replace(
    "  Pressable,\n  StyleSheet,",
    "  Pressable,\n  ScrollView,\n  StyleSheet,",
    1,
)

# remove SUPER_LIKE_STAR_COUNT
text = text.replace("const SUPER_LIKE_STAR_COUNT = 6;\n\n", "")

# remove local applyDiscoveryFilters
start = text.find("function applyDiscoveryFilters(")
end = text.find("function getMatchLabel(", start)
if start == -1 or end == -1:
    raise SystemExit("applyDiscoveryFilters block not found")
text = text[:start] + text[end:]

# remove local getGenotypeCompatibilityLine
start = text.find("function getGenotypeCompatibilityLine(")
end = text.find("function getCompatDotColor(", start)
if start == -1 or end == -1:
    raise SystemExit("getGenotypeCompatibilityLine block not found")
text = text[:start] + text[end:]

# remove SuperLikeButton
start = text.find("type SuperLikeButtonProps = {")
end = text.find("function MatchPill({ percent }", start)
if start == -1 or end == -1:
    raise SystemExit("SuperLikeButton block not found")
text = text[:start] + text[end:]

# state: matchedProfile
text = text.replace(
    "  const [matchedName, setMatchedName] = useState('');\n",
    "  const [matchedName, setMatchedName] = useState('');\n"
    "  const [matchedProfile, setMatchedProfile] = useState<DiscoveryProfile | null>(null);\n",
    1,
)

# filters helpers after filtersActive
needle = "  const filtersActive = hasActiveDiscoveryFilters(filters);\n\n"
insert = """  const filtersActive = hasActiveDiscoveryFilters(filters);
  const activeFilterCount = countActiveDiscoveryFilters(filters);

  const matchCountForDraft = useCallback(
    (draft: DiscoveryFilters) => applyDiscoveryFilters(allProfiles, draft).length,
    [allProfiles]
  );

  const todaysPicks = useMemo(() => {
    return [...profiles]
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 5);
  }, [profiles]);

"""
if needle not in text:
    raise SystemExit("filtersActive block not found")
text = text.replace(needle, insert, 1)

# dismissMatchOverlay
text = text.replace(
    "  const dismissMatchOverlay = useCallback(() => {\n    setShowMatch(false);\n  }, []);\n",
    "  const dismissMatchOverlay = useCallback(() => {\n    setShowMatch(false);\n    setMatchedProfile(null);\n  }, []);\n",
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
    1,
)

text = text.replace("showMatchOverlay(firstName);", "showMatchOverlay(firstName, profile);", 2)

# screen root chrome + header
old_header_block = """      <View style={styles.screenRoot}>
        {superLikeToast ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.superLikeToast,
              {
                opacity: superLikeToastOpacity,
                transform: [{ translateY: superLikeToastY }],
              },
            ]}
          >
            <Text style={styles.superLikeToastText}>⭐ Super Liked!</Text>
          </Animated.View>
        ) : null}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Discover</Text>
            <Pressable
              style={({ pressed }) => [styles.filterBtn, pressed && styles.filterBtnPressed]}
              onPress={() => setShowFilterSheet(true)}
              accessibilityLabel="Filter discovery profiles"
            >
              <Ionicons name="options-outline" size={24} color={COLORS.forest} />
              {filtersActive ? <View style={styles.filterDot} /> : null}
            </Pressable>
          </View>
          <Text style={styles.headerSubtitle}>
            {usingMockFallback
              ? 'Preview profiles — real matches appear as members join'
              : 'Genotype-aware matches near you'}
          </Text>
        </View>

        <FilterSheet
          visible={showFilterSheet}
          filters={filters}
          onClose={() => setShowFilterSheet(false)}
          onApply={setFilters}
        />"""

new_header_block = """      <View style={styles.screenRoot}>
        <DiscoverChrome />
        {superLikeToast ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.superLikeToast,
              {
                opacity: superLikeToastOpacity,
                transform: [{ translateY: superLikeToastY }],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.gold, '#C49A3A']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.superLikeToastGradient}
            >
              <Ionicons name="star" size={16} color={COLORS.forestDeep} />
              <Text style={styles.superLikeToastText}>Super Liked</Text>
            </LinearGradient>
          </Animated.View>
        ) : null}
        <GenoBrandHeader
          kicker="GENOMATCH DISCOVER"
          title="Discover"
          subtitle={
            usingMockFallback
              ? 'Preview stack — live members join daily'
              : `${profiles.length} profile${profiles.length === 1 ? '' : 's'} in your stack`
          }
          style={styles.brandHeader}
          right={
            <Pressable
              style={({ pressed }) => [styles.filterBtn, pressed && styles.filterBtnPressed]}
              onPress={() => setShowFilterSheet(true)}
              accessibilityLabel="Filter discovery profiles"
            >
              <Ionicons name="options-outline" size={22} color={COLORS.forestDeep} />
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              ) : filtersActive ? (
                <View style={styles.filterDot} />
              ) : null}
            </Pressable>
          }
        />

        {!loading && !isEmpty && todaysPicks.length > 0 && !seenAll ? (
          <View style={styles.picksSection}>
            <View style={styles.picksHeader}>
              <Ionicons name="flame" size={16} color={COLORS.gold} />
              <Text style={styles.picksTitle}>Today&apos;s picks</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.picksScroll}
            >
              {todaysPicks.map((pick) => (
                <View key={pick.id} style={styles.pickChip}>
                  <ProfileAvatar
                    name={pick.name}
                    gradient={pick.gradient}
                    avatarUrl={pick.avatarUrl ?? pick.photos[0]}
                    size={40}
                  />
                  <View style={styles.pickMeta}>
                    <Text style={styles.pickName} numberOfLines={1}>
                      {pick.name.split(' ')[0]}
                    </Text>
                    <Text style={styles.pickCompat}>{pick.compatibility}%</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <FilterSheet
          visible={showFilterSheet}
          filters={filters}
          onClose={() => setShowFilterSheet(false)}
          onApply={setFilters}
          totalPoolCount={allProfiles.length}
          matchCountForDraft={matchCountForDraft}
        />"""

if old_header_block not in text:
    raise SystemExit("header block not found")
text = text.replace(old_header_block, new_header_block, 1)

# deck frame wrap
text = text.replace(
    "            <View style={styles.deckColumn}>\n              <View style={styles.deckCardSlot}>",
    """            <View style={styles.deckColumn}>
              <View style={styles.deckFrame}>
                <LinearGradient
                  colors={['rgba(212, 168, 67, 0.55)', 'rgba(61, 122, 82, 0.35)', 'rgba(212, 168, 67, 0.45)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.deckFrameBorder}
                >
                  <View style={styles.deckFrameInner}>
              <View style={styles.deckCardSlot}>""",
    1,
)

text = text.replace(
    """                </View>
              </View>

              <View style={styles.actions}>""",
    """                </View>
              </View>
                  </View>
                </LinearGradient>
              </View>

              <DiscoverActionDock""",
    1,
)

# replace actions block end
old_actions = """              <DiscoverActionDock
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

if old_actions not in text:
    raise SystemExit("actions block not found")
text = text.replace(old_actions, new_actions, 1)

# stamps
text = text.replace(
    """                          <Animated.View
                            style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}
                          >
                            <Text style={styles.stampLikeText}>LIKE</Text>
                          </Animated.View>
                          <Animated.View
                            style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]}
                          >
                            <Text style={styles.stampNopeText}>NOPE</Text>
                          </Animated.View>""",
    """                          <DiscoverSwipeStamp side="like" opacity={likeOpacity} />
                          <DiscoverSwipeStamp side="nope" opacity={nopeOpacity} />""",
    1,
)

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

if old_match not in text:
    raise SystemExit("match modal not found")
text = text.replace(old_match, new_match, 1)

# styles updates
text = text.replace(
    """  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TYPOGRAPHY.display,
    fontFamily: 'ClashDisplay-Semibold',
    flex: 1,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(143, 175, 149, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnPressed: {
    opacity: 0.88,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Satoshi-Medium',
    marginTop: 4,
    marginBottom: 8,
  },""",
    """  brandHeader: {
    zIndex: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filterBtnPressed: {
    opacity: 0.88,
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 10,
    color: COLORS.forestDeep,
  },
  picksSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 2,
  },
  picksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  picksTitle: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.forest,
  },
  picksScroll: {
    gap: 10,
    paddingRight: 20,
  },
  pickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 160,
  },
  pickMeta: {
    gap: 2,
    flexShrink: 1,
  },
  pickName: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 13,
    color: COLORS.forestDeep,
  },
  pickCompat: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 11,
    color: COLORS.gold,
  },
  deckFrame: {
    borderRadius: 22,
    padding: 2,
    marginBottom: 4,
  },
  deckFrameBorder: {
    borderRadius: 22,
    padding: 2,
  },
  deckFrameInner: {
    borderRadius: 20,
    backgroundColor: COLORS.linen,
    overflow: 'hidden',
  },""",
    1,
)

# super like toast styles
text = text.replace(
    "  superLikeToast: {",
    "  superLikeToast: {\n    borderRadius: 999,\n    overflow: 'hidden',\n  },\n  superLikeToastGradient: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    gap: 8,\n    paddingHorizontal: 18,\n    paddingVertical: 10,\n  },\n  superLikeToastOld: {",
    1,
)
# fix accidental rename - do cleaner replace
if "superLikeToastOld" in text:
    text = text.replace(
        """  superLikeToast: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  superLikeToastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  superLikeToastOld: {""",
        "  superLikeToast: {\n    borderRadius: 999,\n    overflow: 'hidden',\n  },\n  superLikeToastGradient: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    gap: 8,\n    paddingHorizontal: 18,\n    paddingVertical: 10,\n  },\n  superLikeToastPlaceholder: {",
        1,
    )
    # find original superLikeToast block and merge
    import re
    text = re.sub(
        r"  superLikeToastPlaceholder: \{[^}]+\},\n  superLikeToastGradient:[^}]+\},\n",
        "",
        text,
        count=1,
    )

# simpler: grep superLikeToast in file after patch - fix in second pass

# remove match modal styles
for block in [
    "  matchModalBackdrop:",
    "  matchCard:",
    "  matchTitle:",
    "  matchSubtitle:",
    "  matchIconWrap:",
    "  matchContinueBtn:",
    "  matchContinueBtnPressed:",
    "  matchContinueText:",
]:
    pass

import re

def remove_style_key(content: str, key: str) -> str:
    pattern = rf"  {re.escape(key)} \{{[^}}]*\}},?\n"
    return re.sub(pattern, "", content, count=1)

for key in [
    "matchModalBackdrop",
    "matchCard",
    "matchTitle",
    "matchSubtitle",
    "matchIconWrap",
    "matchContinueBtn",
    "matchContinueBtnPressed",
    "matchContinueText",
    "stamp",
    "stampLike",
    "stampNope",
    "stampLikeText",
    "stampNopeText",
    "actions",
    "passBtn",
    "likeBtn",
    "superLikeBtnWrap",
    "superLikeBtn",
    "superLikeBurstStar",
]:
    text = remove_style_key(text, key)

# fix superLikeToastText color
text = text.replace(
    "  superLikeToastText: {",
    "  superLikeToast: {\n    borderRadius: 999,\n    overflow: 'hidden',\n  },\n  superLikeToastGradient: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    gap: 8,\n    paddingHorizontal: 18,\n    paddingVertical: 10,\n  },\n  superLikeToastText: {",
    1,
)
text = text.replace(
    "    color: COLORS.linen,\n    fontWeight: '700',\n    fontSize: 15,\n  },\n  superLikeToast: {",
    "    fontFamily: 'Satoshi-Bold',\n    fontSize: 14,\n    color: COLORS.forestDeep,\n  },\n  superLikeToastDup: {",
    1,
)
text = re.sub(r"  superLikeToastDup: \{[^}]+\},\n  superLikeToastGradient: \{[^}]+\},\n", "", text, count=1)

text = text.replace("screenRoot: {\n    flex: 1,\n  },", "screenRoot: {\n    flex: 1,\n    position: 'relative',\n  },", 1)

PATH.write_text(text, encoding="utf-8")
print(f"Patched {PATH} ({len(text.splitlines())} lines)")
