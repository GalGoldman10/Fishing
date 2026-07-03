import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: t('admin.dashboard') }} />
      <Stack.Screen name="spots" options={{ title: t('admin.manageSpots') }} />
      <Stack.Screen name="reports" options={{ title: t('admin.reviewReports') }} />
    </Stack>
  );
}
