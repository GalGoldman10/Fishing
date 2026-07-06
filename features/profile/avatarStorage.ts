import { supabase } from '@/lib/api/supabase';
import { isSupabaseAuthEnabled } from '@/lib/config/env';

function isRemoteUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function guessContentType(uri: string): string {
  if (uri.toLowerCase().includes('.png')) return 'image/png';
  return 'image/jpeg';
}

function guessExtension(contentType: string): string {
  return contentType === 'image/png' ? 'png' : 'jpg';
}

/** Upload a local device URI to Supabase Storage; returns a public HTTPS URL. */
export async function uploadProfileAvatar(userId: string, localUri: string): Promise<string> {
  if (!isSupabaseAuthEnabled()) return localUri;
  if (isRemoteUri(localUri)) return localUri;

  const contentType = guessContentType(localUri);
  const extension = guessExtension(contentType);
  const path = `${userId}/avatar.${extension}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    upsert: true,
    contentType: blob.type || contentType,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}
