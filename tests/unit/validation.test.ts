import { fishingAssistantResponseSchema, signInSchema, buildEquipmentSetupInputSchema } from '@/lib/validation/schemas';
import { formatDistance } from '@/lib/utils/distance';

describe('fishingAssistantResponseSchema', () => {
  it('validates a complete response', () => {
    const result = fishingAssistantResponseSchema.safeParse({
      answer: 'Test answer',
      possibleSpecies: [{ name: 'Bass', likelihood: 'high' }],
      hazards: ['Slippery rocks'],
      regulations: ['License required'],
      followUpQuestions: ['What species?'],
      sources: [{ title: 'Demo' }],
      confidence: 'medium',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = fishingAssistantResponseSchema.safeParse({ answer: 'Test' });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('validates email and password', () => {
    const result = signInSchema.safeParse({ email: 'test@example.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({ email: 'bad', password: '123456' });
    expect(result.success).toBe(false);
  });
});

describe('buildEquipmentSetupInputSchema', () => {
  it('accepts optional fields', () => {
    const result = buildEquipmentSetupInputSchema.safeParse({
      spotId: 'abc',
      experienceLevel: 'beginner',
    });
    expect(result.success).toBe(true);
  });
});

describe('formatDistance', () => {
  it('formats meters for short distances', () => {
    expect(formatDistance(0.5, 'en')).toBe('500 m');
  });

  it('formats km for longer distances', () => {
    expect(formatDistance(2.5, 'en')).toBe('2.5 km');
  });

  it('formats Hebrew units', () => {
    expect(formatDistance(1.2, 'he')).toContain('ק"מ');
  });
});
