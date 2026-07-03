import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/common/Button';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { signUpSchema } from '@/lib/validation/schemas';
import { signUp } from '@/features/auth/authService';
import { saveProfile } from '@/features/profile/profileService';
import { useTheme } from '@/components/common/ThemeProvider';
import { spacing } from '@/constants/theme';
import { z } from 'zod';

type FormData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  const fieldError = (message?: string) => (message ? t(message) : undefined);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
      await saveProfile({ displayName: data.displayName });
      router.replace('/(tabs)');
    } catch {
      Alert.alert(t('common.error'), t('auth.signUpError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout title={t('auth.createAccountTitle')} subtitle={t('auth.signUpSubtitle')}>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, value } }) => (
          <AuthTextField
            value={value}
            onChangeText={onChange}
            placeholder={t('auth.displayName')}
            icon="person-outline"
            error={fieldError(errors.displayName?.message)}
          />
        )}
      />
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
      <Button title={t('auth.signUp')} onPress={handleSubmit(onSubmit)} disabled={loading} />
      <View style={styles.links}>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text style={[styles.link, { color: colors.primary }]}>{t('auth.haveAccount')}</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  links: { alignItems: 'center', marginTop: spacing.sm },
  link: { fontSize: 15, fontWeight: '600' },
});
