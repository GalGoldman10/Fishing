import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { spacing } from '@/constants/theme';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.warning, { color: colors.warning }]}>{t('admin.accessWarning')}</Text>
      <Button title={t('admin.manageSpots')} onPress={() => router.push('/admin/spots')} />
      <Button title={t('admin.reviewReports')} onPress={() => router.push('/admin/reports')} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md },
  warning: { fontSize: 14, marginBottom: spacing.md },
});
