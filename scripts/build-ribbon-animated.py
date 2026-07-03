#!/usr/bin/env python3
"""Compose color + mask MP4s into a lossless transparent animated WebP."""

from __future__ import annotations

import json
import os
import sys

import imageio.v3 as iio
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
COLOR_PATH = os.path.join(ROOT, 'assets/onboarding-ribbon-logo-color.mp4')
MASK_PATH = os.path.join(ROOT, 'assets/onboarding-ribbon-logo-mask.mp4')
META_PATH = os.path.join(ROOT, 'assets/genomatch-ribbon-meta.json')
WEBP_OUT = os.path.join(ROOT, 'assets/onboarding-ribbon-logo.webp')
PNG_OUT = os.path.join(ROOT, 'assets/genomatch-ribbon-logo.png')

# 2× logical export — sharp enough; 3× WebP OOMs Expo Go
ANIMATED_SCALE = int(os.environ.get('RIBBON_ANIMATED_SCALE', '2'))


def rgba_frame(color_rgb: np.ndarray, mask_rgb: np.ndarray) -> Image.Image:
    alpha = mask_rgb[:, :, 0].astype(np.uint8)
    rgba = np.dstack([color_rgb[:, :, :3], alpha])
    return Image.fromarray(rgba, 'RGBA')


def resize_rgba(frame: Image.Image, size: tuple[int, int]) -> Image.Image:
    if frame.size == size:
        return frame
    return frame.resize(size, Image.Resampling.LANCZOS)


def write_webp(frames: list[Image.Image], fps: float, out_path: str) -> None:
    duration_ms = max(1, int(round(1000 / fps)))
    # Near-lossless RGBA — far sharper than GIF palette, fast enough to export.
    frames[0].save(
        out_path,
        format='WEBP',
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        lossless=False,
        quality=100,
        method=4,
        minimize_size=False,
    )


def write_poster(frame: Image.Image, out_path: str) -> None:
    frame.save(out_path, format='PNG', compress_level=0, optimize=False)


def main() -> int:
    if not os.path.isfile(COLOR_PATH) or not os.path.isfile(MASK_PATH):
        print('Missing color/mask MP4 assets', file=sys.stderr)
        return 1

    with open(META_PATH, encoding='utf-8') as fh:
        meta = json.load(fh)

    logical_w = int(meta['nativeWidth'])
    logical_h = int(meta['nativeHeight'])
    fps = float(meta['fps'])
    out_w = logical_w * ANIMATED_SCALE
    out_h = logical_h * ANIMATED_SCALE

    color_frames = iio.imread(COLOR_PATH)
    mask_frames = iio.imread(MASK_PATH)
    count = min(len(color_frames), len(mask_frames))

    rgba_frames: list[Image.Image] = []
    for index in range(count):
        rgba = rgba_frame(color_frames[index], mask_frames[index])
        rgba_frames.append(resize_rgba(rgba, (out_w, out_h)))

    write_webp(rgba_frames, fps, WEBP_OUT)
    write_poster(rgba_frames[0], PNG_OUT)

    meta['animatedScale'] = ANIMATED_SCALE
    meta['animatedPixelWidth'] = out_w
    meta['animatedPixelHeight'] = out_h
    with open(META_PATH, 'w', encoding='utf-8') as fh:
        json.dump(meta, fh, indent=2)

    print(
        f'Wrote {WEBP_OUT} + {PNG_OUT} ({out_w}x{out_h}, {count} frames @ {fps}fps, webp q100)'
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
