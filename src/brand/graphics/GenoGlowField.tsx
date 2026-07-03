import { View } from 'react-native';

type Props = {
  variant?: 'linen' | 'forest';
};

/** Retained for API compatibility — decorative glow removed */
export default function GenoGlowField(_props: Props) {
  return <View pointerEvents="none" />;
}
