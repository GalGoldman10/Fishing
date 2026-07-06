/** Preview height that fits the full image (letterboxed), including tall portrait shots. */
export function getFishPreviewHeight(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
): number {
  if (!imageWidth || !imageHeight) return 320;
  const naturalHeight = containerWidth / (imageWidth / imageHeight);
  return Math.min(Math.max(naturalHeight, 200), 560);
}
