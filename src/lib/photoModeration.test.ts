import {
  looksLikeImageUri,
  validatePhotoDimensions,
  MIN_PHOTO_EDGE_PX,
} from './photoModeration.logic';

describe('looksLikeImageUri', () => {
  it('accepts picker and https photo URIs', () => {
    expect(looksLikeImageUri('file:///var/photo.jpg')).toBe(true);
    expect(looksLikeImageUri('https://res.cloudinary.com/x/image/upload/a.png')).toBe(true);
    expect(looksLikeImageUri('ph://A1B2')).toBe(true);
    expect(looksLikeImageUri('data:image/jpeg;base64,abc')).toBe(true);
  });

  it('rejects empty, video, and document files', () => {
    expect(looksLikeImageUri('')).toBe(false);
    expect(looksLikeImageUri('file:///clip.mp4')).toBe(false);
    expect(looksLikeImageUri('https://example.com/nudes.gif')).toBe(false);
    expect(looksLikeImageUri('https://example.com/file.pdf')).toBe(false);
  });
});

describe('validatePhotoDimensions', () => {
  it('rejects images below the minimum edge', () => {
    expect(() => validatePhotoDimensions(120, 120)).toThrow(String(MIN_PHOTO_EDGE_PX));
  });

  it('rejects images that are too large', () => {
    expect(() => validatePhotoDimensions(9000, 9000)).toThrow(/too large/i);
  });

  it('accepts a normal profile photo', () => {
    expect(() => validatePhotoDimensions(1080, 1080)).not.toThrow();
  });
});
