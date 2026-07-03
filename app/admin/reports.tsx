import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { spacing } from '@/constants/theme';

export default function AdminReportsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Text style={[styles.text, { color: colors.textSecondary }]}>
      {t('admin.reportsPlaceholder')}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { padding: spacing.lg },
});
