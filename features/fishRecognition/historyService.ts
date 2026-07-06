import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import type { FishRecognitionHistoryEntry } from '@/features/fishRecognition/types';
import type { FishRecognitionResponse } from '@/lib/validation/schemas';

const HISTORY_KEY = 'fishguide_fish_recognition_history';
const MAX_ENTRIES = 50;

async function readHistory(): Promise<FishRecognitionHistoryEntry[]> {
  try {
    const raw =
      Platform.OS === 'web'
        ? typeof localStorage !== 'undefined'
          ? localStorage.getItem(HISTORY_KEY)
          : null
        : await SecureStore.getItemAsync(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FishRecognitionHistoryEntry[];
  } catch {
    return [];
  }
}

async function writeHistory(entries: FishRecognitionHistoryEntry[]): Promise<void> {
  const raw = JSON.stringify(entries.slice(0, MAX_ENTRIES));
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(HISTORY_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(HISTORY_KEY, raw);
}

export async function getRecognitionHistory(): Promise<FishRecognitionHistoryEntry[]> {
  const entries = await readHistory();
  return entries.sort(
    (a, b) => new Date(b.identifiedAt).getTime() - new Date(a.identifiedAt).getTime(),
  );
}

export async function getRecognitionById(id: string): Promise<FishRecognitionHistoryEntry | null> {
  const entries = await readHistory();
  return entries.find((e) => e.id === id) ?? null;
}

export async function saveRecognitionHistory(params: {
  imageUri: string;
  language: 'en' | 'he';
  result: FishRecognitionResponse;
}): Promise<FishRecognitionHistoryEntry> {
  const entry: FishRecognitionHistoryEntry = {
    id: uuidv4(),
    imageUri: params.imageUri,
    identifiedAt: new Date().toISOString(),
    language: params.language,
    result: params.result,
  };
  const existing = await readHistory();
  await writeHistory([entry, ...existing]);
  return entry;
}

export async function deleteRecognitionHistory(id: string): Promise<void> {
  const existing = await readHistory();
  await writeHistory(existing.filter((e) => e.id !== id));
}
