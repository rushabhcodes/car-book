import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

interface MediaPickerConfig {
  mediaTypes: ImagePicker.MediaTypeOptions;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
}

/**
 * Request media library permissions
 * @returns boolean indicating if permission was granted
 */
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Request camera permissions
 * @returns boolean indicating if permission was granted
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Pick media from the device's library
 * @param config Options for the media picker
 * @returns Selected asset(s) or null if canceled
 */
export const pickMedia = async (
  config: MediaPickerConfig
): Promise<ImagePicker.ImagePickerAsset[] | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      ...config,
    });

    if (!result.canceled && result.assets) {
      return result.assets;
    }
    
    return null;
  } catch (error) {
    console.error('Error picking media:', error);
    return null;
  }
};

/**
 * Launch camera to take a photo
 * @param config Options for the camera
 * @returns Captured image asset or null if canceled
 */
export const takePhoto = async (
  config: Omit<MediaPickerConfig, 'mediaTypes'>
): Promise<ImagePicker.ImagePickerAsset | null> => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      ...config,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

/**
 * Compress an image to reduce file size
 * @param uri URI of the image to compress
 * @param quality Compression quality (0-1)
 * @returns URI of the compressed image
 */
export const compressImage = async (
  uri: string,
  quality: number = 0.7
): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original if compression fails
  }
};
