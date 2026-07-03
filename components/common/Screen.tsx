import { ScrollView, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/components/common/ThemeProvider';
import { spacing } from '@/constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function Screen({ children, style, padded = true }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }, style]}
      contentContainerStyle={padded ? styles.padded : undefined}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  padded: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22 },
});
