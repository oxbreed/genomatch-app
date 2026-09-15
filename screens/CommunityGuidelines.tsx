import { GenoLegalScreen } from '../src/components/shell';
import { GENOMATCH_COMPANY } from '../src/constants/company';
import { COMMUNITY_GUIDELINES_SECTIONS } from '../src/constants/legal';

type CommunityGuidelinesProps = {
  onBack: () => void;
};

export default function CommunityGuidelines({ onBack }: CommunityGuidelinesProps) {
  return (
    <GenoLegalScreen
      title="Community Guidelines"
      subtitle={`Standards for every ${GENOMATCH_COMPANY.legalName} member`}
      sections={COMMUNITY_GUIDELINES_SECTIONS}
      onBack={onBack}
    />
  );
}
