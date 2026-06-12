# GenoMatch brand fonts

Typography hierarchy (see `src/theme/typography.ts` and `src/theme/fontTokens.json`):

| Role | Target face | Current stand-in | Used for |
|------|-------------|------------------|----------|
| **Primary UI** | Gotham Rounded | Montserrat (400–700) | Profile names, ages, headings, buttons, body copy (~70%) |
| **Marketing** | Proxima Nova | Montserrat ExtraBold (800) | GENOMATCH kickers, onboarding, splash, promo lines |
| **System** | Helvetica / Roboto | Platform default | Tab labels, technical settings, nav captions |

## Licensed font drop-in

When you have **Gotham Rounded** and **Proxima Nova** files:

1. Add files to this folder, e.g.:
   - `GothamRounded-Bold.otf`
   - `GothamRounded-Medium.otf`
   - `GothamRounded-Book.otf`
   - `ProximaNova-Extrabold.otf`

2. Register in `src/theme/index.ts` `FONTS_TO_LOAD` and update `FONT_FAMILY` in `src/theme/typography.ts` to use the new PostScript names.

3. Remove or keep Montserrat entries as fallbacks.

## Development stand-ins

Until licensed files are added, the app loads **Montserrat** via `@expo-google-fonts/montserrat` (see `FONTS_TO_LOAD` in `src/theme/index.ts`).

Legacy **Clash Display** / **Satoshi** files in this folder are no longer loaded by default but may remain for reference.

## CSS / Figma mapping

```css
.ui-primary-heading, .ui-user-profile {
  font-family: "Gotham Rounded", "Montserrat", "Inter", sans-serif;
  font-weight: 700;
}
.brand-marketing, .promo-banner {
  font-family: "Proxima Nova", "Helvetica Neue", Arial, sans-serif;
  font-weight: 800;
}
.system-settings, .nav-labels {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: 400;
}
```

React Native equivalents: `FONT_ROLE` and `TYPOGRAPHY` in `src/theme/typography.ts`.
