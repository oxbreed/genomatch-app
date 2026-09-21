#!/usr/bin/env python3
"""Build store-compliant app icons from the transparent ribbon master.

App Store Connect requires the marketing icon to be a square PNG, 1024x1024,
fully opaque, no alpha channel. Android adaptive foregrounds are the opposite:
square, transparent, and with the mark inside the 66% safe zone so the launcher
can mask it without clipping.

Run: python3 scripts/build-app-icons.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "assets" / "genomatch-ribbon-logo-v11.png"
OUT = ROOT / "assets"

SIZE = 1024
# Fraction of the canvas the mark occupies. Apple masks the icon to a rounded
# rect, so a full-bleed mark reads as cramped and gets its edges clipped.
IOS_INSET = 0.74
# Android masks aggressively; the safe zone is the centre 66%.
ANDROID_INSET = 0.60


def load_trimmed() -> Image.Image:
    img = Image.open(MASTER).convert("RGBA")
    box = img.getbbox()
    if box:
        img = img.crop(box)
    return img


def compose(mark: Image.Image, inset: float, background: str | None) -> Image.Image:
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

    target = int(SIZE * inset)
    scale = min(target / mark.width, target / mark.height)
    w, h = max(1, round(mark.width * scale)), max(1, round(mark.height * scale))
    resized = mark.resize((w, h), Image.LANCZOS)

    canvas.paste(resized, ((SIZE - w) // 2, (SIZE - h) // 2), resized)

    if background is None:
        return canvas

    plate = Image.new("RGBA", (SIZE, SIZE), background)
    plate.alpha_composite(canvas)
    # Apple rejects icons that carry an alpha channel at all.
    return plate.convert("RGB")


def main() -> None:
    if not MASTER.exists():
        raise SystemExit(f"master not found: {MASTER}")

    mark = load_trimmed()

    targets = [
        ("icon.png", IOS_INSET, "#FFFFFF"),
        ("icon-dark.png", IOS_INSET, "#0B0C0E"),
        ("adaptive-icon.png", ANDROID_INSET, None),
        ("splash-icon.png", 0.62, None),
    ]

    for name, inset, background in targets:
        out = compose(mark, inset, background)
        path = OUT / name
        out.save(path, "PNG", optimize=True)
        print(f"{name:22s} {out.size[0]}x{out.size[1]} {out.mode:5s} {path.stat().st_size / 1024:7.1f} kB")

    favicon = compose(mark, IOS_INSET, "#FFFFFF").resize((48, 48), Image.LANCZOS)
    favicon.save(OUT / "favicon.png", "PNG", optimize=True)
    print(f"{'favicon.png':22s} 48x48 {favicon.mode}")


if __name__ == "__main__":
    main()
