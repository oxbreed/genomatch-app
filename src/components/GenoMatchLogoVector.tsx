import GenoMatchLogo from './GenoMatchLogo';

type Props = {
  size?: number;
};

/**
 * Kept as its own name for existing imports. The hand-drawn vector was only ever
 * an approximation of the ribbon mark, so it now renders the real artwork.
 */
export default function GenoMatchLogoVector({ size = 80 }: Props) {
  return <GenoMatchLogo size={size} />;
}
