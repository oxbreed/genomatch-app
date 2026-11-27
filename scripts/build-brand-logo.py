#!/usr/bin/env python3
"""Build every brand logo asset from the master ribbon artwork.

The master is supplied on a white studio background. Screens render the mark on
brand black and on cream, so the white has to become real alpha — including the
enclosed loops inside each heart, which a border flood fill would never reach.
Specular highlights on the ribbon are near-white but still tinted, so the
background test keys on neutrality rather than brightness alone.

Usage: python3 scripts/build-brand-logo.py <master.png>
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

BRAND_BLACK = (11, 12, 14, 255)

# Ink is the saturated ribbon. The dimmest ribbon tone is the gold specular
# highlight (252,227,150) at 0.40; the brightest ground tone is the tinted halo
# around the crossing at roughly 0.13.
INK_MIN_SATURATION = 0.32
SHADOW_ALPHA_FLOOR = 48


def straight_alpha(master: Image.Image) -> Image.Image:
    """Recover the ink with straight alpha from ink-over-white."""
    src = master.convert("RGBA")
    width, height = src.size
    pixels = src.load()

    # Every part of the ribbon is strongly coloured, so saturation separates ink
    # from ground. The white plate, its soft shadow and the tinted halo around
    # the crossing are all weakly saturated: those get an alpha ramp from how
    # far they sit from white, which keeps the shadow soft instead of leaving a
    # hard grey fringe on brand black.
    alpha = Image.new("L", src.size, 255)
    alpha_px = alpha.load()
    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            low, high = min(r, g, b), max(r, g, b)
            saturation = 0 if high == 0 else (high - low) / high
            if saturation < INK_MIN_SATURATION:
                alpha_px[x, y] = 255 - low

    feathered = alpha.filter(ImageFilter.MedianFilter(3)).filter(
        ImageFilter.GaussianBlur(radius=0.6)
    )
    # Drop the faintest shadow tail. Left in, it reads as a grey haze around the
    # crossing on brand black; real ribbon edges are far more opaque than this.
    feathered = feathered.point(lambda v: 0 if v < SHADOW_ALPHA_FLOOR else v)
    feather_px = feathered.load()

    out = Image.new("RGBA", src.size)
    out_px = out.load()
    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            a = feather_px[x, y]
            if a <= 0:
                out_px[x, y] = (0, 0, 0, 0)
                continue
            if a < 255:
                # Undo the white the master composited over.
                scale = a / 255
                r = min(255, max(0, round((r - 255 * (1 - scale)) / scale)))
                g = min(255, max(0, round((g - 255 * (1 - scale)) / scale)))
                b = min(255, max(0, round((b - 255 * (1 - scale)) / scale)))
            out_px[x, y] = (r, g, b, a)
    return out


def square_trim(mark: Image.Image, size: int, pad_ratio: float = 0.0) -> Image.Image:
    """Trim to the ink, then centre it on a square canvas."""
    box = mark.getbbox()
    ink = mark.crop(box)
    inner = round(size * (1 - pad_ratio * 2))
    ink.thumbnail((inner, inner), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(
        ink,
        ((size - ink.width) // 2, (size - ink.height) // 2),
        ink,
    )
    return canvas


def on_black(mark: Image.Image) -> Image.Image:
    plate = Image.new("RGBA", mark.size, BRAND_BLACK)
    plate.alpha_composite(mark)
    return plate.convert("RGB")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)

    master = Image.open(sys.argv[1])
    mark = straight_alpha(master)

    # Canonical transparent marks.
    full = square_trim(mark, 1024)
    small = square_trim(mark, 192)

    writes = {
        "genomatch-logo-mark.png": full,
        "genomatch-logo-mark-small.png": small,
        # Legacy names kept so existing imports resolve; both surfaces now use
        # the same transparent ink.
        "genomatch-logo-light.png": full,
        "genomatch-logo-dark.png": full,
        # Splash / onboarding poster.
        "genomatch-ribbon-logo-v11.png": square_trim(mark, 1024),
        # Store + launcher art.
        "adaptive-icon.png": square_trim(mark, 1024, pad_ratio=0.22),
        "splash-icon.png": square_trim(mark, 1024, pad_ratio=0.06),
        "favicon.png": square_trim(mark, 64, pad_ratio=0.04),
    }

    for name, image in writes.items():
        image.save(ASSETS / name)
        print(f"wrote assets/{name} {image.size}")

    icon = on_black(square_trim(mark, 1024, pad_ratio=0.14))
    icon.save(ASSETS / "icon.png")
    print(f"wrote assets/icon.png {icon.size} (brand black plate)")


if __name__ == "__main__":
    main()
