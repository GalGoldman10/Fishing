import { useState } from 'react';
import { ScrollView, Text, StyleSheet, Switch, Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Button';
import { DEMO_SPOTS } from '@/lib/mock/demoData';
import { saveTripPlan } from '@/features/trips/tripService';
import { spacing } from '@/constants/theme';

export default function TripPlannerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState(false);
  const spot = DEMO_SPOTS[0];

  const equipmentItems = [
    t('tripDemo.equipment1'),
    t('tripDemo.equipment2'),
    t('tripDemo.equipment3'),
    t('tripDemo.equipment4'),
    t('tripDemo.equipment5'),
  ];

  const safetyItems = [
    t('tripDemo.safety1'),
    t('tripDemo.safety2'),
    t('tripDemo.safety3'),
    t('tripDemo.safety4'),
  ];

  const handleSave = async () => {
    try {
      await saveTripPlan({
        spotId: spot.id,
        plannedStart: new Date(Date.now() + 86400000).toISOString(),
        notificationEnabled: notifications,
        selectedMethod: 'surf_casting',
      });
      Alert.alert(t('common.done'), t('tripDemo.saved'));
    } catch {
      Alert.alert(t('common.error'), t('errors.databaseError'));
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('trip.selectLocation')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{spot.name}</Text>
      </Card>

      <Card>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('trip.selectDate')}</Text>
        <Text style={{ color: colors.text }}>{t('tripDemo.dateValue')}</Text>
      </Card>

      <Card>
        <Text style={[styles.label, { color: colors.text }]}>{t('trip.equipmentChecklist')}</Text>
        {equipmentItems.map((item) => (
          <Text key={item} style={{ color: colors.textSecondary }}>☐ {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={[styles.label, { color: colors.text }]}>{t('trip.safetyChecklist')}</Text>
        {safetyItems.map((item) => (
          <Text key={item} style={{ color: colors.textSecondary }}>☐ {item}</Text>
        ))}
      </Card>

      <View style={styles.switchRow}>
        <Text style={{ color: colors.text }}>{t('trip.notifications')}</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      <Text style={{ color: colors.warning, padding: spacing.md, fontSize: 12 }}>
        {t('spot.regulationDisclaimer')}
      </Text>

      <Button title={t('trip.saveTrip')} onPress={() => void handleSave()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.sm },
  label: { fontSize: 14, marginBottom: spacing.xs },
  value: { fontSize: 18, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
});
