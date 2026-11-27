export const MIN_PHOTO_EDGE_PX = 320;
export const MAX_PHOTO_EDGE_PX = 8000;

const IMAGE_SCHEME_RE = /^(file:|content:|ph:|assets-library:|https?:|data:image\/)/i;
const IMAGE_EXT_RE = /\.(jpe?g|png|heic|heif|webp)(\?|#|$)/i;
const REJECT_EXT_RE = /\.(gif|mp4|mov|webm|pdf|svg|html?)(\?|#|$)/i;

export function looksLikeImageUri(uri: string): boolean {
  const trimmed = uri.trim();
  if (!trimmed) return false;
  if (REJECT_EXT_RE.test(trimmed)) return false;
  return IMAGE_SCHEME_RE.test(trimmed) || IMAGE_EXT_RE.test(trimmed);
}

export function validatePhotoDimensions(width: number, height: number): void {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error('That file does not look like a usable photo. Try another image.');
  }
  if (width < MIN_PHOTO_EDGE_PX || height < MIN_PHOTO_EDGE_PX) {
    throw new Error(
      `Photos need to be at least ${MIN_PHOTO_EDGE_PX}×${MIN_PHOTO_EDGE_PX} so matches can see you clearly.`
    );
  }
  if (width > MAX_PHOTO_EDGE_PX || height > MAX_PHOTO_EDGE_PX) {
    throw new Error('That image is too large. Choose a smaller photo.');
  }
}
