import { PixelRatio } from 'react-native';
import rawRibbonMeta from '../../assets/genomatch-ribbon-meta.json';

/**
 * Shape of genomatch-ribbon-meta.json. The animated fields are written only by
 * `npm run ribbon:animated`; a poster-only export omits them, so they are
 * optional here rather than inferred from whichever build is on disk.
 */
type RibbonMeta = {
  nativeWidth: number;
  nativeHeight: number;
  exportScale: number;
  fps: number;
  frames: number;
  logoWidthFraction?: number;
  minLogoWidth?: number;
  maxLogoWidth?: number;
  animatedPixelWidth?: number;
  animatedPixelHeight?: number;
  animatedScale?: number;
};

const ribbonMeta = rawRibbonMeta as RibbonMeta;

/**
 * Onboarding ribbon — lightweight runtime assets only (no MP4 requires).
 *
 * Pipeline videos live on disk for scripts; never `require()` them in the app bundle.
 *
 * Build: npm run ribbon:animated
 */

/** Legacy cream matte */
export const ONBOARDING_CREAM = '#FAF8F5';
export const ONBOARDING_CHARCOAL = '#0B0C0E';

/**
 * The animated ribbon loop (assets/onboarding-ribbon-logo.webp) is deliberately
 * NOT required from this module.
 *
 * Metro resolves `require()` with a literal path statically, wherever it
 * appears — inside a function body included. Any require of that file in the
 * graph therefore ships all 4.5MB in the app download, whether or not anything
 * renders it. Nothing currently does.
 *
 * To bring the animation back: require it inside the component that renders it,
 * and accept the 4.5MB. Check `expo export` output before and after.
 */

/** Full-resolution transparent poster with alpha */
export const GENOMATCH_RIBBON_POSTER = require('../../assets/genomatch-ribbon-logo-v11.png');

/** Alias of transparent poster (no baked square) */
export const GENOMATCH_RIBBON_DISPLAY = GENOMATCH_RIBBON_POSTER;

export const GENOMATCH_RIBBON_NATIVE_WIDTH = ribbonMeta.nativeWidth;
export const GENOMATCH_RIBBON_NATIVE_HEIGHT = ribbonMeta.nativeHeight;
export const GENOMATCH_RIBBON_EXPORT_SCALE = ribbonMeta.exportScale;
export const GENOMATCH_RIBBON_FPS = ribbonMeta.fps;
export const GENOMATCH_RIBBON_FRAMES = ribbonMeta.frames;
export const GENOMATCH_RIBBON_ANIMATED_PIXEL_WIDTH =
  ribbonMeta.animatedPixelWidth ?? GENOMATCH_RIBBON_NATIVE_WIDTH;
export const GENOMATCH_RIBBON_ANIMATED_PIXEL_HEIGHT =
  ribbonMeta.animatedPixelHeight ?? GENOMATCH_RIBBON_NATIVE_HEIGHT;
export const GENOMATCH_RIBBON_ANIMATED_SCALE = ribbonMeta.animatedScale ?? 1;

export const GENOMATCH_RIBBON_ASPECT =
  GENOMATCH_RIBBON_NATIVE_WIDTH / GENOMATCH_RIBBON_NATIVE_HEIGHT;

const WIDTH_FRACTION = ribbonMeta.logoWidthFraction ?? 0.68;
const MIN_LOGO_WIDTH = ribbonMeta.minLogoWidth ?? 240;
const MAX_LOGO_WIDTH = ribbonMeta.maxLogoWidth ?? 288;

export function snapRibbonLogoWidth(screenWidth = 0): number {
  const width = screenWidth > 0 ? screenWidth : 390;
  const dpr = PixelRatio.get();
  const target = Math.min(
    Math.max(Math.round(width * WIDTH_FRACTION), MIN_LOGO_WIDTH),
    MAX_LOGO_WIDTH
  );
  const native = GENOMATCH_RIBBON_NATIVE_WIDTH;
  const assetPx = GENOMATCH_RIBBON_ANIMATED_PIXEL_WIDTH;

  let best = target;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let num = 1; num <= 4; num += 1) {
    for (let den = 2; den <= 5; den += 1) {
      const logical = Math.round((native * num) / den);
      if (logical < MIN_LOGO_WIDTH - 5 || logical > MAX_LOGO_WIDTH + 3) continue;

      const devicePx = logical * dpr;
      const ratio = assetPx / devicePx;
      const nearestInt = Math.round(ratio);
      if (nearestInt < 1) continue;

      const score = Math.abs(ratio - nearestInt) + Math.abs(logical - target) * 0.1;
      if (score < bestScore) {
        bestScore = score;
        best = logical;
      }
    }
  }

  return best;
}

export function ribbonLogoHeight(width: number): number {
  return Math.round(width / GENOMATCH_RIBBON_ASPECT);
}
