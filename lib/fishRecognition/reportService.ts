import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import type { FishIdentificationReport } from '@/lib/fishRecognition/types';

const REPORTS_KEY = 'fishguide_fish_identification_reports';
const MAX_REPORTS = 100;

async function readReports(): Promise<FishIdentificationReport[]> {
  try {
    const raw =
      Platform.OS === 'web'
        ? typeof localStorage !== 'undefined'
          ? localStorage.getItem(REPORTS_KEY)
          : null
        : await SecureStore.getItemAsync(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FishIdentificationReport[];
  } catch {
    return [];
  }
}

async function writeReports(reports: FishIdentificationReport[]): Promise<void> {
  const raw = JSON.stringify(reports.slice(0, MAX_REPORTS));
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(REPORTS_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(REPORTS_KEY, raw);
}

export async function saveWrongIdentificationReport(params: {
  imageUri: string;
  language: 'en' | 'he';
  aiResult: FishIdentificationReport['aiResult'];
  correctFishName?: string;
  notes?: string;
}): Promise<FishIdentificationReport> {
  const report: FishIdentificationReport = {
    id: uuidv4(),
    imageUri: params.imageUri,
    reportedAt: new Date().toISOString(),
    language: params.language,
    aiResult: params.aiResult,
    correctFishName: params.correctFishName?.trim() || undefined,
    notes: params.notes?.trim() || undefined,
  };
  const existing = await readReports();
  await writeReports([report, ...existing]);
  return report;
}

export async function getWrongIdentificationReports(): Promise<FishIdentificationReport[]> {
  return readReports();
}
