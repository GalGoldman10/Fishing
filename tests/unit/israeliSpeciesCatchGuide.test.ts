import {
  matchSpeciesCatchProfile,
  buildSpeciesCatchAnswer,
  buildSpeciesListOverviewAnswer,
  tryBuildSpeciesCatchAnswer,
  ISRAELI_SPECIES_CATCH_GUIDE,
} from '@/lib/research/israeliSpeciesCatchGuide';

describe('israeliSpeciesCatchGuide', () => {
  it('contains all 12 infographic species', () => {
    expect(ISRAELI_SPECIES_CATCH_GUIDE).toHaveLength(12);
  });

  it('matches Hebrew species names', () => {
    expect(matchSpeciesCatchProfile('מה המינימום לברקודה')?.id).toBe('barracuda');
    expect(matchSpeciesCatchProfile('כמה סרגוס מותר בסשן')?.id).toBe('white-seabream');
    expect(matchSpeciesCatchProfile('dorado size limit')?.id).toBe('dorado');
  });

  it('builds barracuda catch answer with legal and recommended sizes', () => {
    const profile = matchSpeciesCatchProfile('ברקודה')!;
    const answer = buildSpeciesCatchAnswer(profile, 'he');
    expect(answer).toMatch(/20/);
    expect(answer).toMatch(/50/);
    expect(answer).toMatch(/4/);
  });

  it('warns that grouper is protected under Israeli law', () => {
    const profile = matchSpeciesCatchProfile('לוקוס')!;
    const answer = buildSpeciesCatchAnswer(profile, 'he');
    expect(answer).toMatch(/מוגן|שחרר/i);
    expect(answer).toMatch(/parks\.org\.il/);
  });

  it('builds species list overview for סוגי דגים', () => {
    const answer = buildSpeciesListOverviewAnswer('he');
    expect(answer).toMatch(/12/);
    expect(answer).toMatch(/לוקוס/);
    expect(answer).toMatch(/טלוויזיה/);
    expect(answer).toMatch(/tahvivim\.com/);
  });

  it('returns catch answer for size-limit questions', () => {
    const result = tryBuildSpeciesCatchAnswer('מה הגודל המומלץ לגומבר?', 'he');
    expect(result?.usedLocalDb).toBe(true);
    expect(result?.directAnswer).toMatch(/45/);
    expect(result?.directAnswer).toMatch(/3/);
  });

  it('returns overview for species list questions', () => {
    const result = tryBuildSpeciesCatchAnswer('סוגי דגים בישראל', 'he');
    expect(result?.directAnswer).toMatch(/12/);
  });

  it('does not answer location-only species questions', () => {
    const result = tryBuildSpeciesCatchAnswer('איפה לתפוס בורי?', 'he');
    expect(result).toBeNull();
  });
});
