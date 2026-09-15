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

/** Official GenoMatch 3D logo raster assets */
export const GENOMATCH_LOGO_LIGHT = require('../../assets/genomatch-logo-light.png');
export const GENOMATCH_LOGO_DARK = require('../../assets/genomatch-logo-dark.png');

export type GenoLogoSurface = 'light' | 'dark';

export function resolveLogoSource(surface: GenoLogoSurface) {
  return surface === 'dark' ? GENOMATCH_LOGO_DARK : GENOMATCH_LOGO_LIGHT;
}
