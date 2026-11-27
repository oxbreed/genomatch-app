# Google Play Console — fill sheet for GenoMatch 1.0.1

Draft for Olusegun to enter in Play Console. **Do not submit the app, pay the registration fee, or create a developer account from this document.** Values reflect the GenoMatch Expo/React Native app on `main` at `a61d780` (version **1.0.1**), checked on 27 Nov 2026 (Europe/London). Mapped from `docs/app-privacy-answers.md` and `docs/app-store-metadata-draft.md`, plus the live Android config.

**Package name:** `ng.genomatch.app`  
**Privacy policy URL:** https://www.genomatch.app/privacy  
**Account deletion URL (required by Play):** https://www.genomatch.app/delete-account  
**Support URL:** https://www.genomatch.app/support  
**Contact:** hello@genomatch.app

---

## 0. Play Console account status (as of 27 Nov 2026, 15:30 Europe/London)

This check could not be completed in Play Console itself.

Olusegun has said the Google account to use is **genomatch1@gmail.com**, which is the likely Play Console owner. That inbox is **not** connected (the Gmail connector only sees **oxbreedmanagement@gmail.com**, which is the recovery email for genomatch1). Confirming whether a developer account or a GenoMatch listing already exists needs a **browser sign-in to genomatch1@gmail.com at [https://play.google.com/console](https://play.google.com/console)**. Do not create an account or pay anything until that check is done.

### What was searched

- **Gmail (oxbreedmanagement@gmail.com only):** `from:googleplay-noreply@google.com`, Play Console / Google Play Developer senders, “Play Console”, “Google Play Developer”, “$25 registration”, “identity verification”, `ng.genomatch`, GenoMatch + Play, and genomatch1@gmail.com forwards or mentions together with Play.
- **Google Drive:** Play Console, service-account JSON, keystore, upload key, `google-services`.
- **Box files and this repo:** `eas.json` submit config, `google-services.json`, `serviceAccountKeyPath`, `android.package`, EAS Android credentials, `*.jks` / keystore files.

### What exists

- One consumer Play email only, to oxbreedmanagement@gmail.com:
  - **18 Sep 2024** — subject **“Updates to Google Play Terms of Service”**, from Google Play `<googleplay-noreply@google.com>`. Body is a consumer Terms change (Withdrawal Rights, Google Commerce Limited address, Family Link). It is **not** a Play Console or developer-registration email.
- genomatch1@gmail.com appears in oxbreedmanagement mail only as **Google Account security / recovery alerts** (for example 25 Nov 2025 “Someone added you as their recovery email”; later security-alert copies through 30 Sep 2026). **None** mention Play Console, a $25 fee, identity verification, or a GenoMatch listing.
- No Play Console, keystore, upload-key, or service-account files in Drive, the box, or this repo.
- `eas.json` `submit.production` is empty: no `serviceAccountKeyPath`, no Android submit profile.
- No `google-services.json` in the repo.

### What is missing / unverified

- Whether a Play Console **developer account** already exists on genomatch1@gmail.com (or any other Google account).
- Whether a GenoMatch **app listing** exists, and its status (draft, testing, rejected, or live).
- Whether **identity verification** is complete.
- Any policy or review emails. Those would arrive at **genomatch1@gmail.com**, which this connector cannot read.
- An Android **upload / signing key** (no keystore in repo or Drive; `*.jks` is gitignored). EAS can generate one after Expo login; back it up.
- A Play Console **API service account** for `eas submit`.
- Android **FCM** config (`google-services.json`) for push notifications.

### Cost warning — stop before spending money

A **new** Play Console account has a **one-time US $25 registration fee**. This work does not create that account and does not pay the fee. First sign in to [play.google.com/console](https://play.google.com/console) as genomatch1@gmail.com. Only pay if there is no existing account and Olusegun explicitly approves the charge.

If the account is a **personal** developer account created **after 13 November 2023**, Google also requires a **closed test with at least 12 testers opted in continuously for 14 days** before production access (see section 7). Organisation accounts and personal accounts created before that date are outside that rule. Account type and creation date can only be confirmed in the Console.

---

## 1. Data safety form

Complete this under **Policy → App content → Data safety**. Even a closed-testing build needs a completed form and a privacy policy URL (internal-testing-only apps are the exception).

### Overview answers

| Question | Answer |
| --- | --- |
| Does the app collect or share required user data types? | **Yes** |
| Is all of the user data collected by this app encrypted in transit? | **Yes** (HTTPS/TLS to Supabase, Cloudinary, and Expo/Google push) |
| Which of the following methods of account creation does your app support? | Account creation / sign-in with **email and password** (Supabase Auth). No Google, Facebook, or Apple sign-in in this binary. |
| Do you provide a way for users to request that their data be deleted? | **Yes** |
| Data deletion method | In-app: Profile → scroll to **Delete Account** → enter password → confirm (immediate). Also a public web URL (below) and email to hello@genomatch.app if the user cannot open the app. |
| Are you required to have a privacy policy? | **Yes**. URL: https://www.genomatch.app/privacy |

**“Collected”** means GenoMatch (or a library in the app) sends the data off the device. **“Shared”** on this form means transferred to a **third-party company or organisation**. Processors that only handle data on GenoMatch’s behalf (Supabase, Cloudinary, Expo or Google for push delivery) are **not** declared as sharing. Profile fields that other members can see are first-party dating functionality, not a transfer to another company — declare them as **collected**, not shared, unless Play’s live form wording says otherwise.

Data is **not sold**. Data is **not used for third-party advertising or tracking**. Primary purpose unless noted: **App functionality**. All types below are **linked to the user’s identity**.

### Data types to declare

| Play data type | What GenoMatch collects | Collected | Shared with a third party | Notes |
| --- | --- | --- | --- | --- |
| Personal info → Name | Display name | Yes | No | Shown to other members on the profile. |
| Personal info → Email address | Account email | Yes | No | Not shown on the public profile. |
| Personal info → User IDs | Account / profile ID | Yes | No | |
| Personal info → Sexual orientation | `interested_in` (“Who you want to see”: Women, Men, Everyone, Beyond binary) | Yes | No | **Sensitive.** Required for Discover. |
| Personal info → Political or religious beliefs | Optional profile religion | Yes | No | **Sensitive.** Shown on the profile if the member sets it. |
| Personal info → Other info | Date of birth, gender or pronouns (Male/Female/Other at signup; pronouns may also be stored), height, education | Yes | No | Gender / gender identity sits under “Other info” in Play’s current list (Sexual orientation is a separate type). Date of birth is used for the 18+ gate and is not shown as a raw birthday on Discover (age may be). |
| Health and fitness → Health info | Self-reported genotype (AA, AS, SS, AC, or SC) | Yes | No | **Sensitive / health information. Flag this.** Used only to show the value on the member’s profile for dating compatibility. Not diagnosis, treatment, or lab testing. Complete Play’s **Health apps** declaration if the form offers it. |
| Location → Approximate location | City, country, and coordinates rounded to 2 decimal places in `save_profile_location` (~1 km) | Yes | No | City is shown on the profile. Matches the privacy policy. |
| Location → Precise location | The Android binary requests `ACCESS_FINE_LOCATION`. The app reads a GPS fix (`Location.Accuracy.Balanced`) and sends raw latitude/longitude to the `save_profile_location` RPC, which then stores rounded values. | **Yes, declare it** while `ACCESS_FINE_LOCATION` remains in the manifest and raw coordinates leave the device | No | This is tighter than the Apple privacy sheet, which says Precise Location should be No. Either declare Precise location here, or later remove the fine-location permission and stop sending unrounded coordinates (code change, not done in this PR). |
| Photos and videos → Photos | Profile photos and the identity-review selfie | Yes | No | The selfie is for review only, not the public profile photo. Photos are hosted by Cloudinary (processor). |
| Audio files | — | **No** | — | The prebuild manifest currently includes `RECORD_AUDIO` (likely from expo-image-picker) even though camera audio is disabled in `app.json`. Do **not** declare audio collection unless a later build actually records audio. Prefer blocking the permission in a follow-up (not done here). |
| Messages → Other in-app messages | Chat messages after a mutual match | Yes | No | |
| App activity → App interactions | Basic usage needed to run the service (for example last active time) | Yes | No | |
| App info and performance → Crash logs / Diagnostics | — | **No, unless a crash SDK is in the submitted binary** | — | There is no Sentry, Firebase Crashlytics, Bugsnag, or similar in `package.json`. The live privacy policy still says “error and crash reports” are collected automatically — that line should be removed or a real SDK added, so the policy and this form match. `expo-updates` is an update channel, not a crash reporter. |
| Device or other IDs | Expo push token, only if notification permission is granted | Yes | No | Delivered via Expo / Google FCM if configured. **Android FCM is not set up yet** (no `google-services.json`), so tokens may not work on Android until that is added. Still declare the type if the submitted build contains `expo-notifications`. |

Do **not** declare, unless a later build adds them: financial info, purchases, phone number, physical address, contacts, SMS, calendar, browsing or search history, advertising data, fitness info, or files other than photos.

### Per-type handling (use for every type above that is collected)

- **Is this data collected, shared, or both?** Collected.
- **Is this data processed ephemerally?** No (it is stored), except the raw GPS fix, which is rounded before storage. Still declare collection of precise location as above.
- **Is this data required for your app, or can users choose whether it's collected?** Account email, user ID, name, date of birth, gender, genotype, and `interested_in` are **required** for the service. Photos, identity selfie, location, religion, lifestyle fields, messages, and the push token are **optional** or collected only after a permission or user action (messages after a match).
- **Why is this user data collected?** App functionality. (Account management may also be ticked for email and user IDs if the form allows more than one purpose.)
- **Is this data shared?** No (see overview).
- Encrypted in transit: **Yes**. Users can request deletion: **Yes**.

---

## 2. IARC content-rating questionnaire

Complete this under **Policy → App content → Content rating**. Email for IARC correspondence: **hello@genomatch.app** (or Olusegun’s preferred address).

**Category to pick:** Social networking / communication (dating), not a game, not a utility-only app.

The live form wording can differ slightly. Recommended answers for GenoMatch:

| Topic | Answer | Why |
| --- | --- | --- |
| User interaction / users can communicate | **Yes** | Profiles, likes, and chat after a mutual match. |
| User-generated content | **Yes** | Bios, photos, messages, lifestyle fields. Moderated: required Terms / Privacy / Community Guidelines checkbox at signup, automatic text screening, new photos queued for review, report and block on profiles and in chat, hello@genomatch.app. Zero tolerance for objectionable content. |
| Shares the user’s location | **Yes** | City on the profile; optional device location to set city and nearby matching. |
| Users can share their location with other users | **Yes** (city / approximate) | Other members see city, not a live precise trail. |
| Unrestricted internet access | **No** | The app opens specific legal and support URLs in the system browser. It is not a general-purpose browser. |
| Digital purchases, in-app purchases, or paid content | **No** | No store or subscriptions in this binary. Re-take the questionnaire if that changes. |
| Gambling, contests, or simulated gambling | **No** | |
| Violence, bloodshed, or horror | **No** / None | |
| Profanity or crude humour in official content | **No** / None | UGC is filtered and reportable. |
| Sexual content or nudity in official content | **No** / None | Community Guidelines ban nudity and sexual solicitations. If the form asks whether **users** might post sexual content, describe the zero-tolerance policy and moderation rather than claiming UGC is impossible. |
| Mature or suggestive themes | **Yes**, mild / infrequent | This is a dating app for adults, with relationship goals and chat after a match. |
| Alcohol, tobacco, or drug references | **Yes**, mild / infrequent | Optional profile fields for drinking and smoking status. The app does not promote substance use. |
| Medical or treatment information | **Yes**, mild / infrequent | Members enter a self-reported genotype and see it on profiles. The app does not give medical advice, diagnosis, or laboratory testing. |
| Made for children / appeals to children | **No** | 18+ only. |

Expected outcome is a mature rating (often PEGI 16 / equivalent, sometimes 18 in some regions) which is consistent with an **18+** target audience. If the calculated rating looks wrong, retake the questionnaire rather than submitting a guess.

---

## 3. Target audience and content

- **Target age group:** **18 and over only**. Do not select 13–15, 16–17, or “under 13”.
- **News apps, COVID-19, and other sensitive-event declarations:** No, unless the live form specifically asks about health features — then point at the Health declaration (genotype is self-reported dating data, not a medical tool).
- **Appeal to children:** No.
- Age gate already in the app: Register requires “I confirm I am at least 18 years old”; Profile Setup collects a real birthday and blocks under-18 dates; the server rejects a date of birth under 18.

---

## 4. App access (review login)

Play needs a working sign-in so reviewers can reach Discover, chat, and account deletion.

```
Email: genomatchreview@gmail.com
Password: provided separately in the Play Console App access password field
  (same review password as saved in App Store Connect Sign-In Information;
   do not paste it into store listing text or this repository)
```

Instructions to paste:

> GenoMatch is a genotype-aware dating app for adults 18 and over. Members share a self-reported genotype and see it on Discover profiles. We do not provide medical advice, diagnosis, or laboratory testing.
>
> Sign in with the reviewer account in the App access fields. That account already has a completed profile and genotype. Discover should show other seeded demo profiles with genotype badges (names begin “Demo – ”). If the deck is empty, pull to refresh; the backend must be online for profiles to load.
>
> Account deletion (for review, please do not delete the reviewer account): Profile → scroll to Delete Account, or read https://www.genomatch.app/delete-account
>
> Privacy Policy: https://www.genomatch.app/privacy
> Support: https://www.genomatch.app/support

---

## 5. Account deletion (Play requirement)

Play requires a way to request deletion **inside the app** (or a clearly linked in-app path) **and** a web URL that explains how to request deletion, without requiring the reviewer to install the app first.

**In-app path:** Profile → scroll to **Delete Account** → enter password → confirm. Deletion is immediate (profile, messages, likes, photos, identity-review selfies, and login).

**Web URL:** https://www.genomatch.app/delete-account  

Checked 27 Nov 2026 (Europe/London): the URL returns **HTTP 200**, is hosted on Vercel, and explains how to request deletion: the in-app steps above, what is deleted, what limited records may be kept (abuse/ban prevention), and that users who cannot open the app can email **hello@genomatch.app** from the address on the account (response within five working days). This meets Play’s “URL that explains how to request deletion” requirement.

---

## 6. Store listing (adapt from the approved App Store metadata)

Do not add medical claims, child-risk percentages, “family planning”, diagnosis, or laboratory-testing language.

| Field | Copy | Limit |
| --- | --- | --- |
| App name | GenoMatch | 30 characters (9 used) |
| Short description | Share your genotype and find compatible matches. Dating for adults 18+. | 80 characters (71 used) |
| Full description | See below | 4000 characters |

**Full description:**

```
GenoMatch is a dating app for adults 18 and over that puts genotype on the table from the start.

Share your genotype (AA, AS, SS, AC, or SC) when you create your profile, then discover people who have also shared theirs. Every Discover profile shows a genotype badge so you can see compatibility at a glance, alongside interests, city, and relationship goals.

You enter your genotype yourself. GenoMatch does not test it, and it does not provide medical advice. If you have questions about your genotype, talk to a qualified health professional.

Features:
• Required genotype step when you join
• Genotype badge and filters on Discover
• Profiles, likes, and chat after a mutual match
• Report and block tools
• Delete your account from Profile at any time

Privacy Policy: https://www.genomatch.app/privacy
Support: https://www.genomatch.app/support
Delete account: https://www.genomatch.app/delete-account

GenoMatch is operated by Genomatch Ltd Nigeria (RC No. 9236521). 18+ only.
```

**Category:** Dating (primary). Do not use Health & Fitness as the primary category — that would mis-describe a dating app and tighten the Health policy.

**Tags / graphic assets still needed from Olusegun (not in this repo):**

- At least two phone screenshots (Play requires them; 16:9 or the current Play sizes).
- Optional 7-inch and 10-inch tablet screenshots if you claim tablet support. The app is phone-portrait first (`orientation: portrait`; iOS sets `supportsTablet: false`). Prefer phone-only unless you have tablet layouts.
- Feature graphic (1024 × 500 px).
- High-res icon (512 × 512 px). The Expo icon is at `assets/icon.png` — check it meets Play’s 512 px requirement or export a 512 px version.
- Contact email, and the physical developer address Play asks for on the account.

**Developer / seller name:** decide whether the Play account is personal (Olusegun Adedoyin — matching the current Apple membership) or an organisation (Genomatch Ltd Nigeria). That choice affects verification and the 12-tester rule.

---

## 7. Dating-app, health, and other declarations

Complete these under **Policy → App content** if Play shows them.

**Dating apps**

- Select the **Dating** category.
- Confirm the app is **18+** and has an age gate.
- Confirm users can **block and report**.
- Confirm a prominent **privacy policy** and **community guidelines**.
- User-generated photos and chat are moderated as described above.
- Do not allow the app to be used to sell sexual content or to contact minors (minors are blocked at signup).

**Health apps / health features**

- Genotype is **health information**. If Play shows a Health declaration, complete it.
- Recommended answers: this is **not** a medical device; it does **not** provide diagnosis, treatment, or medical advice; genotype is **self-reported** by the member and shown on their dating profile for compatibility only; no lab testing is performed in the app.
- Keep store and in-app wording aligned with that (already the approved App Store line).

**Other likely forms**

- **News app / COVID-19:** No.
- **Data safety** and **content rating:** sections 1–2.
- **Government apps / political:** No.
- **Financial features:** No.
- **Ads:** No third-party ads in this binary.

**Privacy-page caveat:** the live policy at https://www.genomatch.app/privacy (checked 27 Nov 2026) is dated November 2026 and already covers SC genotype, approximate location, the identity selfie, and account deletion. Two issues remain: (1) it still says error and crash reports are collected, but this binary has no crash SDK; (2) the page (and the delete-account page) still render a “SCD News” ticker with sickle-cell medical headlines, which can look like medical-claim context on a legal page. Fix those on the marketing site before relying on the URL in Play review. This PR does not change the live site.

---

## 8. Closed testing (12 testers / 14 days)

If Play Console shows that this is a **personal developer account created after 13 November 2023**, production stays locked until you:

1. Finish app setup (store listing, Data safety, content rating, privacy policy, app access).
2. Start a **closed test**.
3. Have **at least 12 testers opted in** (they must open the opt-in link and accept; being on the email list is not enough).
4. Keep those 12 opted in **continuously for the 14 days immediately before you apply** for production access. If someone opts out and back in, their 14 days restart. Recruit more than 12.
5. Apply for production access on the Dashboard and answer Google’s questions about the test.

Google may still ask for more testing if engagement is too low. Organisation accounts, and personal accounts created before 13 November 2023, are not under this rule — confirm the account type in the Console after signing in as genomatch1@gmail.com.

Internal testing (up to 100 testers) can start earlier and does not replace the closed-test requirement.

---

## 9. Android / EAS config readiness (notes only — no code changes in this PR)

Checked on `main` at `a61d780` and with a local `npx expo prebuild --platform android --no-install` on 27 Nov 2026 (Europe/London). Prebuild **succeeded**. The generated `android/` folder is gitignored and is **not** committed. Prebuild rewrote `package.json` scripts (`expo start --android/ios` → `expo run:android/ios`); that change was **reverted** and is not in this PR.

| Item | Status |
| --- | --- |
| `expo.android.package` | `ng.genomatch.app` — set and matches the iOS bundle ID style. |
| Version name | `1.0.1` in `app.json` (`expo.version`). |
| `versionCode` | Not hardcoded in `app.json`. `eas.json` has `"autoIncrement": true` and `"appVersionSource": "remote"`, so EAS will assign and bump `versionCode` on production builds. A local prebuild stamped `versionCode 1` / `versionName "1.0.1"` in `android/app/build.gradle` (local only). |
| `eas.json` production profile | Has `channel: production` and `autoIncrement: true`. iOS sets `resourceClass: m-medium`. **No Android-specific keys.** EAS production Android builds default to an **app bundle (AAB)**, which is what Play wants. You do not need `"buildType": "app-bundle"` unless you want it spelled out in a later PR. |
| `eas.json` submit | `submit.production` is `{}`. There is no `android.serviceAccountKeyPath`. `eas submit --platform android` will not work until a Play Console service account JSON is created and added (after a Console account exists). |
| Expo project | `owner: oxbreed`, `projectId: 11f7d939-f2b9-4c0c-a1bf-bd7411c45ec6`. An Expo login (or token) is required to run an EAS Android build. That login was not available on the build machine when this sheet was written. |
| Signing key | No upload keystore in the repo or Drive. EAS can generate and store credentials on first Android production build. Olusegun should keep a backup of the keystore once it exists. Losing it blocks updates to the same Play listing. |
| `google-services.json` / FCM | Missing. `expo-notifications` is in the app, and the prebuild manifest already has Firebase Cloud Messaging notification metadata, but without a Firebase/FCM app and `google-services.json`, Android push may not work. Not a hard store-listing blocker; it is a product gap. |
| Permissions in `app.json` | `CAMERA`, `READ_MEDIA_IMAGES`, `READ_EXTERNAL_STORAGE`, `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`. |
| Permissions after prebuild (main manifest) | The above, plus `INTERNET`, `RECORD_AUDIO`, `SYSTEM_ALERT_WINDOW`, `VIBRATE`, and `WRITE_EXTERNAL_STORAGE` (maxSdk 32). `READ_EXTERNAL_STORAGE` is limited to maxSdk 32. |

**Permission notes (do not change in this PR):**

- `CAMERA` — used (live identity selfie via `expo-camera`). Keep.
- `READ_MEDIA_IMAGES` — used (profile photo picker via `expo-image-picker`). Keep.
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` (maxSdk 32) — typical for the picker on Android 12 and below. Keep unless you later drop old-API support.
- `ACCESS_COARSE_LOCATION` — used for city / nearby matching. Keep.
- `ACCESS_FINE_LOCATION` — requested, and raw coordinates are sent to the backend before rounding. If the product only needs city-level location, a later PR can drop fine location and declare only Approximate location. Until then, declare Precise location on the Data safety form.
- `RECORD_AUDIO` — appeared in the prebuild manifest even though `expo-camera` has `microphonePermission: false` and `recordAudioAndroid: false`. Almost certainly added by `expo-image-picker`. The app should not need the microphone. A later PR can block it with an `expo-build-properties` / manifest policy. Do not declare audio collection.
- `SYSTEM_ALERT_WINDOW` — pulled in by the Expo/React Native template. Review later; often removable for production if unused.
- `VIBRATE` — expected for notifications. Keep.

---

## 10. What Olusegun still needs to do

1. Sign in to [https://play.google.com/console](https://play.google.com/console) as **genomatch1@gmail.com** and say whether a developer account and a GenoMatch listing already exist, whether identity verification is done, and the current app status.
2. If there is **no** account, decide whether to register a **personal** or **organisation** account, then explicitly approve the **US $25** fee before anyone pays it. Organisation verification is a different (slower) path and may need company documents / D-U-N-S.
3. If it is a personal account created after 13 Nov 2023, plan the **12 testers / 14-day** closed test.
4. Log in to **Expo** (or provide an Expo token) so an Android production AAB can be built with EAS. Do not upload it to Play until Olusegun approves.
5. When EAS creates the Android upload key, **back up the keystore**.
6. Add Firebase / `google-services.json` if Android push should work in the store build.
7. Supply Play graphic assets (screenshots, 1024×500 feature graphic, 512×512 icon) and the developer contact address.
8. Paste this sheet into Play Console. **Do not submit the app for review** until the AAB, Data safety, rating, listings, and (if required) closed test are done, and Olusegun gives a separate go-ahead.
9. Optionally tidy the live privacy and delete-account pages (crash-report sentence; SCD News ticker) so reviewers do not see medical-news context on the legal URLs.

Nothing in this pull request submits to Google Play, creates a Console account, or changes app code on `main`.
