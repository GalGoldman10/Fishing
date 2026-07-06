import type { IdentificationDebugLog } from '@/lib/fishRecognition/types';

const DEBUG = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export function logIdentificationDebug(debug: IdentificationDebugLog | undefined): void {
  if (!DEBUG || !debug) return;
  console.log('[fish-identify:debug]', JSON.stringify(debug, null, 2));
}
