#!/usr/bin/env python3
"""Build a clear transparent ribbon PNG from genomatch-logo-clean-source.png.

Cuts the red/gold ribbon only — no drop-shadow, no beige fringe, binary alpha.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets' / 'genomatch-logo-clean-source.png'
POSTER = ROOT / 'assets' / 'genomatch-ribbon-logo.png'
DISPLAY = ROOT / 'assets' / 'genomatch-ribbon-logo-display.png'
DARK = ROOT / 'assets' / 'genomatch-ribbon-logo-dark.png'
V11 = ROOT / 'assets' / 'genomatch-ribbon-logo-v11.png'
META = ROOT / 'assets' / 'genomatch-ribbon-meta.json'
TARGET = int(os.environ.get('LOGO_EXPORT_SIZE', '2048'))


def dilate(mask: np.ndarray, radius: int = 1) -> np.ndarray:
    out = mask.copy()
    for _ in range(radius):
        p = np.pad(out, 1, constant_values=False)
        out = (
            out
            | p[:-2, :-2]
            | p[:-2, 1:-1]
            | p[:-2, 2:]
            | p[1:-1, :-2]
            | p[1:-1, 1:-1]
            | p[1:-1, 2:]
            | p[2:, :-2]
            | p[2:, 1:-1]
            | p[2:, 2:]
        )
    return out


def erode(mask: np.ndarray, radius: int = 1) -> np.ndarray:
    out = mask.copy()
    for _ in range(radius):
        p = np.pad(out, 1, constant_values=True)
        out = (
            out
            & p[:-2, :-2]
            & p[:-2, 1:-1]
            & p[:-2, 2:]
            & p[1:-1, :-2]
            & p[1:-1, 1:-1]
            & p[1:-1, 2:]
            & p[2:, :-2]
            & p[2:, 1:-1]
            & p[2:, 2:]
        )
    return out


def edge_pixels(mask: np.ndarray) -> np.ndarray:
    """Opaque pixels that touch a transparent neighbor."""
    p = np.pad(mask, 1, constant_values=False)
    fully_inside = (
        p[:-2, :-2]
        & p[:-2, 1:-1]
        & p[:-2, 2:]
        & p[1:-1, :-2]
        & p[1:-1, 1:-1]
        & p[1:-1, 2:]
        & p[2:, :-2]
        & p[2:, 1:-1]
        & p[2:, 2:]
    )
    return mask & ~fully_inside


def main() -> int:
    if not SRC.is_file():
        raise SystemExit(f'Missing source: {SRC}')

    src = Image.open(SRC).convert('RGB')
    # 3× upsample for cleaner cut
    work = src.resize((src.width * 3, src.height * 3), Image.Resampling.LANCZOS)
    rgb = np.array(work, dtype=np.float32)
    h, w = rgb.shape[:2]
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    sat = rgb.std(axis=2)
    lum = rgb.mean(axis=2)
    chroma = np.abs(r - g) + np.abs(g - b)
    yellow = np.minimum(r - b, g - b)

    border = np.concatenate(
        [
            rgb[:16, :].reshape(-1, 3),
            rgb[-16:, :].reshape(-1, 3),
            rgb[:, :16].reshape(-1, 3),
            rgb[:, -16:].reshape(-1, 3),
        ]
    )
    plate = np.median(border, axis=0)
    dist = np.linalg.norm(rgb - plate, axis=2)

    # Soft gray/beige drop shadow under the mark — never keep these.
    shadow = (
        (sat < 28)
        & (chroma < 48)
        & (yellow < 42)
        & (dist > 4)
        & (dist < 110)
        & (lum > 145)
        & (lum < 245)
    )

    red = (
        (r > g + 18)
        & (r > b + 22)
        & (r > 85)
        & (sat > 22)
        & (chroma > 36)
        & ~shadow
    )
    gold = (
        (r > 100)
        & (g > 75)
        & (g > b + 16)
        & (r > b + 28)
        & (yellow > 22)
        & (sat > 18)
        & (chroma > 34)
        & (r >= g - 18)
        & ~shadow
        & ~red
    )
    fg = red | gold

    # Grow into strongly chromatic neighbors only (fills tiny holes, not the shadow).
    for _ in range(4):
        ring = dilate(fg, 1) & ~fg
        take = (
            ring
            & ~shadow
            & (dist > 22)
            & (chroma > 30)
            & (sat > 16)
            & (yellow > 12)
            & ~((lum > 210) & (sat < 24))
        )
        if not take.any():
            break
        fg |= take

    fg = erode(dilate(fg, 1), 1)
    fg = dilate(erode(fg, 1), 1) & ~shadow

    # Strip dull edge fringe (beige AA baked into the source silhouette).
    for _ in range(3):
        edge = edge_pixels(fg)
        dull = edge & ((sat < 26) | (chroma < 38) | ((lum > 175) & (yellow < 28)))
        if not dull.any():
            break
        fg &= ~dull

    mask = Image.fromarray((fg.astype(np.uint8) * 255), 'L')

    body = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    body = ImageEnhance.Contrast(body).enhance(1.08)
    body = ImageEnhance.Color(body).enhance(1.06)
    body = ImageEnhance.Sharpness(body).enhance(1.3)
    body = body.filter(ImageFilter.UnsharpMask(radius=1.1, percent=110, threshold=2))
    body_np = np.array(body)

    ys, xs = np.where(fg)
    pad = 24
    y0, y1 = max(0, int(ys.min()) - pad), min(h, int(ys.max()) + pad + 1)
    x0, x1 = max(0, int(xs.min()) - pad), min(w, int(xs.max()) + pad + 1)
    crop_rgb = body_np[y0:y1, x0:x1]
    crop_m = np.array(mask)[y0:y1, x0:x1]
    ch, cw = crop_rgb.shape[:2]
    side = max(ch, cw)
    sq_rgb = np.zeros((side, side, 3), dtype=np.uint8)
    sq_m = np.zeros((side, side), dtype=np.uint8)
    oy, ox = (side - ch) // 2, (side - cw) // 2
    sq_rgb[oy : oy + ch, ox : ox + cw] = crop_rgb
    sq_m[oy : oy + ch, ox : ox + cw] = crop_m

    rgb_i = Image.fromarray(sq_rgb).resize((TARGET, TARGET), Image.Resampling.LANCZOS)
    # Nearest keeps hard silhouette — no Lanczos beige soft-alpha ring.
    m_i = Image.fromarray(sq_m, 'L').resize((TARGET, TARGET), Image.Resampling.NEAREST)
    arr = np.dstack([np.array(rgb_i), np.array(m_i)])

    # Binary alpha only — soft AA reintroduces beige plate fringe on black.
    arr[arr[:, :, 3] < 128, 3] = 0
    arr[arr[:, :, 3] >= 128, 3] = 255

    rgb2 = arr[:, :, :3].astype(float)
    sat2 = rgb2.std(axis=2)
    chroma2 = np.abs(rgb2[:, :, 0] - rgb2[:, :, 1]) + np.abs(rgb2[:, :, 1] - rgb2[:, :, 2])
    lum2 = rgb2.mean(axis=2)
    yellow2 = np.minimum(rgb2[:, :, 0] - rgb2[:, :, 2], rgb2[:, :, 1] - rgb2[:, :, 2])
    opaque = arr[:, :, 3] == 255

    # Kill pale / beige leftovers that survived the cut.
    pale = opaque & (lum2 > 165) & (sat2 < 32) & (chroma2 < 55)
    warm_fringe = opaque & (lum2 > 155) & (sat2 < 40) & (yellow2 < 30) & (chroma2 < 70)
    arr[pale | warm_fringe] = 0

    # Keep only clearly red/gold silhouette edges.
    fg2 = arr[:, :, 3] == 255
    for _ in range(3):
        edge = edge_pixels(fg2)
        is_red = (
            (rgb2[:, :, 0] > rgb2[:, :, 1] + 18)
            & (rgb2[:, :, 0] > rgb2[:, :, 2] + 22)
            & (sat2 > 28)
            & (chroma2 > 42)
        )
        is_gold = (
            (yellow2 > 26)
            & (rgb2[:, :, 1] > rgb2[:, :, 2] + 16)
            & (sat2 > 24)
            & (chroma2 > 40)
            & (rgb2[:, :, 0] > 95)
        )
        dull = edge & ~(is_red | is_gold)
        if not dull.any():
            break
        arr[dull] = 0
        fg2 = arr[:, :, 3] == 255
        rgb2 = arr[:, :, :3].astype(float)
        sat2 = rgb2.std(axis=2)
        chroma2 = np.abs(rgb2[:, :, 0] - rgb2[:, :, 1]) + np.abs(
            rgb2[:, :, 1] - rgb2[:, :, 2]
        )
        lum2 = rgb2.mean(axis=2)
        yellow2 = np.minimum(rgb2[:, :, 0] - rgb2[:, :, 2], rgb2[:, :, 1] - rgb2[:, :, 2])

    # Despill remaining edges from higher-saturation neighbors.
    edge = edge_pixels(fg2)
    eh, ew = fg2.shape
    for y, x in zip(*np.where(edge)):
        y1, y2 = max(0, y - 2), min(eh, y + 3)
        x1, x2 = max(0, x - 2), min(ew, x + 3)
        patch = arr[y1:y2, x1:x2]
        m = patch[:, :, 3] == 255
        if not m.any():
            continue
        pr = patch[:, :, :3].astype(float)
        ps = np.where(m, pr.std(axis=2), -1.0)
        bi = int(np.argmax(ps))
        by, bx = divmod(bi, ps.shape[1])
        if ps[by, bx] > sat2[y, x]:
            arr[y, x, :3] = patch[by, bx, :3]

    arr[arr[:, :, 3] == 0, :3] = 0

    for path in (POSTER, DISPLAY, DARK, V11):
        Image.fromarray(arr, 'RGBA').save(path, compress_level=6, optimize=True)

    meta = {
        'version': 10,
        'matteColor': 'transparent',
        'nativeWidth': 320,
        'nativeHeight': 320,
        'aspect': 1.0,
        'exportScale': max(1, TARGET // 320),
        'fps': 24.0,
        'frames': 1,
        'loopEndFrame': 0,
        'logoWidthFraction': 0.84,
        'minLogoWidth': 276,
        'maxLogoWidth': 324,
        'posterPixelWidth': TARGET,
        'posterPixelHeight': TARGET,
        'source': 'genomatch-logo-clean-source.png',
    }
    if META.is_file():
        old = json.loads(META.read_text())
        for key in ('animatedScale', 'animatedPixelWidth', 'animatedPixelHeight'):
            if key in old:
                meta[key] = old[key]
    META.write_text(json.dumps(meta, indent=2) + '\n')

    soft = int(((arr[:, :, 3] > 0) & (arr[:, :, 3] < 255)).sum())
    af = arr[:, :, 3:4].astype(np.float32) / 255.0
    white = (arr[:, :, :3].astype(np.float32) * af + 255.0 * (1.0 - af)).astype(np.uint8)
    satw = white.astype(float).std(axis=2)
    lumw = white.mean(axis=2)
    shadow_like = int(((lumw < 248) & (lumw > 180) & (satw < 12)).sum())
    pale_left = int(
        ((arr[:, :, 3] == 255) & (lum2 > 165) & (sat2 < 32) & (chroma2 < 55)).sum()
    )
    print(
        f'Wrote {POSTER.name} ({TARGET}x{TARGET}, {POSTER.stat().st_size / 1024:.0f}KB) '
        f'soft={soft} shadow-like={shadow_like} pale={pale_left} opaque={(arr[:,:,3]==255).sum()}'
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
