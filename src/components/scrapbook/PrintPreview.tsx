'use client';

import ScrapbookPage, { PageLayout } from './ScrapbookPage';

interface PrintPreviewProps {
  pages: PageLayout[];
  onClose: () => void;
}

export default function PrintPreview({ pages, onClose }: PrintPreviewProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Print Preview</h2>
            <p className="text-gray-300">Review your scrapbook before ordering</p>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close Preview
          </button>
        </div>

        {/* Pages */}
        <div className="space-y-8">
          {pages.map((page, index) => (
            <div key={page.id} className="max-w-2xl mx-auto">
              <ScrapbookPage
                page={page}
                pageNumber={index + 1}
                onCaptionChange={() => {}} // Read-only in print preview
                isPrintPreview={true}
              />
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="max-w-4xl mx-auto mt-12 mb-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to order your scrapbook?
            </h3>
            <p className="text-gray-600 mb-6">
              Your scrapbook has {pages.length} {pages.length === 1 ? 'page' : 'pages'} and is ready for print.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={() => alert('🎉 Demo mode - In production, this would integrate with a print service like Blurb or Shutterfly')}
                className="px-8 py-3 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                Order Physical Book
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Demo mode - No actual order will be placed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
