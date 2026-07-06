import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing } from '@/constants/theme';

interface Props {
  message?: string;
}

export function FishRecognitionLoading({ message }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })),
      -1,
      true,
    );
  }, [opacity, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.primary + '18' },
          iconStyle,
        ]}
      >
        <Ionicons name="fish" size={48} color={colors.accent} />
      </Animated.View>
      <Text style={[styles.title, { color: colors.text }]}>
        {message ?? t('identify.analyzing')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('identify.analyzingHint')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    minHeight: 220,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
});
