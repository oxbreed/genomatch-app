import { GenoLegalScreen } from '../src/components/shell';
import { GENOMATCH_PARENT_LINE } from '../src/constants/company';
import { LEGAL_UPDATED, TERMS_OF_SERVICE_SECTIONS } from '../src/constants/legal';

type TermsOfServiceProps = {
  onBack: () => void;
};

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <GenoLegalScreen
      title="Terms of Service"
      subtitle={`Last updated ${LEGAL_UPDATED} · ${GENOMATCH_PARENT_LINE}`}
      sections={TERMS_OF_SERVICE_SECTIONS}
      onBack={onBack}
    />
  );
}
