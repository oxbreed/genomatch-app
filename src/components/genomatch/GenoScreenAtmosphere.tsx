import GenoPremiumChrome from '../../brand/graphics/GenoPremiumChrome';
import type { GenoChromeVariant } from '../../brand/graphics/genoVisualTokens';

type Props = {
  variant?: 'linen' | 'mint';
};

/** Screen atmosphere — delegates to GenoPremiumChrome */
export default function GenoScreenAtmosphere({ variant = 'linen' }: Props) {
  const chromeVariant: GenoChromeVariant = variant === 'mint' ? 'mint' : 'linen';
  return <GenoPremiumChrome variant={chromeVariant} />;
}
