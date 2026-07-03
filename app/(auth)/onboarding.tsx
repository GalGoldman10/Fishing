import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import type { SupportedLanguage } from '@/lib/localization/i18n';

const FEATURES = [
  {
    key: 'spots',
    icon: 'map-outline' as const,
    titleKey: 'onboarding.title1',
    descKey: 'onboarding.desc1',
  },
  {
    key: 'conditions',
    icon: 'water-outline' as const,
    titleKey: 'onboarding.titleConditions',
    descKey: 'onboarding.descConditions',
  },
  {
    key: 'assistant',
    icon: 'chatbubble-ellipses-outline' as const,
    titleKey: 'onboarding.title2',
    descKey: 'onboarding.desc2',
  },
  {
    key: 'equipment',
    icon: 'construct-outline' as const,
    titleKey: 'onboarding.title3',
    descKey: 'onboarding.desc3',
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 700;
  const setGuest = useAuthStore((s) => s.setGuest);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <LinearGradient
      colors={['#062A42', '#0A4D68', '#0891B2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar: brand + language toggle */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Ionicons name="fish" size={16} color="#7DD3FC" />
            <Text style={styles.brandText}>{t('app.name')}</Text>
          </View>
          <View style={styles.langToggle}>
            {(['en', 'he'] as SupportedLanguage[]).map((lang) => (
              <Pressable
                key={lang}
                onPress={() => void setLanguage(lang)}
                accessibilityLabel={lang === 'he' ? 'עברית' : 'English'}
                accessibilityState={{ selected: language === lang }}
                style={[styles.langBtn, language === lang && styles.langBtnActive]}
              >
                <Text style={[styles.langText, language === lang && styles.langTextActive]}>
                  {lang === 'he' ? 'עב' : 'EN'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('home.heroDescription')}</Text>
        </View>

        {/* Feature cards */}
        <View style={[styles.features, isWide && styles.featuresWide]}>
          {FEATURES.map((feature) => (
            <View key={feature.key} style={[styles.card, isWide && styles.cardWide]}>
              <View style={styles.cardIcon}>
                <Ionicons name={feature.icon} size={20} color="#7DD3FC" />
              </View>
              <View style={styles.cardTexts}>
                <Text style={styles.cardTitle}>{t(feature.titleKey)}</Text>
                <Text style={styles.cardDesc}>{t(feature.descKey)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => setGuest(true)}
            accessibilityLabel={t('onboarding.continueGuest')}
            style={styles.primaryCta}
          >
            <Ionicons name="arrow-forward" size={18} color="#062A42" />
            <Text style={styles.primaryCtaText}>{t('onboarding.continueGuest')}</Text>
          </Pressable>

          <View style={styles.secondaryRow}>
            <Pressable
              onPress={() => router.push('/(auth)/sign-in')}
              accessibilityLabel={t('onboarding.signIn')}
              style={styles.secondaryCta}
            >
              <Text style={styles.secondaryCtaText}>{t('onboarding.signIn')}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
              accessibilityLabel={t('onboarding.createAccount')}
              style={styles.secondaryCta}
            >
              <Text style={styles.secondaryCtaText}>{t('onboarding.createAccount')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  contentWide: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  brandText: { color: '#E0F2FE', fontSize: 13, fontWeight: '700' },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: borderRadius.full,
    padding: 3,
    gap: 2,
  },
  langBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  langBtnActive: { backgroundColor: '#7DD3FC' },
  langText: { color: '#CBD5E1', fontSize: 12, fontWeight: '700' },
  langTextActive: { color: '#062A42' },
  hero: { gap: spacing.sm, marginTop: spacing.md },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSubtitle: { color: '#CBD5E1', fontSize: 16, lineHeight: 24 },
  features: { gap: spacing.sm },
  featuresWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  cardWide: { flexBasis: '48%', flexGrow: 1 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(125,211,252,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTexts: { flex: 1, gap: 2 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardDesc: { color: '#CBD5E1', fontSize: 13, lineHeight: 18 },
  actions: { gap: spacing.sm, marginTop: 'auto', paddingBottom: spacing.lg },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#7DD3FC',
    borderRadius: borderRadius.full,
    height: 52,
  },
  primaryCtaText: { color: '#062A42', fontSize: 16, fontWeight: '800' },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
  secondaryCta: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  secondaryCtaText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
