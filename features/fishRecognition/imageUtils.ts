/** Convert a local image URI from expo-image-picker to base64 (no data: prefix). */
export async function imageUriToBase64(uri: string): Promise<{ base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' }> {
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
