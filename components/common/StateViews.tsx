import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { translateVerificationStatus } from '@/lib/localization/labels';
import { borderRadius, spacing } from '@/constants/theme';

interface Props {
  message?: string;
}

export function LoadingState({ message }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      {message ? (
        <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );
}

interface EmptyProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {icon}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.text, { color: colors.textSecondary }]}>{description}</Text>
      ) : null}
    </View>
  );
}

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.errorBox, { backgroundColor: colors.surface, borderColor: colors.error }]}>
      <Text style={[styles.title, { color: colors.error }]}>{message}</Text>
      {onRetry ? (
        <Text style={[styles.retry, { color: colors.primary }]} onPress={onRetry}>
          {t('common.retry')}
        </Text>
      ) : null}
    </View>
  );
}

export function DemoBadge() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.badge, { backgroundColor: colors.demo }]}>
      <Text style={styles.badgeText}>{t('common.demo')}</Text>
    </View>
  );
}

export function VerificationBadge({
  status,
}: {
  status: 'verified' | 'estimated' | 'community' | 'unknown' | 'demo' | 'stale';
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const colorMap = {
    verified: colors.verified,
    estimated: colors.estimated,
    community: colors.info,
    unknown: colors.unknown,
    demo: colors.demo,
    stale: colors.warning,
  };
  return (
    <View style={[styles.badge, { backgroundColor: colorMap[status] }]}>
      <Text style={styles.badgeText}>{translateVerificationStatus(status, t)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  text: { fontSize: 14, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  errorBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    margin: spacing.md,
  },
  retry: { marginTop: spacing.sm, fontWeight: '600', textAlign: 'center' },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
