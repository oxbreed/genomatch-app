#!/usr/bin/env python3
"""Verify ribbon logo assets match the standard pipeline contract."""

from __future__ import annotations

import json
import os
import sys

import imageio.v3 as iio
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
META_PATH = os.path.join(ROOT, 'assets/genomatch-ribbon-meta.json')
VIDEO_PATH = os.path.join(ROOT, 'assets/onboarding-ribbon-logo-cream.mp4')
POSTER_PATH = os.path.join(ROOT, 'assets/genomatch-ribbon-logo.png')
RIBBON_TS = os.path.join(ROOT, 'src/brand/ribbonLogo.ts')
SCRIPT_PATH = os.path.join(ROOT, 'scripts/key-ribbon-video-cream.py')

EXPECTED_MATTE = '#FAF8F5'
EXPECTED_MATTE_RGB = np.uint8([250, 248, 245])


def fail(msg: str) -> None:
    print(f'FAIL: {msg}', file=sys.stderr)
    sys.exit(1)


def ok(msg: str) -> None:
    print(f'OK: {msg}')


def main() -> int:
    for path in (META_PATH, VIDEO_PATH, POSTER_PATH, RIBBON_TS, SCRIPT_PATH):
        if not os.path.isfile(path):
            fail(f'missing {path}')

    with open(META_PATH, encoding='utf-8') as fh:
        meta = json.load(fh)

    if meta.get('matteColor') != EXPECTED_MATTE:
        fail(f'meta matteColor {meta.get("matteColor")!r} != {EXPECTED_MATTE}')

    if EXPECTED_MATTE not in open(RIBBON_TS, encoding='utf-8').read():
        fail('ribbonLogo.ts missing ONBOARDING_CREAM constant')

    script = open(SCRIPT_PATH, encoding='utf-8').read()
    if f"MATTE_HEX = '{EXPECTED_MATTE}'" not in script:
        fail('key-ribbon-video-cream.py MATTE_HEX mismatch')

    export_scale = int(meta['exportScale'])
    native_w = int(meta['nativeWidth'])
    native_h = int(meta['nativeHeight'])
    frames = int(meta['frames'])

    vmeta = iio.immeta(VIDEO_PATH)
    vfps = float(vmeta['fps'])
    vframes = int(vmeta['duration'] * vfps)

    if abs(vfps - float(meta['fps'])) > 0.01:
        fail(f'video fps {vfps} != meta fps {meta["fps"]}')
    if vframes != frames:
        fail(f'video frames {vframes} != meta frames {frames}')

    frame0 = iio.imread(VIDEO_PATH, index=0)[:, :, :3]
    poster = iio.imread(POSTER_PATH)[:, :, :3]
    if frame0.shape != poster.shape:
        fail(f'poster {poster.shape[:2]} != video frame0 {frame0.shape[:2]}')

    poster_diff = float(np.abs(frame0.astype(float) - poster.astype(float)).max())
    if poster_diff > 1.0:
        fail(f'poster differs from video frame 0 (max diff {poster_diff:.2f})')

    export_w = native_w * export_scale
    export_h = native_h * export_scale
    if frame0.shape[1] != export_w or frame0.shape[0] != export_h:
        fail(f'video size {frame0.shape[1]}x{frame0.shape[0]} != export {export_w}x{export_h}')

    cream_dist = np.linalg.norm(frame0.astype(float) - EXPECTED_MATTE_RGB, axis=2)
    ribbon_px = int((cream_dist > 40).sum())
    if ribbon_px < 1000:
        fail(f'too few ribbon pixels in frame 0 ({ribbon_px})')

    # loop seam: last frame should match first
    last = iio.imread(VIDEO_PATH, index=frames - 1)[:, :, :3]
    seam = float(np.abs(last.astype(float) - frame0.astype(float)).mean())
    if seam > 2.0:
        fail(f'loop seam mean diff {seam:.2f} > 2.0')

    ok(f'matte {EXPECTED_MATTE}')
    ok(f'video {export_w}x{export_h}, {frames} frames @ {vfps}fps')
    ok(f'poster matches frame 0 (max diff {poster_diff:.2f})')
    ok(f'loop seam {seam:.3f}')
    ok(f'ribbon pixels in frame 0: {ribbon_px:,}')

    # solid ribbon: very few hazy gray pixels on painted area
    max_hazy = 0
    for idx in (0, 20, 40, 60, frames - 1):
        frame = iio.imread(VIDEO_PATH, index=idx)[:, :, :3]
        dist = np.linalg.norm(frame.astype(float) - EXPECTED_MATTE_RGB, axis=2)
        on = dist > 25
        sat = frame.std(axis=2)
        lum = frame.mean(axis=2)
        chroma = np.abs(frame[:, :, 0].astype(int) - frame[:, :, 1]) + np.abs(
            frame[:, :, 1].astype(int) - frame[:, :, 2]
        )
        hazy = int((on & (chroma < 50) & (sat < 50) & (lum > 60) & (lum < 175)).sum())
        max_hazy = max(max_hazy, hazy)
    if max_hazy > 600:
        fail(f'too many hazy gray pixels on ribbon (max {max_hazy})')
    ok(f'max hazy gray on ribbon: {max_hazy}')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
