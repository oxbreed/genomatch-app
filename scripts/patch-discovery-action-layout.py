#!/usr/bin/env python3
"""Fix Discover action bar overlapping tab bar — card height + action dock layout."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

OLD_CONST = "const CARD_HEIGHT = SCREEN_HEIGHT * 0.55;"
NEW_CONST = """import { getDiscoveryCardHeight } from '../src/components/navigation/tabBarLayout';

const CARD_HEIGHT = getDiscoveryCardHeight(SCREEN_HEIGHT);"""

# Avoid duplicate import if run twice
if "getDiscoveryCardHeight" in text and OLD_CONST not in text:
    print("Discovery layout already patched")
    raise SystemExit(0)

if OLD_CONST not in text:
    raise SystemExit("CARD_HEIGHT anchor not found")

# Insert import near other component imports
ANCHOR = "import { GenoInboxHeader, GenoInboxIconButton } from '../src/components/inbox';"
if "tabBarLayout" not in text:
    text = text.replace(
        ANCHOR,
        ANCHOR + "\nimport { getDiscoveryCardHeight } from '../src/components/navigation/tabBarLayout';",
        1,
    )
    text = text.replace(OLD_CONST, "const CARD_HEIGHT = getDiscoveryCardHeight(SCREEN_HEIGHT);", 1)
else:
    text = text.replace(OLD_CONST, "const CARD_HEIGHT = getDiscoveryCardHeight(SCREEN_HEIGHT);", 1)

OLD_ACTIONS = """              <View style={styles.actions}>
                {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
                <Pressable"""

NEW_ACTIONS = """              <View style={styles.actionBar}>
                {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
                <View style={styles.actions}>
                <Pressable"""

if OLD_ACTIONS in text:
    text = text.replace(OLD_ACTIONS, NEW_ACTIONS, 1)
    # Close extra View after actions block
    old_close = """                </Animated.View>
              </View>
            </View>
          )}
        </View>"""
    new_close = """                </Animated.View>
                </View>
              </View>
            </View>
          )}
        </View>"""
    text = text.replace(old_close, new_close, 1)

OLD_DECK_COL = """  deckColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },"""

NEW_DECK_COL = """  deckColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },"""

text = text.replace(OLD_DECK_COL, NEW_DECK_COL, 1)

OLD_DECK_AREA = """  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },"""

NEW_DECK_AREA = """  deckArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },"""

text = text.replace(OLD_DECK_AREA, NEW_DECK_AREA, 1)

OLD_ACTIONS_STYLE = """  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 20,
    zIndex: 20,
  },"""

NEW_ACTIONS_STYLE = """  actionBar: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },"""

text = text.replace(OLD_ACTIONS_STYLE, NEW_ACTIONS_STYLE, 1)

OLD_PASS = """  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,"""

NEW_PASS = """  passBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,"""

text = text.replace(OLD_PASS, NEW_PASS, 1)

OLD_LIKE = """  likeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,"""

NEW_LIKE = """  likeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,"""

text = text.replace(OLD_LIKE, NEW_LIKE, 1)

OLD_SUPER = """  superLikeBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,"""

NEW_SUPER = """  superLikeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,"""

text = text.replace(OLD_SUPER, NEW_SUPER, 1)

PATH.write_text(text)
print("Patched Discovery action layout")
