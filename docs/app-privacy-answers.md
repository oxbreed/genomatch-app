# App Store Connect — App Privacy (nutrition label) answers

Draft for Olusegun to enter in App Store Connect. Do not submit from this document automatically. Values reflect the GenoMatch iOS app as of 27 Nov 2026 (UK time), after the 1.0.1 release-candidate audit.

**Privacy Policy URL:** https://www.genomatch.app/privacy

## Tracking

- **Do you or your third-party partners use data for tracking purposes?** No.
- The app does not use App Tracking Transparency and has no `NSUserTrackingUsageDescription`, because it does not track people across other companies’ apps or websites and does not use the data for third-party advertising.

## Data collection overview

Collect data: **Yes**. All items below are **linked to the user’s identity**. None are used for tracking. Primary purpose unless noted: **App Functionality**.

| Apple category | What GenoMatch collects | Linked to identity | Tracking | Purposes |
| --- | --- | --- | --- | --- |
| Contact Info → Email Address | Account email | Yes | No | App Functionality |
| Contact Info → Name | Display name | Yes | No | App Functionality |
| Identifiers → User ID | Account / profile ID | Yes | No | App Functionality |
| Identifiers → Device ID | Expo push token, only if notification permission is granted | Yes | No | App Functionality |
| Location → Coarse Location | City, country, and rounded approximate coordinates (not a precise live trail). Precise Location should be **No**. | Yes | No | App Functionality |
| Sensitive Info | Date of birth, gender, and self-reported genotype (AA, AS, SS, AC, or SC). Treat genotype as sensitive, health-adjacent data. | Yes | No | App Functionality |
| Health & Fitness → Health | Optional extra declaration for genotype, if App Store Connect still lists Health separately. Used only to show the value on the member’s profile for dating compatibility, not for diagnosis or treatment. | Yes | No | App Functionality |
| User Content → Photos or Videos | Profile photos and the identity-review selfie (the selfie is for review, not the public profile photo) | Yes | No | App Functionality |
| User Content → Other User Content | Bio, interests, relationship goals, chat messages | Yes | No | App Functionality |
| Usage Data → Product Interaction | Basic app usage needed to run the service (for example last active time) | Yes | No | App Functionality |
| Diagnostics → Crash Data / Performance Data | Error and crash reports if a diagnostics SDK is enabled in the binary you submit. If none is present in the submitted build, omit this row. | If collected, yes | No | App Functionality |

Do **not** declare: Purchases, Financial Info, Precise Location, Advertising Data, Search History, Browsing History, Contacts, or Other Diagnostic Data unless a later build adds them.

## Third parties

Data is shared only with processors that run the service: Supabase (account and database), Cloudinary (photos and identity selfies), and Expo or Apple or Google (push delivery if the user opted in). Not sold. Not used for third-party advertising.

## Privacy nutrition label tips

- Toggle “Used for Tracking” off for every type.
- Toggle “Linked to User Identity” on for every type above.
- After pasting the approved privacy policy URL, preview the product page and confirm the label matches this sheet.
- If the live marketing policy at https://www.genomatch.app/privacy still lags the in-app policy (for example missing SC, GPS, or identity selfie, or still using “family planning” wording), update `oxbreed/genomatch-landing` before submit so the URL Apple opens matches this declaration.

## iOS privacy manifest

Required-reason API usage is declared in `app.json` under `expo.ios.privacyManifests` and is written into `PrivacyInfo.xcprivacy` at prebuild:

- UserDefaults — CA92.1
- FileTimestamp — C617.1
- DiskSpace — E174.1
- SystemBootTime — 35F9.1

Usage strings already in Info.plist: camera (live selfie for photo review), photo library (profile picture), location when in use (set city and nearby matching).
