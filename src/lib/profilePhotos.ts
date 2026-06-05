import { resolveProfilePhotos } from './profileMapper';
import type { DiscoveryProfile } from '../types/database';

/** First displayable photo URL for avatars, cards, and match modals. */
export function getPrimaryPhotoUri(
  avatarUrl?: string | null,
  photos?: string[] | null
): string | null {
  const resolved = resolveProfilePhotos(avatarUrl ?? null, photos ?? []);
  return resolved[0] ?? null;
}

export function getProfilePrimaryPhoto(profile: Pick<DiscoveryProfile, 'avatarUrl' | 'photos'>): string | null {
  return getPrimaryPhotoUri(profile.avatarUrl, profile.photos);
}
