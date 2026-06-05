#!/usr/bin/env python3
"""Harmonize Discovery.tsx visual tokens with profile/inbox design system."""

from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "screens" / "Discovery.tsx"
text = PATH.read_text()

replacements = [
    ("paddingHorizontal: 24,\n    paddingBottom: 0,", "paddingHorizontal: 16,\n    paddingBottom: 0,"),
    ("paddingHorizontal: 20,\n    paddingTop: 8,", "paddingHorizontal: 16,\n    paddingTop: 6,"),
    ("borderRadius: 24,", "borderRadius: 20,"),
    ("backgroundColor: '#1A3D28',", "backgroundColor: COLORS.forest,"),
    ("backgroundColor: '#D4A843',", "backgroundColor: COLORS.gold,"),
    ("shadowColor: '#000',", "shadowColor: COLORS.forestDeep,"),
    ("shadowOpacity: 0.22,", "shadowOpacity: 0.14,"),
    ("shadowRadius: 20,", "shadowRadius: 16,"),
    ("elevation: 12,", "elevation: 6,"),
]

for old, new in replacements:
    if old not in text:
        print(f"SKIP (not found): {old[:50]!r}...")
    else:
        text = text.replace(old, new)
        print(f"OK: {old[:40]!r}")

PATH.write_text(text)
print(f"Wrote {PATH}")
