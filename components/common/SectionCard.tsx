import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, shadows, spacing, typography } from '@/constants/theme';

export function SectionCard({
  title,
  subtitle,
  children,
  style,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        shadows.soft,
        { backgroundColor: colors.surface, borderColor: colors.borderLight },
        style,
      ]}
    >
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Chip({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'web' | 'demo';
}) {
  const { colors } = useTheme();
  const toneMap = {
    default: { bg: colors.surfaceSecondary, text: colors.textSecondary },
    primary: { bg: colors.primarySoft, text: colors.primary },
    success: { bg: '#DCFCE7', text: colors.success },
    warning: { bg: '#FEF3C7', text: colors.warning },
    web: { bg: '#DBEAFE', text: colors.web },
    demo: { bg: '#EDE9FE', text: colors.demo },
  };
  const t = toneMap[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      <Text style={[styles.chipText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: { marginBottom: spacing.md, gap: 4 },
  title: { ...typography.h3 },
  subtitle: { ...typography.caption },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  chipText: { ...typography.caption, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  rowLabel: { ...typography.bodySmall, flex: 1 },
  rowValue: { ...typography.bodySmall, fontWeight: '600', textAlign: 'right', flex: 1 },
});
