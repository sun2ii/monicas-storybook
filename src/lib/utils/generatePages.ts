import { Photo } from '../types/photo';
import { PageLayout } from '@/components/scrapbook/ScrapbookPage';

/**
 * Generate scrapbook pages from photos using a simple layout algorithm
 *
 * Algorithm:
 * - 1 photo: Full-bleed layout
 * - 2 photos: Two-up layout (side-by-side)
 * - 3-4 photos: Grid layout
 * - Continue until all photos are placed
 */
export function generatePages(photos: Photo[]): PageLayout[] {
  const pages: PageLayout[] = [];
  let i = 0;

  while (i < photos.length) {
    const remaining = photos.length - i;

    if (remaining === 1) {
      // Last photo gets full-bleed treatment
      pages.push({
        id: `page-${pages.length + 1}`,
        template: 'full-bleed',
        photos: [photos[i]],
        caption: '',
      });
      i += 1;
    } else if (remaining === 2) {
      // Two photos get two-up layout
      pages.push({
        id: `page-${pages.length + 1}`,
        template: 'two-up',
        photos: photos.slice(i, i + 2),
        caption: '',
      });
      i += 2;
    } else if (remaining === 3) {
      // Three photos get grid layout
      pages.push({
        id: `page-${pages.length + 1}`,
        template: 'grid',
        photos: photos.slice(i, i + 3),
        caption: '',
      });
      i += 3;
    } else {
      // 4+ photos: take 4 for grid layout
      pages.push({
        id: `page-${pages.length + 1}`,
        template: 'grid',
        photos: photos.slice(i, i + 4),
        caption: '',
      });
      i += 4;
    }
  }

  return pages;
}
