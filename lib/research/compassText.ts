/** Plain-text compass helper for non-UI contexts (no i18next dependency). */
export function degreesToCompassEn(degrees: number): string {
  const points = ['northerly', 'northeasterly', 'easterly', 'southeasterly', 'southerly', 'southwesterly', 'westerly', 'northwesterly'];
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return points[index];
}
