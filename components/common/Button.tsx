import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  accessibilityLabel,
  accessibilityState,
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: colors.primary },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      container: { backgroundColor: colors.accent },
      text: { color: colors.text },
    },
    outline: {
      container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
      text: { color: colors.primary },
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: { color: colors.primary },
    },
  };

  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      style={({ pressed }) => [
        styles.button,
        v.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, v.text]}>{title}</Text>
    </Pressable>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  const { colors } = useTheme();
  const content = (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
  return content;
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});
