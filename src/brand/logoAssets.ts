import {
  GENOMATCH_RIBBON_POSTER,
  ONBOARDING_CREAM,
  GENOMATCH_RIBBON_ASPECT,
  GENOMATCH_RIBBON_EXPORT_SCALE,
  GENOMATCH_RIBBON_NATIVE_HEIGHT,
  GENOMATCH_RIBBON_NATIVE_WIDTH,
} from './ribbonLogo';

export {
  ONBOARDING_CREAM,
  GENOMATCH_RIBBON_ASPECT,
  GENOMATCH_RIBBON_EXPORT_SCALE,
  GENOMATCH_RIBBON_NATIVE_HEIGHT,
  GENOMATCH_RIBBON_NATIVE_WIDTH,
  snapRibbonLogoWidth,
  ribbonLogoHeight,
} from './ribbonLogo';

/** @deprecated Use GENOMATCH_RIBBON_POSTER */
export const GENOMATCH_RIBBON_LOGO = GENOMATCH_RIBBON_POSTER;

/** Animated ribbon is not bundled; alias the poster. */
export const GENOMATCH_RIBBON_ANIMATED = GENOMATCH_RIBBON_POSTER;

/** @deprecated Use GENOMATCH_RIBBON_ANIMATED */
export const GENOMATCH_RIBBON_LOGO_VIDEO = GENOMATCH_RIBBON_ANIMATED;

/**
 * Master 3D ribbon mark, keyed to straight alpha by scripts/build-brand-logo.py.
 * One transparent file serves both surfaces, so nothing has a baked plate that
 * shows as a pale box on cream or black.
 */
export const GENOMATCH_LOGO_MARK = require('../../assets/genomatch-logo-mark.png');

/** Same artwork at header scale — avoids decoding 1024px for a 28px mark. */
export const GENOMATCH_LOGO_MARK_SMALL = require('../../assets/genomatch-logo-mark-small.png');

/** @deprecated Surfaces share one transparent mark; use GENOMATCH_LOGO_MARK. */
export const GENOMATCH_LOGO_LIGHT = GENOMATCH_LOGO_MARK;

/** @deprecated Surfaces share one transparent mark; use GENOMATCH_LOGO_MARK. */
export const GENOMATCH_LOGO_DARK = GENOMATCH_LOGO_MARK;

export type GenoLogoSurface = 'light' | 'dark';

export function resolveLogoSource(_surface: GenoLogoSurface = 'light') {
  return GENOMATCH_LOGO_MARK;
}
