# HANDOFF: oxbreed/genomatch-app

GenoMatch mobile client: a genotype-aware dating app for iOS and Android (`ng.genomatch.app`). Marketing site and admin live in other repos (`oxbreed/genomatch-landing`, private `oxbreed/genomatch-admin`).

Repo: https://github.com/oxbreed/genomatch-app (public, default branch `main`, `main` is protected)
Expo slug: `genomatch` (owner `oxbreed`)
EAS project id: `11f7d939-f2b9-4c0c-a1bf-bd7411c45ec6`
Supabase project ref (public in repo scripts): `rxmrfazktupegpfxaljo`

This repo already lives on GitHub. Cursor agent work from `bc-a4c00d23-f975-4327-9b38-92b5d3afb465` (suffix `b465`) and `bc-82607e6b-8019-4f74-b790-b9d0a0139206` (suffix `9206`) was pushed as branches and PRs below. No Cursor-only app tree was found.

## Stack

- Expo SDK 57 (`expo@~57.0.23`), React Native 0.86.3, React 19.2, TypeScript (Node 22.13+)
- Supabase JS client, Cloudinary unsigned profile uploads, Zustand, TanStack Query, React Hook Form + Zod
- Vitest, EAS Build / Submit (`eas.json` development, preview, production channels)
- In-repo `supabase/` migrations and a `website/` folder (legal/support pages also exist in the landing repo)

## Hosting and deploy

- Client: Expo / EAS. Production iOS builds need an approved Apple Developer Team ID (enrollment IDs are not Team IDs). Remote push does not work in Expo Go on SDK 53+.
- Backend: Supabase project `rxmrfazktupegpfxaljo`. Historically this project was paused and Vercel deploys for related GenoMatch sites failed; re-check that the project is active before assuming the app can sign in or Discover can load.
- An iPhone build was already in App Store review as of late September 2026. That binary may lag the open draft PRs.

## Current state (as of 20 Nov 2026, UK time)

`main` is at `a32bada4`, last updated 20 Sep 2026, 12:32 UK time, when PRs #9, #15 and #16 were merged. That line already includes:

- SDK 57 + Expo Go setup (PR #1)
- Mirror brand recolour (PR #3) and later colour-alias collapse (PR #7)
- Lifestyle match percent split from genotype data for Apple 1.4.1 (PR #4)
- Neutral genotype labels (PR #5) and HbSC (`SC`) support; unsupported `CC` dropped (PR #6)
- Splash video / ribbon onboarding files and wiring (PRs #8, #9)
- Identity and verified-city hardening (PR #10) and content-moderation SQL (PR #11)
- Lifestyle-only Discover swipe cards (PR #12), unused then wired mirror-chrome (PRs #13–15)
- Black Discover chrome, presence pills, match celebration (PR #16)

The README on `main` is stale. It still tells you to check out `cursor/upgrade-expo-sdk-57-b465` and claims GitHub `main` is still `fd53596`. That is no longer true.

Backup / recovery branches that are on GitHub (the September 2026 "laptop only" warning is outdated for these):

- `backup/original-main-52ad563` (3 July mirror-brand tree)
- `backup/pre-reconcile-20260915`
- `recovery/wip-before-sdk57` (`2655e03`, 16 Sep 2026, described as the last complete pre-SDK-57 product line)
- `recovery/dangling-cb2070d`
- `testing-main`

## Open PRs and important branches

All six open items are draft PRs (no plain issues):

| PR | Branch | Base | What it is |
|---|---|---|---|
| #2 draft | `cursor/setup-dev-environment-9206` | `cursor/upgrade-expo-sdk-57-b465` | Cursor cloud-agent env (`.cursor/environment.json`, Expo web on 8081). Agent `bc-82607e6b-…9206` errored. Leave unless you still need that Cursor setup. |
| #17 draft | `cursor/restore-july-upgrade-b465` | `main` | Port the 3 July (`52ad563`) product surfaces onto SDK 57 `main`. Later called incomplete. |
| #18 draft | `cursor/restore-pre-break-wip-b465` | `main` | Supersedes the idea behind #17: port `recovery/wip-before-sdk57` (`2655e03`, 16 Sep) onto SDK 57, not the July-only tree. |
| #19 draft | `cursor/refine-cream-product-b465` | `main` | Cream product refinement and App Store review fixes. Matched profiles and chat no longer show disease odds, risk labels, or family-planning advice. Legal copy says GenoMatch does not calculate a health result. Account deletion at `/delete-account`. Adopts the master ribbon logo. This is the likely product baseline for later stacked PRs. |
| #20 draft | `cursor/birthday-age-b465` | `cursor/refine-cream-product-b465` | Date of birth at signup; age calculated from birthday. The App Review binary still used a typed age. |
| #21 draft | `cursor/fix-empty-discover-b465` | `cursor/refine-cream-product-b465` | Discover was empty for new accounts because `account_status` can be null, so the deck query hid people. Fills nulls with `active`, writes `active` at signup, uses a security-definer deck function, and falls back to the public profile list. Applying `supabase/migrations/20260928120000_discoverable_account_status.sql` in the Supabase SQL editor was documented as enough to fix the already-submitted iPhone build without a new upload. Client fallback also exists on `cursor/discover-hotfix-b465`. |

Other `cursor/*` branches with suffix `b465` or `9206` are already on GitHub (birthday, discover hotfixes, genotype, splash, etc.).

## Key decisions

- Brand: the ratified public system is the **mirror** palette (ink `#0B0C0E`, ribbon red `#C8102E`, gold `#D4AF37`, cream, chrome). Forest green and the earlier crimson approximation were rejected. Red is for errors, destructive actions, or the sickle-cell awareness ribbon, not for a genotype risk line (Apple 1.4.1 risk).
- The user-facing match percent is lifestyle-only. Genotype letters are data the member entered, not a calculated health result. Later cream-product work removes disease odds and family-planning advice from match/chat.
- HbSC (`SC`) is first-class; `CC` is not.
- Identity selfie columns cannot be self-updated unless `app.allow_identity_update` is set; verified-city GPS overwrites are locked.
- Prefer the 16 Sep recovery line over the 3 July backup if restoring "lost" product work (`PR #18` vs `#17`).

## Known issues

- Several stacked draft PRs were never merged. `main` is behind the cream-product / Discover / birthday work.
- Discover emptiness for new accounts may still be live unless the 28 Sep 2026 SQL migration was applied.
- README and some in-repo status comments are out of date.
- EAS iOS production still needs a real Apple Team ID.
- App Store review binary may not include later draft work.
- Re-verify the Supabase project is not paused.
- Cloudinary unsigned preset defaults are named in `.env.example`; rotate or restrict if those were ever treated as private.

## Env vars (names only)

Copy `.env.example` to `.env.local` (do not commit values). The app will not boot without the anon key.

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Set the same `EXPO_PUBLIC_*` names in the Expo dashboard for EAS production builds.

## Next steps

1. Confirm the Supabase project is unpaused and reachable.
2. Check whether `20260928120000_discoverable_account_status.sql` has been applied; apply it if Discover is still empty.
3. Decide the integration branch: treat PR #19 as the product baseline, then bring in #20 and #21, rather than merging #17. Use #18 only if you still need the 16 Sep recovery work that is not already in #19.
4. Close or ignore PR #2 (Cursor env setup) unless you specifically need it.
5. Update the README so it describes current `main` and the chosen integration branch.
6. Only then consider a new EAS / TestFlight build (Team ID required).

## First prompt for GitHub Copilot coding agent

```
Work in https://github.com/oxbreed/genomatch-app, the Expo SDK 57 GenoMatch iOS/Android client (bundle ng.genomatch.app). Do not commit secrets. Do not change the mirror brand palette (ink #0B0C0E, ribbon red #C8102E, gold #D4AF37). Do not show genotype as a health risk percentage or family-planning advice. Lifestyle match percent stays separate from genotype letters.

main is a32bada4 (PRs #1 and #3–#16 merged). Open draft PRs: #19 (cursor/refine-cream-product-b465, likely product baseline), #20 (birthday age, based on #19), #21 (empty Discover fix, based on #19), #18 (restore 16 Sep recovery/wip-before-sdk57), #17 (older July restore, probably superseded), and #2 (Cursor env setup, ignore).

Please: 1) summarise how #19, #20 and #21 differ from main and from each other; 2) rebase or restack #19 onto current main if needed, then #20 and #21 on top, fixing conflicts; 3) keep the Discover account_status migration (supabase/migrations/20260928120000_discoverable_account_status.sql) intact and document whether it must be applied in the Supabase SQL editor for the App Review binary; 4) open or update a single draft PR for the stacked cream+birthday+Discover work, and say what a human must verify before merge. Do not merge.
```
