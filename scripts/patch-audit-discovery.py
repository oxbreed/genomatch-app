#!/usr/bin/env python3
"""Visual audit fixes for Discovery.tsx (apply on disk)."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

# Subtitle — single line
text = text.replace(
    """  const discoverSubtitle = usingMockFallback
    ? 'Preview profiles — real matches appear as members join'
    : 'Genotype-aware matches near you';""",
    "  const discoverSubtitle = 'Find your perfect genotype match';",
    1,
)

# Header separator before deck
needle = """        />

        <FilterSheet"""
insert = """        />

        <View style={styles.headerDivider} />

        <FilterSheet"""
if "headerDivider" not in text:
    text = text.replace(needle, insert, 1)

# Loading indicator gold
text = text.replace(
    '<ActivityIndicator size="large" color={COLORS.forest} />',
    '<ActivityIndicator size="large" color={COLORS.gold} />',
    1,
)

# Empty states — premium fill, no white box wrapper styling
text = text.replace(
    """          ) : isEmpty ? (
            <View style={styles.emptyState}>
              <EmptyState""",
    """          ) : isEmpty ? (
            <View style={styles.emptyFill}>
              <EmptyState""",
    1,
)
text = text.replace(
    """          ) : isFilteredEmpty ? (
            <View style={styles.emptyState}>
              <EmptyState""",
    """          ) : isFilteredEmpty ? (
            <View style={styles.emptyFill}>
              <EmptyState""",
    1,
)

# MatchPill — remove label under badge (right-edge clutter)
text = text.replace(
    """      <View style={styles.matchPill}>
        <Text style={styles.matchPillText}>{percent}%</Text>
      </View>
      <Text style={styles.matchPillLabel}>{getMatchLabel(percent)}</Text>""",
    """      <View style={styles.matchPill}>
        <Text style={styles.matchPillText}>{percent}%</Text>
      </View>""",
    1,
)

# Styles — card radius 16, action buttons, typography, separator, empty fill
replacements = [
    (
        """  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },""",
        """  headerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },""",
    ),
    ("borderRadius: 24,", "borderRadius: RADIUS.md,"),
    (
        """  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.forest,
    shadowColor: COLORS.forestDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },""",
        """  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.forest,
    ...SHADOWS.card,
  },""",
    ),
    (
        """  cardName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },""",
        """  cardName: {
    fontFamily: 'ClashDisplay-Semibold',
    fontSize: 26,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    flexShrink: 1,
  },""",
    ),
    (
        """  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },""",
        """  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },""",
    ),
    (
        """  matchPill: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  matchPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.forest,
  },""",
        """  matchPill: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  matchPillText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16,
    color: COLORS.forest,
  },""",
    ),
    (
        """  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,""",
        """  passBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,""",
    ),
    (
        """  likeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,""",
        """  likeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,""",
    ),
    (
        """  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    ...SHADOWS.card,
  },""",
        """  emptyFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginBottom: 8,
  },""",
    ),
    (
        """  cardDragTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    zIndex: 8,
  },""",
        """  cardDragTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.md,
    zIndex: 8,
  },""",
    ),
    (
        """  cardMediaImage: {
    borderRadius: 20,
  },""",
        """  cardMediaImage: {
    borderRadius: RADIUS.md,
  },""",
    ),
]

for old, new in replacements:
    if old in text:
        text = text.replace(old, new, 1)

# Hide behind-card peek (grey edge artifact on swipe cards)
text = text.replace(
    """                    if (isBehind) {
                      return (
                        <Animated.View
                          key={stackProfile.id}
                          pointerEvents="none"
                          style={[
                            styles.cardBehindPeek,
                            styles.cardInStack,
                            {
                              zIndex: depthFromTop,
                              opacity: 0.7,
                              transform: [{ scale: 0.96 }],
                            },
                          ]}
                        >
                          <View style={styles.cardBehindClip}>
                            <View style={styles.cardBehindClipInner}>
                              <ProfileCard profile={stackProfile} />
                            </View>
                          </View>
                        </Animated.View>
                      );
                    }""",
    "                    if (isBehind) {\n                      return null;\n                    }",
    1,
)

PATH.write_text(text)
print("Discovery audit patch applied")
