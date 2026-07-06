import * as ImageManipulator from 'expo-image-manipulator';

export { getFishPreviewHeight } from '@/features/fishRecognition/imagePreview';

/** Longest edge sent to the vision API — full frame kept, never cropped. */
export const RECOGNITION_MAX_EDGE = 1920;

export interface PreparedImage {
  uri: string;
  width: number;
  height: number;
}

/**
 * Normalize an uploaded photo for fish ID: preserve aspect ratio, never crop.
 * Downscales very large images so upload stays fast and within API limits.
 */
export async function prepareImageForRecognition(
  uri: string,
  width?: number,
  height?: number,
): Promise<PreparedImage> {
  const w = width ?? 0;
  const h = height ?? 0;
  const longest = Math.max(w, h);

  if (longest > 0 && longest <= RECOGNITION_MAX_EDGE) {
    return { uri, width: w, height: h };
  }

  const resize =
    longest === 0 || w >= h
      ? { width: RECOGNITION_MAX_EDGE }
      : { height: RECOGNITION_MAX_EDGE };

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize }],
    { compress: 0.88, format: ImageManipulator.SaveFormat.JPEG },
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}

/** Convert a local image URI to base64 (no data: prefix). */
export async function imageUriToBase64(
  uri: string,
): Promise<{ base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' }> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const mimeType = (blob.type === 'image/png' || blob.type === 'image/webp'
    ? blob.type
    : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const base64 = dataUrl.split(',')[1];
  if (!base64) throw new Error('Failed to encode image');
  return { base64, mimeType };
}
