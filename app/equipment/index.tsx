import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { translateEquipmentOption } from '@/lib/localization/labels';
import { spacing } from '@/constants/theme';

const STEPS = [
  'stepEnvironment',
  'stepLocation',
  'stepSpecies',
  'stepMethod',
  'stepExperience',
  'stepBudget',
  'stepOwned',
] as const;

const ENVIRONMENTS = ['shore', 'pier', 'harbor', 'rocks', 'boat'];
const METHODS = ['surf_casting', 'bottom_fishing', 'float_fishing', 'lure_fishing'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const BUDGETS = ['low', 'medium', 'high'];

export default function EquipmentScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const currentKey = STEPS[step];
  const options =
    currentKey === 'stepEnvironment'
      ? ENVIRONMENTS
      : currentKey === 'stepMethod'
        ? METHODS
        : currentKey === 'stepExperience'
          ? LEVELS
          : currentKey === 'stepBudget'
            ? BUDGETS
            : ['sandy', 'rocky', 'mixed', 'pier'];

  const select = (value: string) => {
    setSelections((prev) => ({ ...prev, [currentKey]: value }));
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.push({ pathname: '/equipment/result', params: selections });
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.progress, { color: colors.textMuted }]}>
        {t('equipment.stepProgress', { current: step + 1, total: STEPS.length })}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {t(`equipment.${currentKey}`)}
      </Text>

      <View style={styles.options}>
        {options.map((opt) => (
          <Button
            key={opt}
            title={translateEquipmentOption(opt, t)}
            variant={selections[currentKey] === opt ? 'primary' : 'outline'}
            onPress={() => select(opt)}
            style={styles.option}
          />
        ))}
      </View>

      {step === STEPS.length - 1 && selections[currentKey] && (
        <Button title={t('equipment.generate')} onPress={() => select(selections[currentKey]!)} />
      )}

      {step > 0 && (
        <Button title={t('common.back')} onPress={() => setStep(step - 1)} variant="ghost" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  progress: { fontSize: 14, marginBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.lg },
  options: { gap: spacing.sm, marginBottom: spacing.lg },
  option: { marginBottom: spacing.xs },
});
