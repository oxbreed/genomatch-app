import { GenoLegalScreen } from '../src/components/shell';
import { GENOMATCH_COMPANY, GENOMATCH_CONTACT_LINE } from '../src/constants/company';

type CommunityGuidelinesProps = {
  onBack: () => void;
};

const SECTIONS = [
  {
    title: 'Our Community',
    body:
      'GenoMatch is built on respect, honesty, and intentionality. Every member helps create a space where people can connect with clarity and care.',
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
      'Do not misrepresent your genotype. This information affects real families and health decisions. Self-declared verification is a trust signal, not a medical test.',
  },
  {
    title: 'Reporting',
    body:
      'Use the report button on profiles and in chats when you see a violation. Our team reviews reports within 24 hours.',
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

export default function CommunityGuidelines({ onBack }: CommunityGuidelinesProps) {
  return (
    <GenoLegalScreen
      title="Community Guidelines"
      subtitle={`Standards for every ${GENOMATCH_COMPANY.legalName} member`}
      sections={SECTIONS}
      onBack={onBack}
    />
  );
}
