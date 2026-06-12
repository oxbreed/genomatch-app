import { GenoLegalScreen } from '../src/components/shell';
import {
  GENOMATCH_ABOUT_LINE,
  GENOMATCH_COMPANY,
  GENOMATCH_OPERATOR_INTRO,
  GENOMATCH_PARENT_LINE,
  OXBREED_PARENT,
} from '../src/constants/company';

type AboutProps = {
  onBack: () => void;
};

const SECTIONS = [
  {
    title: 'Who we are',
    body: `${GENOMATCH_OPERATOR_INTRO}. We build GenoMatch for intentional, genotype-aware connections across Nigeria and West Africa.`,
  },
  {
    title: 'Parent company',
    body: `${OXBREED_PARENT.legalName} is the brand management company behind GenoMatch and other projects in our portfolio. Genomatch Ltd Nigeria operates the app, handles member data, and provides support.`,
  },
  {
    title: 'Contact',
    body: GENOMATCH_ABOUT_LINE,
  },
  {
    title: 'Legal',
    body:
      'Privacy Policy and Community Guidelines explain how we handle your data and what we expect from every member. You can open them from your Profile screen at any time.',
  },
];

export default function About({ onBack }: AboutProps) {
  return (
    <GenoLegalScreen
      title="About"
      subtitle={`${GENOMATCH_ABOUT_LINE}\n${GENOMATCH_PARENT_LINE}`}
      sections={SECTIONS}
      onBack={onBack}
    />
  );
}
