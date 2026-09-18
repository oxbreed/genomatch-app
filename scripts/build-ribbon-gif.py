#!/usr/bin/env python3
"""Compose color + mask MP4s into a transparent animated GIF for RN Image."""

from __future__ import annotations

import json
import os

import imageio.v3 as iio
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
COLOR_PATH = os.path.join(ROOT, 'assets/onboarding-ribbon-logo-color.mp4')
MASK_PATH = os.path.join(ROOT, 'assets/onboarding-ribbon-logo-mask.mp4')
META_PATH = os.path.join(ROOT, 'assets/genomatch-ribbon-meta.json')
OUT_PATH = os.path.join(ROOT, 'assets/onboarding-ribbon-logo.gif')


def rgba_frame(color_rgb: np.ndarray, mask_rgb: np.ndarray) -> Image.Image:
    alpha = mask_rgb[:, :, 0].astype(np.uint8)
    rgba = np.dstack([color_rgb[:, :, :3], alpha])
    return Image.fromarray(rgba, 'RGBA')


def to_gif_palette(frame: Image.Image) -> Image.Image:
    flattened = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    flattened.paste(frame, mask=frame.split()[3])
    return flattened.convert('P', palette=Image.ADAPTIVE, colors=255)


def main() -> int:
    if not os.path.isfile(COLOR_PATH) or not os.path.isfile(MASK_PATH):
        print('Missing color/mask MP4 assets', file=__import__('sys').stderr)
        return 1

    with open(META_PATH, encoding='utf-8') as fh:
        meta = json.load(fh)

    logical_w = int(meta['nativeWidth'])
    logical_h = int(meta['nativeHeight'])
    fps = float(meta['fps'])

    color_frames = iio.imread(COLOR_PATH)
    mask_frames = iio.imread(MASK_PATH)
    count = min(len(color_frames), len(mask_frames))

    gif_frames: list[Image.Image] = []
    for index in range(count):
        color = color_frames[index]
        mask = mask_frames[index]
        rgba = rgba_frame(color, mask)
        if rgba.size != (logical_w, logical_h):
            rgba = rgba.resize((logical_w, logical_h), Image.Resampling.LANCZOS)
        gif_frames.append(to_gif_palette(rgba))

    duration_ms = max(1, int(round(1000 / fps)))
    gif_frames[0].save(
        OUT_PATH,
        save_all=True,
        append_images=gif_frames[1:],
        duration=duration_ms,
        loop=0,
        disposal=2,
        transparency=0,
        optimize=False,
    )
    print(f'Wrote {OUT_PATH} ({logical_w}x{logical_h}, {count} frames @ {fps}fps)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
