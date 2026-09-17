# GenoMatch (iOS / Android app)

Expo SDK 57 dating app (`ng.genomatch.app`). This repo is the mobile client only. The marketing site and admin app live elsewhere.

Two palettes exist in product work (ink/hero UI vs a glossy red mark). Neither is ratified here. Do not “fix” colours as part of setup.

## Requirements

- Node.js **22.13+** (SDK 57)
- npm
- [Expo Go](https://expo.dev/go) for SDK 57 on a physical phone
- Same [expo.dev](https://expo.dev) account in the CLI and in Expo Go ([login is required on iOS Expo Go](https://expo.dev/changelog/expo-go-57-login))

## First-time setup

```bash
git clone https://github.com/oxbreed/genomatch-app.git
cd genomatch-app
git checkout cursor/upgrade-expo-sdk-57-b465   # current SDK 57 work
npm ci
cp .env.example .env.local
```

Put a real `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Without it the app throws on boot. Keep `.env` / `.env.local` untracked.

```bash
npx expo login
```

In Expo Go on the phone: Home → person icon → sign in as the **same** username as `npx expo whoami`.

## Run on a physical iPhone

Join the **same Wi-Fi** as the Mac. One command per line:

```bash
npx expo login
npm run go
```

Scan the QR with the **iPhone Camera** app (Expo Go has no in-app scanner). Open in Expo Go.

Do not paste two commands on one line. Do not use `--tunnel` (`@expo/ngrok` throws). `--offline` / anonymous Expo Go will fail the SDK 57 login check.

If Metro is already running on 8081, `npm run go` stops it first.

## Checks

```bash
npm run typecheck
npm test
npx expo-doctor
```

## What this branch does not do

- **Apple Team ID / TestFlight:** EAS iOS production still needs an approved Apple Developer Team ID. Enrollment IDs are not Team IDs.
- **GitHub `main`:** still Expo-era `fd53596` on the remote. Local-only `main` commits (mirror brand, etc.) must not be merged into this branch until a brand is chosen.
- **Landing / admin:** not this repository. Store legal URLs 409 on the live site; the app also has in-app Privacy and Terms.

## Scripts

| Command | Purpose |
|---|---|
| `npm run go` | LAN QR + Metro for Expo Go |
| `npm start` | Plain `expo start` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run eas:build:preview` | Internal iOS build (needs Team ID) |
