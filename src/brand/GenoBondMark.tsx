import GenoMatchLogo, { type GenoMatchLogoRender } from '../components/GenoMatchLogo';
import type { GenoLogoSurface } from './logoAssets';

type Props = {
  size?: number;
  opacity?: number;
  surface?: GenoLogoSurface;
  render?: GenoMatchLogoRender;
};

/** Small logo mark — transparent vector by default */
export function GenoBondMark({
  size = 48,
  opacity = 1,
  surface = 'light',
  render = 'vector',
}: Props) {
  return (
    <GenoMatchLogo size={size} surface={surface} render={render} style={{ opacity }} />
  );
}
