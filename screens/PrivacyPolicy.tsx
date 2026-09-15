import { GenoLegalScreen } from '../src/components/shell';
import { GENOMATCH_PARENT_LINE } from '../src/constants/company';
import { LEGAL_UPDATED, PRIVACY_POLICY_SECTIONS } from '../src/constants/legal';

type PrivacyPolicyProps = {
  onBack: () => void;
};

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <GenoLegalScreen
      title="Privacy Policy"
      subtitle={`Last updated ${LEGAL_UPDATED} · ${GENOMATCH_PARENT_LINE}`}
      sections={PRIVACY_POLICY_SECTIONS}
      onBack={onBack}
    />
  );
}
