import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isMockMode } from '@/lib/config/env';
import { supabase } from '@/lib/api/supabase';
import { useAuthStore } from '@/stores/authStore';
import { isValidCoordinates } from '@/lib/utils/coordinates';

const REPORTS_KEY = 'fishguide_pin_reports';

export interface PinReport {
  id: string;
  spotId: string;
  currentLatitude: number;
  currentLongitude: number;
  suggestedLatitude: number;
  suggestedLongitude: number;
  explanation?: string;
  createdAt: string;
  userId?: string;
  status: 'pending' | 'approved' | 'rejected';
}

async function readLocalReports(): Promise<PinReport[]> {
  try {
    const raw =
      Platform.OS === 'web'
        ? typeof localStorage !== 'undefined'
          ? localStorage.getItem(REPORTS_KEY)
          : null
        : await SecureStore.getItemAsync(REPORTS_KEY);
    return raw ? (JSON.parse(raw) as PinReport[]) : [];
  } catch {
    return [];
  }
}

async function writeLocalReports(reports: PinReport[]): Promise<void> {
  const raw = JSON.stringify(reports);
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(REPORTS_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(REPORTS_KEY, raw);
}

/**
 * Submits a user report about an incorrect pin position.
 * Reports never change production coordinates directly — they go to admin review.
 */
export async function submitPinReport(input: {
  spotId: string;
  currentLatitude: number;
  currentLongitude: number;
  suggestedLatitude: number;
  suggestedLongitude: number;
  explanation?: string;
}): Promise<PinReport> {
  if (!isValidCoordinates(input.suggestedLatitude, input.suggestedLongitude)) {
    throw new Error('invalid-coordinates');
  }

  const report: PinReport = {
    id: `report-${Date.now()}`,
    ...input,
    createdAt: new Date().toISOString(),
    userId: useAuthStore.getState().user?.id,
    status: 'pending',
  };

  if (isMockMode()) {
    const reports = await readLocalReports();
    reports.push(report);
    await writeLocalReports(reports);
    return report;
  }

  const { error } = await supabase.from('location_reports').insert([
    {
      spot_id: report.spotId,
      current_latitude: report.currentLatitude,
      current_longitude: report.currentLongitude,
      suggested_latitude: report.suggestedLatitude,
      suggested_longitude: report.suggestedLongitude,
      explanation: report.explanation ?? null,
      user_id: report.userId ?? null,
      status: 'pending',
    },
  ] as never);
  if (error) throw error;
  return report;
}

export async function listPinReports(): Promise<PinReport[]> {
  if (isMockMode()) return readLocalReports();

  const { data, error } = await supabase
    .from('location_reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    spotId: row.spot_id as string,
    currentLatitude: row.current_latitude as number,
    currentLongitude: row.current_longitude as number,
    suggestedLatitude: row.suggested_latitude as number,
    suggestedLongitude: row.suggested_longitude as number,
    explanation: (row.explanation as string) ?? undefined,
    createdAt: row.created_at as string,
    userId: (row.user_id as string) ?? undefined,
    status: row.status as PinReport['status'],
  }));
}
