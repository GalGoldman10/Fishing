import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { logCatch } from '@/features/catches/catchService';
import { spacing, borderRadius } from '@/constants/theme';

export default function NewCatchScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [speciesName, setSpeciesName] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [released, setReleased] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    try {
      await logCatch({
        caughtAt: new Date().toISOString(),
        speciesName,
        estimatedLength: length ? parseFloat(length) : undefined,
        estimatedWeight: weight ? parseFloat(weight) : undefined,
        released,
        notes,
      });
      router.back();
    } catch {
      Alert.alert(t('common.error'), t('errors.databaseError'));
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder={t('catch.species')}
        placeholderTextColor={colors.textMuted}
        value={speciesName}
        onChangeText={setSpeciesName}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder={t('catch.length')}
        placeholderTextColor={colors.textMuted}
        value={length}
        onChangeText={setLength}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder={t('catch.weight')}
        placeholderTextColor={colors.textMuted}
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, styles.notes, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder={t('catch.notes')}
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <View style={styles.switchRow}>
        <Text style={{ color: colors.text }}>{t('catch.released')}</Text>
        <Switch value={released} onValueChange={setReleased} />
      </View>
      <Button title={t('common.save')} onPress={() => void handleSave()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  input: { borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, fontSize: 16 },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
});
