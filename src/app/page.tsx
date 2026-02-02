import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl text-center">
        {/* Hero Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Your memories stay safe,
          <br />
          <span className="text-indigo-600">exactly where they are</span>
        </h1>

        <p className="text-2xl text-gray-700 mb-4">
          We reference, never move or delete
        </p>

        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Modern technology treats memories as replaceable data, but your most important
          photos and videos are irreplaceable. Monica's Storybook creates a gentle,
          non-destructive layer over your existing storage.
        </p>

        {/* CTA Button */}
        <Link
          href="/get-started"
          className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          Get Started
        </Link>

        {/* Trust Badges */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 text-indigo-600">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Read-only access</p>
            <p className="text-xs text-gray-500 mt-1">Never write to your storage</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 text-indigo-600">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">No file deletion</p>
            <p className="text-xs text-gray-500 mt-1">We only reference, never delete</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 text-indigo-600">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Stay in control</p>
            <p className="text-xs text-gray-500 mt-1">Files remain in your storage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
