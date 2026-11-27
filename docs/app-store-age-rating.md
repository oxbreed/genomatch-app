# App Store Connect — age rating questionnaire

Recommended answers for GenoMatch, drafted 27 Nov 2026 (UK time). Enter these in App Store Connect; this file does not submit them. The app itself enforces **18+** at signup (required confirmation on Register, plus a real birthday in Profile Setup and a server-side `enforce_minimum_age_18` check). Apple’s highest standard age rating is **17+**.

## Recommended rating

**17+**. Do not tick Made for Kids.

## Questionnaire answers

Unless a later form wording differs, answer as follows. “None” means the app and its official content do not include that category. User-generated content is filtered, and objectionable material is not allowed.

| Category | Answer | Why |
| --- | --- | --- |
| Cartoon or Fantasy Violence | None | Not in the product. |
| Realistic Violence | None | Not in the product. |
| Prolonged Graphic or Sadistic Realistic Violence | None | Not in the product. |
| Profanity or Crude Humor | None | Official copy does not use it; UGC is filtered and reportable. |
| Mature/Suggestive Themes | Infrequent/Mild | This is a dating app for adults, with relationship goals and chat after a match. |
| Horror/Fear Themes | None | Not in the product. |
| Medical/Treatment Information | Infrequent/Mild | Members enter a self-reported genotype (AA, AS, SS, AC, or SC) and see it on profiles. The app does not give medical advice, diagnosis, or laboratory testing. Choose Infrequent/Mild rather than Frequent/Intense so the rating reflects mention of genotype, not graphic medical content. |
| Alcohol, Tobacco, or Drug Use or References | Infrequent/Mild | Optional profile fields include drinking and smoking status. The app does not promote substance use. |
| Simulated Gambling | None | No gambling features. |
| Sexual Content or Nudity | None | Community Guidelines have zero tolerance for nudity and sexual solicitations. Report and block are available on profiles and in chat. |
| Graphic Sexual Content and Nudity | None | Prohibited and moderated. |
| Unrestricted Web Access | No | The app opens specific legal and support URLs in the system browser. It is not a general-purpose web browser. |
| Gambling and Contests | No | |
| Made for Kids | No | 18+ only. |

If Apple’s form groups “Sexual Content or Nudity” with dating context and will not accept None, use Infrequent/Mild and keep the zero-tolerance and reporting description in the review notes.

## Age gate already in the app

1. Register requires an “I confirm I am at least 18 years old” checkbox.
2. Profile Setup (release 1.0.1 candidate) collects a real birthday and blocks dates that make the person under 18.
3. The database rejects a date of birth under 18 (`MINIMUM_AGE_18`).
