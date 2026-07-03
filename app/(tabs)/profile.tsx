import { View, Text, StyleSheet, ScrollView, Alert, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { DirectionalIcon } from '@/components/common/DirectionalIcon';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useProfileStore } from '@/stores/profileStore';
import { useFavoritesStore } from '@/features/spots/favoritesService';
import { signOut, deleteAccount } from '@/features/auth/authService';
import { clearProfile } from '@/features/profile/profileService';
import { DEMO_SPOTS } from '@/lib/mock/demoData';
import { SupportedLanguage } from '@/lib/localization/i18n';
import { borderRadius, spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const profile = useProfileStore();
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);

  const { data: favoriteSpots } = useQuery({
    queryKey: ['profileFavorites', [...favoriteIds].join(',')],
    queryFn: () => DEMO_SPOTS.filter((s) => favoriteIds.has(s.id)),
    enabled: favoriteIds.size > 0,
  });

  const displayName =
    profile.displayName || user?.email?.split('@')[0] || t('profile.guest');
  const favoriteSpot = DEMO_SPOTS.find((s) => s.id === profile.favoriteSpotId);
  const favoriteName = favoriteSpot
    ? favoriteSpot.localizedNames?.[i18n.language] ?? favoriteSpot.name
    : null;

  const experienceLabel = t(`profile.${profile.experienceLevel}`);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/onboarding');
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('profile.deleteAccount'), t('profile.deleteWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteAccount();
          await clearProfile();
          router.replace('/(auth)/onboarding');
        },
      },
    ]);
  };

  const setupEntries = [
    { label: t('profile.setupRod'), value: profile.fishingSetup.rod },
    { label: t('profile.setupReel'), value: profile.fishingSetup.reel },
    { label: t('profile.setupLine'), value: profile.fishingSetup.mainLine },
    { label: t('profile.setupLeader'), value: profile.fishingSetup.leader },
    { label: t('profile.setupHooks'), value: profile.fishingSetup.hooks },
    { label: t('profile.setupBait'), value: profile.fishingSetup.bait },
  ].filter((e) => e.value.trim().length > 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Pressable style={styles.headerTop} onPress={() => router.push('/profile/edit')}>
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={36} color="#fff" />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
            <Text style={{ color: colors.textSecondary }}>
              {isGuest ? t('profile.guest') : user?.email}
            </Text>
            <Text style={[styles.experience, { color: colors.primary }]}>{experienceLabel}</Text>
          </View>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
        <Button
          title={t('profile.editProfile')}
          onPress={() => router.push('/profile/edit')}
          variant="outline"
          style={styles.editBtn}
        />
      </View>

      {favoriteName && (
        <Section title={t('profile.favoritePlace')} colors={colors}>
          <Pressable onPress={() => router.push(`/spot/${profile.favoriteSpotId}`)}>
            <Text style={[styles.linkText, { color: colors.primary }]}>{favoriteName}</Text>
          </Pressable>
        </Section>
      )}

      {setupEntries.length > 0 && (
        <Section title={t('profile.mySetup')} colors={colors}>
          {setupEntries.map((entry) => (
            <View key={entry.label} style={styles.setupRow}>
              <Text style={[styles.setupLabel, { color: colors.textMuted }]}>{entry.label}</Text>
              <Text style={{ color: colors.text, flex: 1 }}>{entry.value}</Text>
            </View>
          ))}
          {profile.fishingSetup.notes.trim() ? (
            <Text style={[styles.notes, { color: colors.textSecondary }]}>{profile.fishingSetup.notes}</Text>
          ) : null}
        </Section>
      )}

      {favoriteSpots && favoriteSpots.length > 0 && (
        <Section title={t('profile.favoriteSpots')} colors={colors}>
          {favoriteSpots.map((spot) => (
            <Pressable
              key={spot.id}
              style={[styles.favRow, { borderColor: colors.borderLight }]}
              onPress={() => router.push(`/spot/${spot.id}`)}
            >
              <Ionicons name="heart" size={16} color={colors.error} />
              <Text style={{ color: colors.text, flex: 1 }}>
                {spot.localizedNames?.[i18n.language] ?? spot.name}
              </Text>
              <DirectionalIcon name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Section>
      )}

      <SettingRow label={t('profile.language')} colors={colors}>
        <View style={styles.langRow} accessibilityRole="radiogroup" accessibilityLabel={t('profile.language')}>
          {(['en', 'he'] as SupportedLanguage[]).map((lang) => (
            <Button
              key={lang}
              title={lang === 'he' ? t('profile.langHe') : t('profile.langEn')}
              variant={language === lang ? 'primary' : 'outline'}
              onPress={() => void setLanguage(lang)}
              style={styles.langBtn}
              accessibilityLabel={lang === 'he' ? 'עברית' : 'English'}
              accessibilityState={{ selected: language === lang }}
            />
          ))}
        </View>
      </SettingRow>

      <SettingRow label={t('profile.notifications')} colors={colors}>
        <Text style={{ color: colors.textSecondary }}>{t('profile.optInRequired')}</Text>
      </SettingRow>

      <View style={styles.actions}>
        {!isGuest && user && (
          <>
            <Button title={t('profile.signOut')} onPress={handleSignOut} variant="outline" />
            <Button title={t('profile.deleteAccount')} onPress={handleDeleteAccount} variant="ghost" />
          </>
        )}
        {isGuest && (
          <Button title={t('onboarding.signIn')} onPress={() => router.push('/(auth)/sign-in')} />
        )}
        <Button title={t('admin.title')} onPress={() => router.push('/admin')} variant="secondary" />
      </View>

      <Text style={[styles.legal, { color: colors.textMuted }]}>{t('profile.legal')}</Text>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: { surface: string; text: string };
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function SettingRow({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: { surface: string; text: string };
}) {
  return (
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, marginBottom: spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  name: { fontSize: 22, fontWeight: '700' },
  experience: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  editBtn: { marginTop: spacing.md },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  setupRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  setupLabel: { width: 72, fontSize: 13 },
  notes: { marginTop: spacing.sm, fontStyle: 'italic', lineHeight: 20 },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linkText: { fontSize: 16, fontWeight: '600' },
  row: { padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: borderRadius.lg },
  rowLabel: { fontSize: 16, fontWeight: '500', marginBottom: spacing.sm },
  langRow: { flexDirection: 'row', gap: spacing.sm },
  langBtn: { flex: 1, paddingVertical: spacing.sm },
  actions: { padding: spacing.lg, gap: spacing.sm },
  legal: { textAlign: 'center', padding: spacing.lg, fontSize: 12 },
});
