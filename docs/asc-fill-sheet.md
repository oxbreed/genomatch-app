# App Store Connect fill sheet — GenoMatch 1.0.1

Click-by-click answers for a browser to paste into App Store Connect. Do **not** submit the app, and do **not** press Update Review, from this sheet.

Prepared 27 Nov 2026 (UK time). Apple Developer membership is **Enrolled as: Individual (Olusegun Adedoyin)**. Team ID: **M6T89CAAJ5**. Bundle ID: `ng.genomatch.app`.

## 0. Account and seller (do this first)

| Field | Value | Who |
| --- | --- | --- |
| Seller / artist name shown on the product page | **Olusegun Adedoyin** | Confirmed from the membership page. Not Genomatch Ltd. |
| Copyright | **2026 Olusegun Adedoyin** | Confirmed. The in-app and website legal pages can still say the service is operated by Genomatch Ltd Nigeria (RC No. 9236521); the App Store seller and copyright lines must match the individual enrollment. |
| Apple Team ID | M6T89CAAJ5 | Confirmed. |
| Contact phone | **[Only Olusegun can answer]** | Enter the phone on the Apple Developer / App Store Connect account. |

## 1. App Privacy (nutrition label)

Path: App Store Connect → GenoMatch → App Privacy.

1. Privacy Policy URL: `https://www.genomatch.app/privacy`
2. **Do you or your third-party partners use data from this app to track the user?** **No.**
3. **Do you collect data from this app?** **Yes.**

For every type below: **Linked to the user’s identity = Yes**, **Used for Tracking = No**, purpose = **App Functionality**. Do not add Purchases, Financial Info, Precise Location, Advertising Data, Search History, Browsing History, or Contacts.

| Click this Apple category | Declare? | Notes |
| --- | --- | --- |
| Contact Info → Email Address | Yes | Account email. |
| Contact Info → Name | Yes | Display name. |
| Identifiers → User ID | Yes | Account / profile ID. |
| Identifiers → Device ID | Yes | Expo push token, only if notification permission is granted. |
| Location → Coarse Location | Yes | City, country, rounded approximate coordinates. |
| Location → Precise Location | **No** | We do not keep a precise live trail. |
| Sensitive Info | Yes | Date of birth, gender, and self-reported genotype (AA, AS, SS, AC, or SC). |
| Health & Fitness → Health | **Yes, if the form still lists Health separately** | Same genotype value, used only to show it on the profile for dating compatibility, not for diagnosis or treatment. If the form forces a medical-app workflow you do not want, stop and ask Olusegun; otherwise declare it as App Functionality, linked, not tracking. |
| User Content → Photos or Videos | Yes | Profile photos and the identity-review selfie (selfie is for review, not the public profile photo). |
| User Content → Other User Content | Yes | Bio, interests, relationship goals, chat messages. |
| Usage Data → Product Interaction | Yes | Basic usage needed to run the service (for example last active time). |
| Diagnostics → Crash Data / Performance Data | **[Only Olusegun / the submitted binary can confirm]** | Declare only if a diagnostics SDK is in the 1.0.1 binary you submit. If none is present, omit this row. |

Turn **Used for Tracking** off on every type. Turn **Linked to User Identity** on for every type you declare.

## 2. Age rating questionnaire

Path: App Store Connect → GenoMatch → App Information → Age Rating. Expected result: **17+**. Do not tick Made for Kids.

| Question | Answer |
| --- | --- |
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| Mature/Suggestive Themes | Infrequent/Mild |
| Horror/Fear Themes | None |
| Medical/Treatment Information | Infrequent/Mild |
| Alcohol, Tobacco, or Drug Use or References | Infrequent/Mild |
| Simulated Gambling | None |
| Sexual Content or Nudity | None |
| Graphic Sexual Content and Nudity | None |
| Unrestricted Web Access | No |
| Gambling and Contests | No |
| Made for Kids | No |

If the form will not accept **None** for Sexual Content or Nudity because this is a dating app, use **Infrequent/Mild** and keep the zero-tolerance and report/block wording in the review notes. The app itself is 18+ (signup checkbox, real birthday, server check).

## 3. Version 1.0.1 metadata (English / UK or primary locale)

Path: App Store Connect → GenoMatch → the **1.0.1** version. Select the new EAS iOS build when it exists (**[Only Olusegun / EAS can complete — build not started; previous reviewed binary was build 5]**).

| Field | Value |
| --- | --- |
| Name | GenoMatch |
| Subtitle | Genotype-aware dating |
| Promo text | Share your genotype and find compatible matches. Built for adults in Nigeria, West Africa, and the diaspora. |
| Keywords | dating,genotype,compatible,match,Nigeria,West Africa,singles,relationship,AA,AS |
| Support URL | https://www.genomatch.app/support |
| Marketing URL | https://www.genomatch.app |
| Privacy Policy URL | https://www.genomatch.app/privacy |
| Copyright | 2026 Olusegun Adedoyin |

**Description** (paste exactly):

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

**What's New** (for 1.0.1):

Genotype is now obvious from the first screen, with a required genotype step and badges on Discover. Medical and diagnostic claims have been removed. This version also adds an 18+ birthday check, in-app account deletion, and report and block on profiles and in chat.

## 4. App Review Information

| Field | Value | Who |
| --- | --- | --- |
| Sign-in required | Yes | |
| Demo account user name | genomatchreview@gmail.com | Confirmed working (signed in 15:05 UK, 27 Nov 2026). |
| Demo account password | **[Only Olusegun can enter — do not type a guessed password]** | Already saved in ASC if he updated it after the reset; confirm it still works before submit. |
| Notes | See text below | |

**Review notes** (paste, then Olusegun should confirm the password field is filled):

GenoMatch is a genotype-aware dating app. The unique feature is that members share a self-reported genotype and see it on Discover profiles. We do not provide medical advice, diagnosis, or laboratory testing.

Please sign in with genomatchreview@gmail.com, which already has a completed profile and genotype. Discover should show other seeded profiles clearly labelled “Demo – …” with genotype badges. If the deck is empty, pull to refresh; the backend must be online for profiles to load.

Account deletion: Profile → scroll to Delete Account, or https://www.genomatch.app/delete-account
Privacy Policy: https://www.genomatch.app/privacy
Support: https://www.genomatch.app/support

## 5. Do not do from this sheet

- Do not click Submit for Review.
- Do not click Update Review.
- Do not upload a build or run `eas submit`.
- Do not change the seller name to Genomatch Ltd.
