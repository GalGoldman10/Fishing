import { getFishPreviewHeight } from '@/features/fishRecognition/imagePreview';

describe('getFishPreviewHeight', () => {
  it('uses taller preview for portrait fish photos', () => {
    // Typical phone portrait photo (9:16-ish)
    const height = getFishPreviewHeight(1080, 2340, 360);
    expect(height).toBeGreaterThan(400);
    expect(height).toBeLessThanOrEqual(560);
  });

  it('uses shorter preview for landscape photos', () => {
    const height = getFishPreviewHeight(1920, 1080, 360);
    expect(height).toBeLessThan(250);
  });

  it('never returns below minimum readable height', () => {
    const height = getFishPreviewHeight(4000, 500, 360);
    expect(height).toBeGreaterThanOrEqual(200);
  });
});
