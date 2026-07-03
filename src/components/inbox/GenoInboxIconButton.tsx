import { Ionicons } from '@expo/vector-icons';
import { GenoMirrorActionButton } from '../../brand/graphics';
import { INBOX } from './inboxTokens';

type Variant = 'gold' | 'unmatch' | 'muted';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: Variant;
  accessibilityLabel: string;
};

export default function GenoInboxIconButton({
  icon,
  onPress,
  variant = 'gold',
  accessibilityLabel,
}: Props) {
  const size = INBOX.iconBtnSize;
  const kind = variant === 'gold' ? 'gold' : variant === 'unmatch' ? 'unmatch' : 'steel';

  return (
    <GenoMirrorActionButton
      size={size}
      kind={kind}
      icon={variant === 'unmatch' ? undefined : icon}
      iconSize={17}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
