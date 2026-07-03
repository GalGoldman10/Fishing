import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing } from '@/constants/theme';

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthScreenLayout({ title, subtitle, children, footer }: AuthScreenLayoutProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[colors.primary, colors.background]}
      style={[styles.gradient, { paddingTop: insets.top + spacing.md }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.lg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.logo}>🎣</Text>
            <Text style={styles.brand}>{t('app.name')}</Text>
            <Text style={styles.tagline}>{t('app.tagline')}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            {children}
          </View>

          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg },
  brandBlock: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.lg },
  logo: { fontSize: 48, marginBottom: spacing.sm },
  brand: { fontSize: 28, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs, textAlign: 'center' },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: spacing.sm },
});
