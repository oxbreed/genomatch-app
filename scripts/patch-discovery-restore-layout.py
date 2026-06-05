#!/usr/bin/env python3
"""Restore Discover deck proportions — larger cards, original gutters, action sizing."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

replacements = [
    (
        "  deckArea: {\n    flex: 1,\n    paddingHorizontal: 16,\n    paddingTop: 6,\n    paddingBottom: 4,\n  },",
        "  deckArea: {\n    flex: 1,\n    paddingHorizontal: 20,\n    paddingTop: 12,\n    paddingBottom: 6,\n  },",
    ),
    (
        "  header: {\n    paddingTop: 58,\n    paddingHorizontal: 16,\n    paddingBottom: 0,\n  },",
        "  header: {\n    paddingTop: 58,\n    paddingHorizontal: 20,\n    paddingBottom: 0,\n  },",
    ),
    ("    borderRadius: 20,\n    width: '100%',\n  },\n  cardBehindClip:", "    borderRadius: 24,\n    width: '100%',\n  },\n  cardBehindClip:"),
    (
        "  card: {\n    width: '100%',\n    height: CARD_HEIGHT,\n    borderRadius: 20,",
        "  card: {\n    width: '100%',\n    height: CARD_HEIGHT,\n    borderRadius: 24,",
    ),
    (
        "  cardBody: {\n    width: '100%',\n    height: CARD_HEIGHT,\n    borderRadius: 20,",
        "  cardBody: {\n    width: '100%',\n    height: CARD_HEIGHT,\n    borderRadius: 24,",
    ),
    (
        "  actionBar: {\n    width: '100%',\n    paddingTop: 8,\n    paddingBottom: 4,\n    alignItems: 'center',\n  },",
        "  actionBar: {\n    width: '100%',\n    paddingTop: 12,\n    paddingBottom: 6,\n    alignItems: 'center',\n  },",
    ),
    (
        "  actions: {\n    flexDirection: 'row',\n    justifyContent: 'center',\n    alignItems: 'center',\n    gap: 20,\n  },",
        "  actions: {\n    flexDirection: 'row',\n    justifyContent: 'center',\n    alignItems: 'center',\n    gap: 24,\n  },",
    ),
    (
        "  passBtn: {\n    width: 54,\n    height: 54,\n    borderRadius: 27,",
        "  passBtn: {\n    width: 60,\n    height: 60,\n    borderRadius: 30,",
    ),
    (
        "  likeBtn: {\n    width: 64,\n    height: 64,\n    borderRadius: 32,",
        "  likeBtn: {\n    width: 72,\n    height: 72,\n    borderRadius: 36,",
    ),
]

# superLikeBtn — restore if shrunk
if "  superLikeBtn: {\n    width: 50," in text:
    replacements.append(
        (
            "  superLikeBtn: {\n    width: 50,\n    height: 50,\n    borderRadius: 25,",
            "  superLikeBtn: {\n    width: 52,\n    height: 52,\n    borderRadius: 26,",
        )
    )

for old, new in replacements:
    if old not in text:
        print(f"SKIP: {old[:48]!r}...")
    else:
        text = text.replace(old, new, 1)
        print(f"OK: {old[:40]!r}")

PATH.write_text(text)
print(f"Wrote {PATH}")
