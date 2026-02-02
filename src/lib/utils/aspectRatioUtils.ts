import { Photo } from '@/lib/types/photo';

export type Orientation = 'portrait' | 'landscape' | 'square' | 'mixed';

export interface AspectRatioAnalysis {
  average: number;
  dominant: Orientation;
  gridLayout: {
    cols: string;
    aspectRatio: string;
  };
}

export function analyzeAspectRatios(photos: Photo[]): AspectRatioAnalysis {
  if (photos.length === 0) {
    return {
      average: 1,
      dominant: 'square',
      gridLayout: { cols: 'grid-cols-2', aspectRatio: '1/1' }
    };
  }

  // Calculate aspect ratios
  const ratios = photos.map(photo => {
    if (photo.width && photo.height) {
      return photo.width / photo.height;
    }
    return 1; // Default to square if dimensions missing
  });

  // Calculate average
  const average = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;

  // Determine dominant orientation
  let dominant: Orientation;
  const portraitCount = ratios.filter(r => r < 0.9).length;
  const landscapeCount = ratios.filter(r => r > 1.1).length;
  const squareCount = ratios.filter(r => r >= 0.9 && r <= 1.1).length;

  const totalPhotos = photos.length;
  const portraitRatio = portraitCount / totalPhotos;
  const landscapeRatio = landscapeCount / totalPhotos;

  if (portraitRatio > 0.6) {
    dominant = 'portrait';
  } else if (landscapeRatio > 0.6) {
    dominant = 'landscape';
  } else if (squareCount / totalPhotos > 0.6) {
    dominant = 'square';
  } else {
    dominant = 'mixed';
  }

  // Determine optimal grid layout
  let gridLayout: { cols: string; aspectRatio: string };

  if (dominant === 'portrait') {
    // Tall photos: use more columns, portrait aspect
    gridLayout = { cols: 'grid-cols-3', aspectRatio: '3/4' };
  } else if (dominant === 'landscape') {
    // Wide photos: use fewer columns, landscape aspect
    gridLayout = { cols: 'grid-cols-2', aspectRatio: '16/9' };
  } else if (average > 1.5) {
    // Very wide average: wide landscape
    gridLayout = { cols: 'grid-cols-2', aspectRatio: '16/9' };
  } else if (average < 0.75) {
    // Very tall average: tall portrait
    gridLayout = { cols: 'grid-cols-3', aspectRatio: '3/4' };
  } else {
    // Balanced/mixed: standard 4:3
    gridLayout = { cols: 'grid-cols-2', aspectRatio: '4/3' };
  }

  return {
    average,
    dominant,
    gridLayout
  };
}
