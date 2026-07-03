import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { borderRadius, spacing } from '@/constants/theme';

interface AuthTextFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export function AuthTextField({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  icon = 'mail-outline',
  error,
}: AuthTextFieldProps) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.background,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.textMuted} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={8}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  icon: { marginEnd: spacing.sm },
  input: { flex: 1, fontSize: 16, paddingVertical: spacing.sm },
  error: { fontSize: 12, marginStart: spacing.xs },
});
