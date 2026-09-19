import {
  enrichQuestionWithConversation,
  extractLocationsFromConversation,
  normalizeChatTurns,
  questionNeedsConversationContext,
} from '@/lib/research/conversationContext';

describe('conversationContext', () => {
  it('normalizes legacy string history entries', () => {
    expect(normalizeChatTurns(['שאלה קודמת'])).toEqual([
      { role: 'user', text: 'שאלה קודמת' },
    ]);
  });

  it('detects referential follow-ups like מבין השתיים', () => {
    expect(questionNeedsConversationContext('איזה חוף מבין השתיים מתאים לדייג של בורי?')).toBe(true);
  });

  it('extracts Palmachim and Rishon from prior turns', () => {
    const turns = normalizeChatTurns([
      { role: 'user', text: 'יש לי העדפה לפלמחים או חוף ראשון' },
      { role: 'assistant', text: 'פלמחים מתאימה לדיג סלעים וראשון לדיג חול.' },
    ]);

    const locations = extractLocationsFromConversation(turns);
    expect(locations.map((location) => location.labelHe)).toEqual(
      expect.arrayContaining(['חוף פלמחים', 'חוף ראשון לציון']),
    );
  });

  it('enriches mullet comparison follow-up with both beaches', () => {
    const turns = normalizeChatTurns([
      { role: 'user', text: 'יש לי העדפה לפלמחים או חוף ראשון' },
      { role: 'assistant', text: 'פלמחים מתאימה לדיג סלעים וראשון לדיג חול.' },
    ]);

    const enriched = enrichQuestionWithConversation(
      'איזה חוף מבין השתיים מתאים לדייג של בורי?',
      turns,
      'he',
    );

    expect(enriched).toContain('חוף פלמחים');
    expect(enriched).toContain('חוף ראשון לציון');
    expect(enriched).toContain('בורי');
    expect(enriched).toContain('משתמש:');
  });
});
