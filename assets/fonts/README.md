# GenoMatch brand fonts

Place licensed **Clash Display** and **Satoshi** files here (replace the development stand-ins when you have them).

## Required files

| File name | Role |
|-----------|------|
| `ClashDisplay-Semibold.ttf` (or `.otf`) | Display headings |
| `ClashDisplay-Medium.ttf` | Screen titles |
| `Satoshi-Medium.ttf` | Names, labels, buttons |
| `Satoshi-Regular.ttf` | Body copy |

## Where to get fonts

- **Clash Display** — [Indian Type Foundry / Fontshare](https://www.fontshare.com/fonts/clash-display) (check license for mobile apps)
- **Satoshi** — [Fontshare Satoshi](https://www.fontshare.com/fonts/satoshi) or your Fontesk license

## Development stand-ins

Until you add the brand files, the repo ships **Outfit** (as Clash Display) and **DM Sans** (as Satoshi) so `expo-font` loads successfully in Expo Go.

After replacing files, keep the same filenames so `src/theme/index.ts` and `app.json` do not need changes.
