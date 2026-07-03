import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { signInSchema } from '@/lib/validation/schemas';
import { signIn } from '@/features/auth/authService';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/components/common/ThemeProvider';
import { spacing } from '@/constants/theme';
import { z } from 'zod';

type FormData = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const setGuest = useAuthStore((s) => s.setGuest);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const fieldError = (message?: string) => (message ? t(message) : undefined);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert(t('common.error'), t('auth.signInError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title={t('auth.welcomeBack')} subtitle={t('auth.signInSubtitle')}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <AuthTextField
            value={value}
            onChangeText={onChange}
            placeholder={t('auth.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
            error={fieldError(errors.email?.message)}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <AuthTextField
            value={value}
            onChangeText={onChange}
            placeholder={t('auth.password')}
            secureTextEntry
            autoCapitalize="none"
            icon="lock-closed-outline"
            error={fieldError(errors.password?.message)}
          />
        )}
      />
      <Button title={t('auth.signIn')} onPress={handleSubmit(onSubmit)} disabled={loading} />
      <View style={styles.links}>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable>
            <Text style={[styles.link, { color: colors.primary }]}>{t('auth.noAccount')}</Text>
          </Pressable>
        </Link>
        <Pressable onPress={() => setGuest(true)}>
          <Text style={[styles.linkMuted, { color: colors.textMuted }]}>{t('onboarding.continueGuest')}</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  links: { alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  link: { fontSize: 15, fontWeight: '600' },
  linkMuted: { fontSize: 14 },
});
