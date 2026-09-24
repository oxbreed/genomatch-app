import { Alert, Image } from 'react-native';
import {
  looksLikeImageUri,
  validatePhotoDimensions,
} from './photoModeration.logic';

export {
  looksLikeImageUri,
  validatePhotoDimensions,
  MIN_PHOTO_EDGE_PX,
  MAX_PHOTO_EDGE_PX,
} from './photoModeration.logic';

export function getPhotoDimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => reject(new Error('That file does not look like a usable photo. Try another image.'))
    );
  });
}

/** Client-side checks before a profile photo is uploaded. */
export async function assertPhotoAllowed(uri: string): Promise<void> {
  if (!looksLikeImageUri(uri)) {
    throw new Error('Choose a JPEG, PNG or HEIC photo.');
  }

  const { width, height } = await getPhotoDimensions(uri);
  validatePhotoDimensions(width, height);
}

export function confirmPhotoGuidelines(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Photo guidelines',
      'Upload only recent photos of yourself. No nudity, no other people without permission, and nothing that breaks the Community Guidelines. New photos are queued for a person to review.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Upload', onPress: () => resolve(true) },
      ]
    );
  });
}
