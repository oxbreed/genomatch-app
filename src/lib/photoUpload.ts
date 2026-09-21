import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { uploadImageToCloudinary } from './cloudinary';
import { assertPhotoAllowed, confirmPhotoGuidelines } from './photoModeration';

export async function pickProfilePhotoUri(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission needed', 'Allow photo library access to upload a profile picture.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;
  const uri = result.assets[0].uri;
  try {
    await assertPhotoAllowed(uri);
  } catch (err) {
    Alert.alert(
      'Photo not accepted',
      err instanceof Error ? err.message : 'Try another image.'
    );
    return null;
  }
  const accepted = await confirmPhotoGuidelines();
  return accepted ? uri : null;
}

export async function pickAndUploadProfilePhoto(): Promise<string | null> {
  const uri = await pickProfilePhotoUri();
  if (!uri) return null;
  return uploadImageToCloudinary(uri);
}

/** Pick and upload a gallery photo without updating avatar_url. */
export async function uploadAdditionalPhoto(): Promise<string | null> {
  const uri = await pickProfilePhotoUri();
  if (!uri) return null;
  return uploadImageToCloudinary(uri);
}
