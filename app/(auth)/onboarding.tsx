import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { spacing, borderRadius } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  { key: '1', titleKey: 'onboarding.title1', descKey: 'onboarding.desc1', icon: '📍' },
  { key: '2', titleKey: 'onboarding.title2', descKey: 'onboarding.desc2', icon: '🤖' },
  { key: '3', titleKey: 'onboarding.title3', descKey: 'onboarding.desc3', icon: '🎣' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const setGuest = useAuthStore((s) => s.setGuest);
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <LinearGradient colors={[colors.primary, colors.background]} style={styles.container}>
      <FlatList
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.title, { color: '#fff' }]}>{t(item.titleKey)}</Text>
            <Text style={[styles.desc, { color: 'rgba(255,255,255,0.85)' }]}>{t(item.descKey)}</Text>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === index ? colors.accent : 'rgba(255,255,255,0.4)' }]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Button title={t('onboarding.continueGuest')} onPress={() => setGuest(true)} variant="outline" />
        <Button title={t('onboarding.signIn')} onPress={() => router.push('/(auth)/sign-in')} />
        <Button title={t('onboarding.createAccount')} onPress={() => router.push('/(auth)/sign-up')} variant="secondary" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  icon: { fontSize: 64, marginBottom: spacing.lg },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  desc: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: borderRadius.full },
  actions: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
});
