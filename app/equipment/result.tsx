import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { Card } from '@/components/common/Button';
import { DemoBadge } from '@/components/common/StateViews';
import { spacing } from '@/constants/theme';

export default function EquipmentResultScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const setup = {
    rod: t('equipmentSetup.demoRod'),
    reel: t('equipmentSetup.demoReel'),
    mainLine: t('equipmentSetup.demoMainLine'),
    leader: t('equipmentSetup.demoLeader'),
    hook: t('equipmentSetup.demoHook'),
    weight: t('equipmentSetup.demoWeight'),
    bait: t('equipmentSetup.demoBait'),
    safety: [
      t('equipmentSetup.demoSafety1'),
      t('equipmentSetup.demoSafety2'),
      t('equipmentSetup.demoSafety3'),
    ],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <DemoBadge />

      <Text style={[styles.title, { color: colors.text }]}>{t('equipment.essential')}</Text>
      <Card>
        <SetupRow label={t('equipmentSetup.rod')} value={setup.rod} colors={colors} />
        <SetupRow label={t('equipmentSetup.reel')} value={setup.reel} colors={colors} />
        <SetupRow label={t('equipmentSetup.mainLine')} value={setup.mainLine} colors={colors} />
        <SetupRow label={t('equipmentSetup.leader')} value={setup.leader} colors={colors} />
        <SetupRow label={t('equipmentSetup.hooks')} value={setup.hook} colors={colors} />
        <SetupRow label={t('equipmentSetup.weights')} value={setup.weight} colors={colors} />
        <SetupRow label={t('equipmentSetup.bait')} value={setup.bait} colors={colors} />
      </Card>

      <Text style={[styles.title, { color: colors.text }]}>{t('equipment.safety')}</Text>
      <Card>
        {setup.safety.map((item) => (
          <Text key={item} style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>
            • {item}
          </Text>
        ))}
      </Card>

      <Text style={[styles.note, { color: colors.textMuted }]}>{t('equipmentSetup.demoNote')}</Text>
    </ScrollView>
  );
}

function SetupRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { text: string; textMuted: string };
}) {
  return (
    <Text style={{ marginBottom: spacing.sm }}>
      <Text style={{ color: colors.textMuted, fontWeight: '600' }}>{label}: </Text>
      <Text style={{ color: colors.text }}>{value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '600', marginVertical: spacing.md },
  note: { fontSize: 12, marginTop: spacing.lg, fontStyle: 'italic' },
});
