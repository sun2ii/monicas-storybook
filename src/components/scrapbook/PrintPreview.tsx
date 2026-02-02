'use client';

import React from 'react';
import { PageLayout } from './ScrapbookPage';
import jsPDF from 'jspdf';
import { calculatePDFLayout } from '@/lib/utils/pdfLayout';
import { loadImageForPDF } from '@/lib/utils/imageLoader';

interface PrintPreviewProps {
  pages: PageLayout[];
  collectionName: string;
  onClose: () => void;
}

export default function PrintPreview({ pages, collectionName, onClose }: PrintPreviewProps) {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF('l', 'mm', 'letter');
      const pageWidth = 279;
      const pageHeight = 216;

      // Title page
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(48);
      pdf.text(collectionName, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      pdf.setFontSize(20);
      const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      pdf.text(currentDate, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });

      // Scrapbook pages - Direct image insertion approach
      for (let i = 0; i < pages.length; i++) {
        pdf.addPage();
        const page = pages[i];

        // Calculate layout positions for this page
        const positions = calculatePDFLayout(
          page.template,
          page.photos.length,
          pageWidth,
          pageHeight
        );

        // Add each photo at original resolution
        for (let j = 0; j < page.photos.length; j++) {
          const photo = page.photos[j];
          const pos = positions[j];

          try {
            // Load image at full resolution
            const img = await loadImageForPDF(photo.dropbox_url || '/placeholder.png');

            // Calculate aspect-aware sizing (object-contain behavior)
            const imgAspect = img.naturalWidth / img.naturalHeight;
            const posAspect = pos.width / pos.height;

            let finalWidth = pos.width;
            let finalHeight = pos.height;
            let offsetX = 0;
            let offsetY = 0;

            // Maintain aspect ratio
            if (imgAspect > posAspect) {
              // Image is wider than position
              finalHeight = pos.width / imgAspect;
              offsetY = (pos.height - finalHeight) / 2;
            } else {
              // Image is taller than position
              finalWidth = pos.height * imgAspect;
              offsetX = (pos.width - finalWidth) / 2;
            }

            // Add image to PDF at FULL QUALITY
            pdf.addImage(
              img,
              'JPEG',
              pos.x + offsetX,
              pos.y + offsetY,
              finalWidth,
              finalHeight,
              undefined,
              'FAST'
            );
          } catch (error) {
            console.error(`Failed to load photo ${j} on page ${i}:`, error);
            // Draw placeholder rectangle
            pdf.setFillColor(200, 200, 200);
            pdf.rect(pos.x, pos.y, pos.width, pos.height, 'F');
          }
        }

        // Add caption as actual text (not rasterized!)
        if (page.caption) {
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          const captionY = pageHeight - 15;
          pdf.text(
            page.caption,
            pageWidth / 2,
            captionY,
            { align: 'center', maxWidth: pageWidth - 40 }
          );
        }

        // Page number
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `${i + 1}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${collectionName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    link.click();
  };

  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {pdfUrl ? 'PDF Preview' : 'Generate Scrapbook PDF'}
            </h2>
            <p className="text-gray-300">
              {pdfUrl ? 'View and download your scrapbook' : 'Create a PDF of your scrapbook'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>

        {/* PDF Viewer or Scrapbook Pages */}
        {pdfUrl ? (
          <div className="max-w-6xl mx-auto">
            <iframe
              src={pdfUrl}
              className="w-full h-[70vh] border-2 border-gray-300 rounded-lg"
              title="PDF Preview"
            />

            {/* Download Actions */}
            <div className="mt-8 text-center">
              <div className="bg-white rounded-lg shadow-lg p-8 inline-block">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Your scrapbook PDF is ready!
                </h3>
                <p className="text-gray-600 mb-6">
                  Preview above or download to save locally
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-8 py-3 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Generate Button */}
            <div className="max-w-4xl mx-auto mt-12 mb-8 text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to generate your scrapbook PDF?
                </h3>
                <p className="text-gray-600 mb-6">
                  Your scrapbook has {pages.length} {pages.length === 1 ? 'page' : 'pages'}
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="px-8 py-3 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
