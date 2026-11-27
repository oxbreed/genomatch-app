#!/usr/bin/env python3
"""
Grok ribbon → paired color + luma-mask loops for transparent compositing in RN.

Color: ribbon RGB on black. Mask: white ribbon silhouette per frame on black.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile

import imageio.v3 as iio
import imageio_ffmpeg
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
DEFAULT_GROK = os.path.expanduser(
    '~/Downloads/grok-video-7a791e9c-2af8-4fec-a562-23366c4eeaad.mp4'
)
ASSET_SRC = os.path.join(ROOT, 'assets/onboarding-ribbon-logo.mp4')
COLOR_OUT = os.path.join(ROOT, 'assets/onboarding-ribbon-logo-color.mp4')
MASK_VIDEO_OUT = os.path.join(ROOT, 'assets/onboarding-ribbon-logo-mask.mp4')
PNG_OUT = os.path.join(ROOT, 'assets/genomatch-ribbon-logo.png')
MASK_STILL_OUT = os.path.join(ROOT, 'assets/genomatch-ribbon-video-mask.png')
META_OUT = os.path.join(ROOT, 'assets/genomatch-ribbon-meta.json')

LOGO_WIDTH_FRACTION = 0.68
MIN_LOGO_WIDTH = 240
MAX_LOGO_WIDTH = 272
EXPORT_SCALE = max(1, int(os.environ.get('RIBBON_EXPORT_SCALE', '4')))
CROP_PAD = 4
MASK_DILATE = 3
LOOP_SEARCH_START = 48


def chroma_strength(rgb: np.ndarray) -> np.ndarray:
    return np.abs(rgb[:, :, 0].astype(np.int16) - rgb[:, :, 1]) + np.abs(
        rgb[:, :, 1].astype(np.int16) - rgb[:, :, 2]
    )


def plate_mask(rgb: np.ndarray) -> np.ndarray:
    """Near-neutral white plate only — must not eat bright gold highlights."""
    sat = rgb.std(axis=2)
    lum = rgb.mean(axis=2)
    mn = rgb.min(axis=2)
    chroma = chroma_strength(rgb)
    return (lum > 160) & (sat < 28) & (chroma < 36) & (mn > 140)


def vivid_ribbon_mask(rgb: np.ndarray) -> np.ndarray:
    """Red + gold ribbon body, including darker metallic folds."""
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    sat = rgb.std(axis=2)
    mx = rgb.max(axis=2)
    lum = rgb.mean(axis=2)
    chroma = chroma_strength(rgb)

    plate = plate_mask(rgb)
    reddish = (r > g + 8) & (r > b + 8) & (r > 45) & (sat > 10)
    goldish = (
        (r > 45)
        & (g > 28)
        & (r >= g - 12)
        & (g > b + 3)
        & (r > b + 6)
        & (sat > 8)
        & (lum > 20)
    )
    # Legacy vivid catch-all for saturated midtones
    vivid = (sat > 22) & (mx > 70) & (chroma > 14) & (lum < 250)
    fringe = (lum > 200) & (sat < 35) & (chroma < 55)
    return (reddish | goldish | vivid) & ~plate & ~fringe & (mx > 40)


def morph_erode(mask: np.ndarray, radius: int) -> np.ndarray:
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


def morph_close(mask: np.ndarray, radius: int) -> np.ndarray:
    return morph_erode(morph_dilate(mask, radius), radius)


def clean_mask(rgb: np.ndarray) -> np.ndarray:
    body = morph_close(vivid_ribbon_mask(rgb), 2)
    body = morph_dilate(body, MASK_DILATE) & ~plate_mask(rgb)
    return morph_close(body, 1) & ~plate_mask(rgb)


def gray_cast(rgb: np.ndarray, paint: np.ndarray) -> np.ndarray:
    """True gray haze only — never recolor gold / red metal."""
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    sat = rgb.std(axis=2)
    lum = rgb.mean(axis=2)
    chroma = chroma_strength(rgb)
    warm = (r > b + 6) & ((r > g - 4) | (g > b + 4))
    return (
        paint
        & ~warm
        & (chroma < 40)
        & (sat < 35)
        & (lum > 44)
        & (lum < 180)
    )


def solidify_grays(rgb: np.ndarray, paint: np.ndarray) -> np.ndarray:
    out = rgb.copy()
    gray = gray_cast(out, paint)
    if not gray.any():
        return out

    vivid = paint & ~gray
    for _ in range(4):
        if not gray.any():
            break
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0:
                    continue
                n_mask = np.roll(np.roll(vivid, dy, axis=0), dx, axis=1)
                n_rgb = np.roll(np.roll(out, dy, axis=0), dx, axis=1)
                fill = gray & n_mask
                for channel in range(3):
                    out[:, :, channel] = np.where(fill, n_rgb[:, :, channel], out[:, :, channel])
        gray = gray_cast(out, paint)
        vivid = paint & ~gray

    remaining = gray_cast(out, paint)
    if remaining.any():
        vivid_px = out[paint & ~remaining]
        if vivid_px.size:
            mean_color = vivid_px.reshape(-1, 3).mean(axis=0).astype(np.uint8)
            for channel in range(3):
                out[:, :, channel] = np.where(remaining, mean_color[channel], out[:, :, channel])

    return out


def morph_dilate(mask: np.ndarray, radius: int) -> np.ndarray:
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


def frame_paint(rgb: np.ndarray) -> np.ndarray:
    return clean_mask(rgb)


def build_frame(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    paint_native = frame_paint(rgb)
    body = solidify_grays(rgb, paint_native)

    if EXPORT_SCALE > 1:
        body = upscale_frame(body, EXPORT_SCALE)
        paint = upscale_mask(paint_native, EXPORT_SCALE)
    else:
        paint = paint_native.copy()

    color = np.zeros_like(body)
    color[paint] = body[paint]

    mask = np.zeros_like(body)
    mask[paint] = 255

    return color, mask


def upscale_frame(rgb: np.ndarray, scale: int) -> np.ndarray:
    h, w = rgb.shape[:2]
    return np.array(
        Image.fromarray(rgb).resize((w * scale, h * scale), Image.Resampling.LANCZOS)
    )


def upscale_mask(mask: np.ndarray, scale: int) -> np.ndarray:
    h, w = mask.shape[:2]
    up = np.array(
        Image.fromarray(mask.astype(np.uint8) * 255).resize(
            (w * scale, h * scale), Image.Resampling.NEAREST
        )
    )
    return up > 127


def save_hard_mask(path: str, mask: np.ndarray) -> None:
    h, w = mask.shape
    alpha = mask.astype(np.uint8) * 255
    white = np.ones((h, w, 3), dtype=np.uint8) * 255
    Image.fromarray(np.dstack([white, alpha]), 'RGBA').save(path, compress_level=0)


def union_crop_box(masks: list[np.ndarray]) -> tuple[int, int, int, int]:
    boxes: list[tuple[int, int, int, int]] = []
    for mask in masks:
        ys, xs = np.where(mask)
        if len(xs):
            boxes.append((int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())))
    if not boxes:
        raise RuntimeError('No ribbon pixels found in any frame')

    x0 = max(0, min(b[0] for b in boxes) - CROP_PAD)
    y0 = max(0, min(b[1] for b in boxes) - CROP_PAD)
    x1 = min(masks[0].shape[1] - 1, max(b[2] for b in boxes) + CROP_PAD)
    y1 = min(masks[0].shape[0] - 1, max(b[3] for b in boxes) + CROP_PAD)
    crop_w = x1 - x0 + 1
    crop_h = y1 - y0 + 1
    crop_w -= crop_w % 2
    crop_h -= crop_h % 2
    return x0, y0, crop_w, crop_h


def find_loop_end(
    src: str,
    frame_count: int,
    crop: tuple[int, int, int, int],
) -> int:
    x0, y0, crop_w, crop_h = crop
    ref = iio.imread(src, index=0)[y0 : y0 + crop_h, x0 : x0 + crop_w, :3].astype(np.float32)
    best_i = frame_count - 1
    best_d = float('inf')
    start = min(max(LOOP_SEARCH_START, frame_count // 4), frame_count - 2)
    for index in range(start, frame_count):
        frame = iio.imread(src, index=index)[y0 : y0 + crop_h, x0 : x0 + crop_w, :3].astype(
            np.float32
        )
        dist = float(np.abs(frame - ref).mean())
        if dist < best_d:
            best_d = dist
            best_i = index
    print(f'Loop end frame {best_i}/{frame_count - 1} (crop diff {best_d:.2f})')
    return best_i


def sync_grok_source() -> str:
    grok = os.environ.get('GROK_SRC', DEFAULT_GROK)
    if not os.path.isfile(grok):
        print(f'Grok source not found: {grok}', file=sys.stderr)
        return ASSET_SRC if os.path.isfile(ASSET_SRC) else grok
    try:
        if os.path.abspath(grok) != os.path.abspath(ASSET_SRC):
            shutil.copy2(grok, ASSET_SRC)
            print(f'Synced Grok source → {ASSET_SRC}')
    except OSError as err:
        print(f'Could not sync Grok source ({err}); using {ASSET_SRC}', file=sys.stderr)
        if not os.path.isfile(ASSET_SRC):
            return grok
    return ASSET_SRC


def write_meta(logical_w: int, logical_h: int, fps: float, frames: int) -> None:
    import json

    payload = {
        'version': 1,
        'matteColor': 'transparent',
        'nativeWidth': logical_w,
        'nativeHeight': logical_h,
        'aspect': round(logical_w / logical_h, 6),
        'exportScale': EXPORT_SCALE,
        'fps': fps,
        'frames': frames,
        'loopEndFrame': frames - 1,
        'logoWidthFraction': LOGO_WIDTH_FRACTION,
        'minLogoWidth': MIN_LOGO_WIDTH,
        'maxLogoWidth': MAX_LOGO_WIDTH,
    }
    with open(META_OUT, 'w', encoding='utf-8') as fh:
        json.dump(payload, fh, indent=2)
    print(f'Wrote {META_OUT}')


def encode_frames(frames: list[np.ndarray], fps: float, out_path: str) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        pattern = os.path.join(tmp, 'frame_%04d.png')
        for index, frame in enumerate(frames):
            Image.fromarray(frame, 'RGB').save(
                pattern % index,
                compress_level=0,
                optimize=False,
            )

        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        cmd = [
            ffmpeg,
            '-y',
            '-framerate',
            str(fps),
            '-i',
            pattern,
            '-c:v',
            'libx264',
            '-crf',
            '0',
            '-preset',
            'veryslow',
            '-pix_fmt',
            'yuv444p',
            '-movflags',
            '+faststart',
            out_path,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(result.stderr[-2000:], file=sys.stderr)
            raise RuntimeError(f'ffmpeg failed for {out_path}')


def main() -> int:
    src = sync_grok_source()
    if not os.path.isfile(src):
        print(f'Missing source video: {src}', file=sys.stderr)
        return 1

    meta = iio.immeta(src)
    fps = float(meta['fps'])
    frame_count = int(meta['duration'] * fps)

    masks: list[np.ndarray] = []
    for index in range(frame_count):
        rgb = iio.imread(src, index=index)[:, :, :3]
        masks.append(clean_mask(rgb))

    x0, y0, crop_w, crop_h = union_crop_box(masks)
    loop_end = find_loop_end(src, frame_count, (x0, y0, crop_w, crop_h))

    union_crop_mask = np.zeros((crop_h, crop_w), dtype=bool)
    color_frames: list[np.ndarray] = []
    mask_frames: list[np.ndarray] = []

    for index in range(loop_end + 1):
        rgb = iio.imread(src, index=index)[:, :, :3]
        crop_rgb = rgb[y0 : y0 + crop_h, x0 : x0 + crop_w]
        crop_mask = masks[index][y0 : y0 + crop_h, x0 : x0 + crop_w]
        union_crop_mask |= crop_mask

        color, mask = build_frame(crop_rgb)
        color_frames.append(color)
        mask_frames.append(mask)

    color_frames[-1] = color_frames[0].copy()
    mask_frames[-1] = mask_frames[0].copy()

    out_w, out_h = color_frames[0].shape[1], color_frames[0].shape[0]
    save_hard_mask(MASK_STILL_OUT, union_crop_mask)

    encode_frames(color_frames, fps, COLOR_OUT)
    encode_frames(mask_frames, fps, MASK_VIDEO_OUT)

    rgba_hard = np.dstack([color_frames[0], (mask_frames[0][:, :, 0]).astype(np.uint8)])
    # Soft AA on poster so retina UI edges aren't stair-stepped
    from PIL import ImageFilter

    hard = Image.fromarray(rgba_hard[:, :, 3], 'L')
    soft = hard.filter(ImageFilter.GaussianBlur(radius=0.75))
    alpha = np.maximum(np.array(soft), rgba_hard[:, :, 3])
    rgb = color_frames[0].copy()
    rgb[alpha == 0] = 0
    Image.fromarray(np.dstack([rgb, alpha]), 'RGBA').save(PNG_OUT, compress_level=0, optimize=False)

    logical_w = out_w // EXPORT_SCALE
    logical_h = out_h // EXPORT_SCALE
    write_meta(logical_w, logical_h, fps, len(color_frames))

    print(f'Wrote {COLOR_OUT} + {MASK_VIDEO_OUT} ({out_w}x{out_h}, {len(color_frames)} frames)')

    gif_script = os.path.join(ROOT, 'scripts', 'build-ribbon-animated.py')
    if os.path.isfile(gif_script):
        result = subprocess.run([sys.executable, gif_script], cwd=ROOT)
        if result.returncode != 0:
            print('Animated export failed — run npm run ribbon:animated', file=sys.stderr)

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
