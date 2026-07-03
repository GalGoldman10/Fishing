import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/components/common/ThemeProvider';
import { Chip } from '@/components/common/SectionCard';
import { sendChatMessage } from '@/features/assistant/assistantService';
import { FishingAssistantResponse } from '@/lib/validation/schemas';
import { SourcePanel } from '@/components/fishing/SourcePanel';
import { translateConfidence } from '@/lib/localization/labels';
import { formatDateTime } from '@/lib/localization/format';
import type { FishingAnswer } from '@/types/research';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  structured?: FishingAssistantResponse;
  webSearchUsed?: boolean;
  research?: FishingAnswer;
}

export default function ChatScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const listRef = useRef<FlatList>(null);
  const { q } = useLocalSearchParams<{ q?: string }>();

  // Pre-fill a question passed from the homepage hero / AI suggestion chips.
  useEffect(() => {
    if (typeof q === 'string' && q.trim()) setInput(q);
  }, [q]);

  const suggestions = t('chat.suggestions', { returnObjects: true }) as string[];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: text,
        sessionId,
        language: i18n.language as 'en' | 'he',
      });

      if (response.sessionId) setSessionId(response.sessionId);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: response.answer,
          structured: response.structured,
          webSearchUsed: response.webSearchUsed,
          research: response.research,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', text: t('errors.aiMalformed') },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 && (
        <View style={styles.suggested}>
          <Text style={[styles.suggestedTitle, { color: colors.textMuted }]}>
            {t('chat.suggestedQuestions')}
          </Text>
          <Text style={[styles.webHint, { color: colors.textSecondary }]}>{t('research.hint')}</Text>
          {suggestions.map((q) => (
            <Pressable
              key={q}
              style={[styles.suggestedChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => void send(q)}
            >
              <Text style={{ color: colors.text }}>{q}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.accent} size="small" />
              <Text style={{ color: colors.textMuted }}>{t('research.searching')}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user'
                ? [styles.userBubble, { backgroundColor: colors.primary }]
                : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.borderLight }],
            ]}
          >
            {item.role === 'assistant' && item.webSearchUsed && (
              <View style={styles.webBadge}>
                <Chip label={t('chat.searchedWeb')} tone="web" />
              </View>
            )}
            <Text style={{ color: item.role === 'user' ? '#fff' : colors.text, ...typography.body }}>
              {item.text}
            </Text>
            {item.structured && (
              <AssistantExtras structured={item.structured} colors={colors} t={t} />
            )}
            {item.research && (
              <SourcePanel
                research={item.research}
                confidence={item.research.confidence}
              />
            )}
          </View>
        )}
      />

      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Pressable onPress={() => void send(input)} disabled={loading}>
          <Ionicons name="send" size={22} color={loading ? colors.textMuted : colors.accent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function AssistantExtras({
  structured,
  colors,
  t,
}: {
  structured: FishingAssistantResponse;
  colors: ReturnType<typeof useTheme>['colors'];
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <View style={styles.structured}>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {t('chat.confidence')}: {translateConfidence(structured.confidence, t as never)}
        {structured.freshnessMessage ? ` · ${structured.freshnessMessage}` : ''}
      </Text>

      {structured.sources.length > 0 && (
        <View style={styles.sources}>
          <Text style={[styles.sourcesTitle, { color: colors.textSecondary }]}>{t('chat.sources')}</Text>
          {structured.sources.slice(0, 4).map((s, i) => (
            <Pressable
              key={`${s.title}-${i}`}
              onPress={() => s.url && void Linking.openURL(s.url)}
              disabled={!s.url}
            >
              <Text style={[styles.sourceLink, { color: colors.web }]} numberOfLines={1}>
                {s.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {structured.hazards.map((h, i) => (
        <Text key={i} style={{ color: colors.warning, fontSize: 12 }}>
          ⚠ {h}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  suggested: { padding: spacing.lg, gap: spacing.sm },
  suggestedTitle: { ...typography.label },
  webHint: { ...typography.bodySmall, marginBottom: spacing.sm },
  suggestedChip: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  bubble: {
    maxWidth: '92%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: { alignSelf: 'flex-end' },
  assistantBubble: { alignSelf: 'flex-start', borderWidth: StyleSheet.hairlineWidth },
  webBadge: { marginBottom: spacing.sm },
  structured: { marginTop: spacing.md, gap: spacing.xs },
  meta: { ...typography.caption },
  sources: { marginTop: spacing.sm, gap: 4 },
  sourcesTitle: { ...typography.caption, fontWeight: '600' },
  sourceLink: { ...typography.caption, textDecorationLine: 'underline' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 100, padding: spacing.sm },
});
