import { GenoLegalScreen } from '../src/components/shell';
import {
  GENOMATCH_COMPANY,
  GENOMATCH_CONTACT_LINE,
  GENOMATCH_OPERATOR_INTRO,
  GENOMATCH_PARENT_LINE,
} from '../src/constants/company';

type PrivacyPolicyProps = {
  onBack: () => void;
};

const SECTIONS = [
  {
    title: 'Introduction',
    body: `${GENOMATCH_OPERATOR_INTRO}, collects and processes your personal data to provide genotype-aware matchmaking services. This policy explains what we collect, how we use it, and your rights.`,
  },
  {
    title: 'Data We Collect',
    body:
      'We collect information you provide when using GenoMatch, including your name, email address, genotype, profile photos, messages with matches, and location (city only). We also collect technical data needed to operate the app securely.',
  },
  {
    title: 'How We Use Your Data',
    body:
      'Your data powers our matching algorithm, displays your profile to compatible members, and enables communication between mutual matches. We use your information only to deliver and improve the GenoMatch experience.',
  },
  {
    title: 'Genotype Data',
    body:
      'Genotype information is treated as sensitive health-related data. It is never sold to third parties and is used solely for compatibility scoring and safety-aware matching within GenoMatch.',
  },
  {
    title: 'Data Sharing',
    body:
      'We do not sell your personal data. We share data only with service providers essential to operating the app: Supabase (secure storage and authentication) and Cloudinary (profile photo hosting).',
  },
  {
    title: 'Your Rights',
    body: `You may request access to, correction of, or deletion of your personal data at any time. Contact ${GENOMATCH_COMPANY.contactEmail} and we will respond within a reasonable timeframe.`,
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

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <GenoLegalScreen
      title="Privacy Policy"
      subtitle={`Last updated June 2026 · ${GENOMATCH_PARENT_LINE}`}
      sections={SECTIONS}
      onBack={onBack}
    />
  );
}
