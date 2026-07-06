import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/lib/localization/i18n';
import { AppProviders } from '@/components/common/AppProviders';
import { DirectionProvider } from '@/components/common/DirectionProvider';
import { useTheme } from '@/components/common/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { restoreSession, setupAuthStateListener } from '@/features/auth/authService';
import { hydrateProfile } from '@/features/profile/profileService';
import { useFavoritesStore } from '@/features/spots/favoritesService';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

function LocalizedStack() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="spot/[id]" options={{ title: t('screens.spotDetails') }} />
      <Stack.Screen name="chat/index" options={{ title: t('chat.title') }} />
      <Stack.Screen name="equipment/index" options={{ title: t('equipment.title') }} />
      <Stack.Screen name="equipment/result" options={{ title: t('screens.yourSetup') }} />
      <Stack.Screen name="trip/index" options={{ title: t('trip.title') }} />
      <Stack.Screen name="catch/index" options={{ title: t('catch.title') }} />
      <Stack.Screen name="catch/new" options={{ title: t('catch.newCatch') }} />
      <Stack.Screen name="species/[id]" options={{ title: t('screens.speciesDetails') }} />
      <Stack.Screen name="profile/edit" options={{ title: t('profile.editProfile') }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootNavigator() {
  const { isDark } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { isLoading, session, isGuest } = useAuthStore();
  const hydrateLanguage = useLanguageStore((s) => s.hydrate);
  const languageHydrated = useLanguageStore((s) => s.hydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      await hydrateLanguage();
      await restoreSession();
      await hydrateProfile();
      await useFavoritesStore.getState().loadFavorites();
      setReady(true);
      await SplashScreen.hideAsync();
    })();
  }, [hydrateLanguage]);

  useEffect(() => {
    const unsubscribe = setupAuthStateListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!ready || isLoading || !languageHydrated) return;
    const inAuth = segments[0] === '(auth)';
    const isOnboarded = session || isGuest;

    if (!isOnboarded && !inAuth) {
      router.replace('/(auth)/onboarding');
    } else if (isOnboarded && inAuth) {
      router.replace('/(tabs)');
    }
  }, [ready, isLoading, languageHydrated, session, isGuest, segments, router]);

  if (!ready || !languageHydrated) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LocalizedStack />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <DirectionProvider>
        <RootNavigator />
      </DirectionProvider>
    </AppProviders>
  );
}
