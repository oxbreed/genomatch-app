import {
  GENOMATCH_COMPANY,
  GENOMATCH_CONTACT_LINE,
  GENOMATCH_OPERATOR_INTRO,
  GENOMATCH_PARENT_LINE,
} from './company';

export type LegalSection = { title: string; body: string };

export const LEGAL_UPDATED = 'November 2026';

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    title: 'Introduction',
    body: `${GENOMATCH_OPERATOR_INTRO}, collects and processes your personal data to run the GenoMatch dating service. This policy explains what we collect, how we use it, and your rights.`,
  },
  {
    title: 'Data We Collect',
    body:
      'We collect the account and profile information you provide: name, email address, date of birth, gender, interests, relationship goals, messages with matches, and the genotype you enter (AA, AS, SS, AC, or SC). Genotype is sensitive, health-adjacent information. We also collect profile photos; an identity-review selfie (used to check that you are a real person and not shown as your public profile photo); approximate location (the city you choose, and if you allow it, a coarse device location used to set that city and nearby matching — we store rounded coordinates, not a precise live trail); and a push-notification token if you grant notification permission. The camera is used only when you take a live selfie for photo or identity review. We also collect technical data needed to operate the app securely.',
  },
  {
    title: 'How We Use Your Data',
    body:
      'We use your data to show your profile to other adults, including the genotype you enter so you can find compatible matches, to let mutual matches message each other, to review identity selfies and photos, to send optional match and message notifications if you allow them, and to keep the service working. We do not use this data to track you across other companies’ apps or websites, and we do not use it for third-party advertising. GenoMatch does not provide medical advice; talk to a qualified health professional.',
  },
  {
    title: 'Genotype Data',
    body:
      'Genotype is something you type in. We treat it as sensitive information, show it on your profile, and never sell it. GenoMatch does not provide medical advice, diagnosis, or laboratory testing.',
  },
  {
    title: 'Data Sharing',
    body:
      'We do not sell your personal data. We share data only with service providers essential to operating the app: Supabase (secure storage and authentication), Cloudinary (photo hosting, including profile photos and identity-review selfies), and Expo or Apple or Google (delivering push notifications if you opted in).',
  },
  {
    title: 'Your Rights',
    body: `You may request access to, correction of, or deletion of your personal data at any time. Delete your account from Profile → Delete Account in the app, or contact ${GENOMATCH_COMPANY.privacyEmail} and we will respond within a reasonable timeframe.`,
  },
  {
    title: 'Data Retention',
    body:
      'Data for active accounts is retained while your account remains open. When you request account deletion, we delete or anonymise your personal data in line with applicable Nigerian law, subject to limited retention where required for legal or security purposes.',
  },
  {
    title: 'Data Protection Contact',
    body: `For data-protection and privacy matters, contact ${GENOMATCH_COMPANY.privacyEmail}.`,
  },
  {
    title: 'Contact',
    body: GENOMATCH_CONTACT_LINE,
  },
];

export const TERMS_OF_SERVICE_SECTIONS: LegalSection[] = [
  {
    title: 'Agreement',
    body: `These terms govern use of GenoMatch, operated by ${GENOMATCH_OPERATOR_INTRO}. By creating an account you agree to these terms, our Privacy Policy, and our Community Guidelines, including a zero-tolerance policy for objectionable content.`,
  },
  {
    title: 'Eligibility',
    body:
      'GenoMatch is for people who are at least 18 years old. You confirm your age when you register. We may remove accounts that appear to belong to minors.',
  },
  {
    title: 'Not medical advice',
    body:
      'GenoMatch is a genotype-aware dating app. A genotype on a profile is self-reported. GenoMatch does not provide medical advice; talk to a qualified health professional.',
  },
  {
    title: 'Your account',
    body:
      'You are responsible for the accuracy of your profile, including your genotype, photos, and age. Do not impersonate anyone else. You may delete your account at any time from Profile → Delete Account.',
  },
  {
    title: 'Zero tolerance',
    body:
      'There is no tolerance for objectionable content or abusive behaviour on GenoMatch. Do not post nudity, harassment, hate speech, scams, sexual solicitations, threats, or anything involving minors. Use report and block on profiles and in chat if you see a violation. Every report is reviewed, blocking takes effect immediately, and we may remove content or permanently ban accounts that break these rules. Serious cases may be reported to the authorities.',
  },
  {
    title: 'Photos and messages',
    body:
      'You grant GenoMatch a limited licence to host the content you upload so we can operate the service. Do not post nudity, harassment, scams, or anyone else’s images without permission. We screen text automatically, review new photos, and may remove content or accounts that break these rules.',
  },
  {
    title: 'Safety',
    body:
      'Meet in public places, never send money to someone you met on the app, and use report and block if someone makes you uncomfortable. GenoMatch is not responsible for the conduct of other members.',
  },
  {
    title: 'Termination',
    body:
      'We may suspend or permanently ban accounts for Community Guidelines violations, fraud, or legal risk. You may stop using the app and delete your account at any time.',
  },
  {
    title: 'Law',
    body: `These terms are governed by the laws of ${GENOMATCH_COMPANY.jurisdiction}. ${GENOMATCH_PARENT_LINE}.`,
  },
  {
    title: 'Contact',
    body: GENOMATCH_CONTACT_LINE,
  },
];

export const COMMUNITY_GUIDELINES_SECTIONS: LegalSection[] = [
  {
    title: 'Our Community',
    body:
      'GenoMatch is built on respect, honesty, and intentionality. Every member helps create a space where people can connect with clarity and care.',
  },
  {
    title: 'Zero Tolerance',
    body:
      'There is no tolerance for objectionable content or abusive behaviour on GenoMatch. Using the app means agreeing to that. Accounts that post sexual solicitations, slurs, threats, scam requests or anything involving minors are removed, and serious cases are reported to the authorities.',
  },
  {
    title: 'How Content Is Checked',
    body:
      'Messages and profile text are screened automatically before they are posted, and anything the filter flags goes to a person to review along with newly uploaded photos. Screening is not perfect, which is why reporting and blocking matter.',
  },
  {
    title: 'Be Honest',
    body:
      'Use real photos, share an accurate genotype, and be clear about your intentions. Authentic profiles build trust and better matches.',
  },
  {
    title: 'Be Respectful',
    body:
      'Harassment, hate speech, and discriminatory language are not tolerated. Treat others the way you would want to be treated in conversation and on dates.',
  },
  {
    title: 'Stay Safe',
    body:
      'Never share financial information with other members. When you meet in person, choose a public place and tell someone you trust where you are going.',
  },
  {
    title: 'Genotype Integrity',
    body:
      'Do not misrepresent your genotype. Other members may read what you enter. A verified badge means you completed the in-app check, not a laboratory test.',
  },
  {
    title: 'Reporting',
    body:
      'Use the report button on profiles and in chats when you see a violation. Every report is reviewed, and blocking takes effect immediately.',
  },
  {
    title: 'Consequences',
    body:
      'Violations may result in a warning, temporary suspension, or a permanent ban depending on severity and repeat behavior.',
  },
  {
    title: 'Contact',
    body: `Questions about these guidelines? ${GENOMATCH_CONTACT_LINE}`,
  },
];
