import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/common/ThemeProvider';
import { Chip } from '@/components/common/SectionCard';
import { formatDateTime } from '@/lib/localization/format';
import { isRTL } from '@/lib/localization/i18n';
import type { FishingAnswer, FishingSource } from '@/types/research';
import { borderRadius, spacing, typography } from '@/constants/theme';

interface SourcePanelProps {
  research?: FishingAnswer;
  sourceCount?: number;
  confidence?: string;
}

export function SourcePanel({ research, sourceCount, confidence }: SourcePanelProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const sources = research?.sources ?? [];
  const count = sourceCount ?? sources.length;
  const conf = confidence ?? research?.confidence ?? 'limited';

  if (count === 0 && !research) return null;

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerLeft}>
          <Ionicons name="library-outline" size={16} color={colors.web} />
          <Text style={[styles.headerText, { color: colors.text }]}>
            {t('research.sourcesCount', { count })}
          </Text>
          <Chip
            label={t(`research.confidence.${conf}`)}
            tone={conf === 'high' ? 'primary' : conf === 'medium' ? 'web' : 'demo'}
          />
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {research?.confidenceReason && (
        <Text style={[styles.reason, { color: colors.textSecondary }]}>
          {research.confidenceReason}
        </Text>
      )}

      {expanded && (
        <View style={styles.body}>
          {research?.searchQueriesUsed && research.searchQueriesUsed.length > 1 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                {t('research.queriesUsed')}
              </Text>
              {research.searchQueriesUsed.slice(0, 5).map((q) => (
                <Text key={q} style={[styles.query, { color: colors.textSecondary }]} numberOfLines={1}>
                  • {q}
                </Text>
              ))}
            </View>
          )}

          {sources.map((source) => (
            <SourceRow key={source.id} source={source} colors={colors} t={t} />
          ))}

          {research?.conflicts && research.conflicts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                {t('research.conflicts')}
              </Text>
              {research.conflicts.map((c) => (
                <Text key={c.topic} style={[styles.conflict, { color: colors.textSecondary }]}>
                  {c.topic}: {c.resolution}
                </Text>
              ))}
            </View>
          )}

          {research?.lastVerifiedAt && (
            <Text
              style={[
                styles.checked,
                { color: colors.textMuted, textAlign: isRTL(i18n.language) ? 'left' : 'right' },
              ]}
            >
              {t('research.lastChecked', {
                time: formatDateTime(research.lastVerifiedAt, i18n.language),
              })}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function SourceRow({
  source,
  colors,
  t,
}: {
  source: FishingSource;
  colors: ReturnType<typeof useTheme>['colors'];
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <Pressable
      style={[styles.sourceRow, { borderColor: colors.borderLight }]}
      onPress={() => source.url && void Linking.openURL(source.url)}
      disabled={!source.url}
    >
      <View style={styles.sourceTop}>
        <Text style={[styles.sourceTitle, { color: colors.web }]} numberOfLines={2}>
          {source.title}
        </Text>
        <Text style={[styles.score, { color: colors.textMuted }]}>
          {Math.round(source.reliabilityScore)}
        </Text>
      </View>
      <Text style={[styles.sourceMeta, { color: colors.textMuted }]}>
        {source.domain} · {t(`research.sourceType.${source.sourceType}`)}
        {source.isPrimarySource ? ` · ${t('research.official')}` : ''}
      </Text>
      {source.snippet ? (
        <Text style={[styles.snippet, { color: colors.textSecondary }]} numberOfLines={2}>
          {source.snippet}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  headerText: { ...typography.caption, fontWeight: '600' },
  reason: { ...typography.caption, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  body: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, gap: spacing.xs },
  section: { marginTop: spacing.sm },
  sectionTitle: { ...typography.caption, fontWeight: '600', marginBottom: 4 },
  query: { ...typography.caption, fontSize: 11 },
  sourceRow: {
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  sourceTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  sourceTitle: { ...typography.caption, flex: 1, textDecorationLine: 'underline' },
  score: { ...typography.caption, fontWeight: '700' },
  sourceMeta: { ...typography.caption, fontSize: 10 },
  snippet: { ...typography.caption, fontSize: 11, marginTop: 2 },
  conflict: { ...typography.caption, fontSize: 11, marginBottom: 4 },
  checked: { ...typography.caption, fontSize: 10, marginTop: spacing.sm },
});
