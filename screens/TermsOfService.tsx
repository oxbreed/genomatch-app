import { GenoLegalScreen } from '../src/components/shell';
import {
  GENOMATCH_COMPANY,
  GENOMATCH_CONTACT_LINE,
  GENOMATCH_OPERATOR_INTRO,
  GENOMATCH_PARENT_LINE,
} from '../src/constants/company';

type TermsOfServiceProps = {
  onBack: () => void;
};

const SECTIONS = [
  {
    title: 'Agreement',
    body: `By creating an account or using GenoMatch you agree to these terms with ${GENOMATCH_OPERATOR_INTRO}. If you do not agree, do not use the app.`,
  },
  {
    title: 'Eligibility',
    body:
      'You must be at least 18 years old. GenoMatch is a social discovery and dating service, not a medical, laboratory, or government identity service.',
  },
  {
    title: 'Your account',
    body:
      'You are responsible for your login details and for the photos, messages, and profile information you post. Keep your password private. We may suspend or close accounts that violate these terms or our Community Guidelines.',
  },
  {
    title: 'Profiles and genotype',
    body:
      'A genotype on a profile is something that member typed in. It is not a clinical test, a health result, or a government ID. A verified badge means they completed the in-app check, not a lab test or passport check.',
  },
  {
    title: 'Content licence',
    body:
      'You grant Genomatch Ltd Nigeria a licence to host and display your content as needed to operate the service. We may remove content that is illegal, harmful, or against our guidelines. Do not post photos of other people without permission, or any sexual content involving minors.',
  },
  {
    title: 'Safety',
    body:
      'We do not guarantee matches, conversations, or that other members’ profiles are accurate. Meet in public places and use your own judgement. GenoMatch is not a background-check service and is not liable for disputes between members or for offline meetings, to the extent permitted by law.',
  },
  {
    title: 'Service changes',
    body:
      'We may update the app, these terms, or discontinue features. Continued use after an update means you accept the revised terms. The app is provided “as is”.',
  },
  {
    title: 'Contact',
    body: `${GENOMATCH_CONTACT_LINE}. For legal notices: ${GENOMATCH_COMPANY.contactEmail}.`,
  },
];

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <GenoLegalScreen
      title="Terms of Service"
      subtitle={`Last updated September 2026 · ${GENOMATCH_PARENT_LINE}`}
      sections={SECTIONS}
      onBack={onBack}
    />
  );
}
