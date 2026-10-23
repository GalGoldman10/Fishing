/**
 * Conversation memory helpers for fishing chat follow-ups.
 */

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

const REFERENTIAL_PATTERNS = [
  /השתיים/i,
  /שתיהם/i,
  /ביניהם/i,
  /ביניהן/i,
  /מבין השתיים/i,
  /השניים/i,
  /איזה מביניהם/i,
  /איזה מהם/i,
  /the two/i,
  /both of them/i,
  /between them/i,
  /between the two/i,
  /which one/i,
  /which of them/i,
];

const LOCATION_PATTERNS = [
  { pattern: /palmachim|פלמחים/i, labelEn: 'Palmachim Beach', labelHe: 'חוף פלמחים', spotId: 'demo-9' },
  { pattern: /rishon|ראשון/i, labelEn: 'Rishon LeZion Beach', labelHe: 'חוף ראשון לציון', spotId: 'demo-11' },
  { pattern: /bat yam|בת ים/i, labelEn: 'Bat Yam Beach', labelHe: 'חוף בת ים', spotId: 'demo-10' },
  { pattern: /gordon|גורדון/i, labelEn: 'Gordon Beach Tel Aviv', labelHe: 'חוף גורדון', spotId: 'demo-1' },
  { pattern: /haifa|חיפה/i, labelEn: 'Haifa Beach', labelHe: 'חוף חיפה', spotId: 'demo-5' },
  { pattern: /ashdod|אשדוד/i, labelEn: 'Ashdod Beach', labelHe: 'חוף אשדוד', spotId: 'demo-7' },
  { pattern: /ashkelon|אשקלון/i, labelEn: 'Ashkelon Beach', labelHe: 'חוף אשקלון', spotId: 'demo-8' },
  { pattern: /herzliya|הרצליה/i, labelEn: 'Herzliya Beach', labelHe: 'חוף הרצליה', spotId: 'demo-3' },
];

const SPECIES_PATTERNS = [
  { pattern: /בורי|mullet/i, labelEn: 'mullet', labelHe: 'בורי' },
  { pattern: /דניס|seabass|bass/i, labelEn: 'sea bass', labelHe: 'דניס' },
  { pattern: /לוקוס|grouper/i, labelEn: 'grouper', labelHe: 'לוקוס' },
  { pattern: /ברקודה|barracuda/i, labelEn: 'barracuda', labelHe: 'ברקודה' },
];

export function normalizeChatTurns(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): ChatTurn | null => {
      if (typeof item === 'string' && item.trim()) {
        return { role: 'user', text: item.trim() };
      }
      if (item && typeof item === 'object' && typeof (item as ChatTurn).text === 'string') {
        const turn = item as ChatTurn;
        return {
          role: turn.role === 'assistant' ? 'assistant' : 'user',
          text: turn.text.trim(),
        };
      }
      return null;
    })
    .filter((turn): turn is ChatTurn => Boolean(turn?.text));
}

export function turnsToScopeContext(turns: ChatTurn[]): string[] {
  return turns.map((turn) => turn.text);
}

export function questionNeedsConversationContext(question: string): boolean {
  return REFERENTIAL_PATTERNS.some((pattern) => pattern.test(question));
}

export function extractLocationsFromConversation(turns: ChatTurn[]): Array<{
  labelEn: string;
  labelHe: string;
  spotId?: string;
}> {
  const text = turns.map((turn) => turn.text).join('\n');
  const found: Array<{ labelEn: string; labelHe: string; spotId?: string }> = [];

  for (const location of LOCATION_PATTERNS) {
    if (location.pattern.test(text)) {
      found.push({
        labelEn: location.labelEn,
        labelHe: location.labelHe,
        spotId: location.spotId,
      });
    }
  }

  return found.filter(
    (location, index, all) => all.findIndex((item) => item.labelEn === location.labelEn) === index,
  );
}

export function extractSpeciesFromQuestion(question: string): { labelEn: string; labelHe: string } | null {
  for (const species of SPECIES_PATTERNS) {
    if (species.pattern.test(question)) {
      return { labelEn: species.labelEn, labelHe: species.labelHe };
    }
  }
  return null;
}

export function formatConversationHistory(turns: ChatTurn[], language: 'en' | 'he'): string {
  const userLabel = language === 'he' ? 'משתמש' : 'User';
  const assistantLabel = language === 'he' ? 'עוזר' : 'Assistant';

  return turns
    .slice(-6)
    .map((turn) => `${turn.role === 'user' ? userLabel : assistantLabel}: ${turn.text}`)
    .join('\n');
}

export function enrichQuestionWithConversation(
  question: string,
  turns: ChatTurn[],
  language: 'en' | 'he',
): string {
  if (turns.length === 0) return question;

  const needsReferentialContext = questionNeedsConversationContext(question);
  const locations = extractLocationsFromConversation(turns);
  const species = extractSpeciesFromQuestion(question);
  const prior = formatConversationHistory(turns, language);

  if (!needsReferentialContext && locations.length === 0) {
    return question;
  }

  let enriched = question;

  if (locations.length > 0) {
    const labels = locations.map((location) => (language === 'he' ? location.labelHe : location.labelEn));
    enriched += language === 'he'
      ? `\n\n[הקשר שיחה: המשתמש מתייחס ל: ${labels.join(' מול ')}]`
      : `\n\n[Conversation context: user is referring to: ${labels.join(' vs ')}]`;
  }

  if (species) {
    enriched += language === 'he'
      ? `\n[מין דג: ${species.labelHe}]`
      : `\n[Target species: ${species.labelEn}]`;
  }

  enriched += language === 'he'
    ? `\n\n[שיחה קודמת]\n${prior}`
    : `\n\n[Prior conversation]\n${prior}`;

  return enriched;
}
