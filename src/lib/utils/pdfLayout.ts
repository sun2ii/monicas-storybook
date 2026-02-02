export interface PhotoPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculatePDFLayout(
  template: 'full-bleed' | 'two-up' | 'grid',
  photoCount: number,
  pageWidth: number = 279,  // mm (landscape letter)
  pageHeight: number = 216   // mm (landscape letter)
): PhotoPosition[] {
  const margin = 10;
  const captionHeight = 20;
  const usableWidth = pageWidth - (margin * 2);
  const usableHeight = pageHeight - (margin * 2) - captionHeight;

  if (template === 'full-bleed') {
    return [{
      x: margin,
      y: margin,
      width: usableWidth,
      height: usableHeight
    }];
  }

  if (template === 'two-up') {
    const gap = 5;
    const photoWidth = (usableWidth - gap) / 2;
    return [
      { x: margin, y: margin, width: photoWidth, height: usableHeight },
      { x: margin + photoWidth + gap, y: margin, width: photoWidth, height: usableHeight }
    ];
  }

  // Grid layout (2x2 or 2x3)
  const cols = 2;
  const rows = Math.ceil(photoCount / cols);
  const gap = 5;
  const photoWidth = (usableWidth - gap) / cols;
  const photoHeight = (usableHeight - (gap * (rows - 1))) / rows;

  const positions: PhotoPosition[] = [];
  for (let i = 0; i < photoCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push({
      x: margin + (col * (photoWidth + gap)),
      y: margin + (row * (photoHeight + gap)),
      width: photoWidth,
      height: photoHeight
    });
  }

  return positions;
}
