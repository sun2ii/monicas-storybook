'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ConnectStoragePage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('dropbox_access_token');
    if (!token) {
      // Redirect to get-started if no token
      router.push('/get-started');
    } else {
      setHasToken(true);
      setShowProviders(true);
    }
  }, [router]);

  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl text-center">
        {/* Success Message */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Access token saved</span>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Connect Your Storage
        </h1>

        <p className="text-xl text-gray-700 mb-12">
          Choose which providers you'd like to sync photos from
        </p>

        {/* Storage Providers */}
        {showProviders && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {/* Dropbox */}
              <div className="p-6 bg-white rounded-lg shadow-md border-2 border-transparent hover:border-indigo-400 transition-all cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-3 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"/>
                  </svg>
                </div>
                <p className="font-semibold text-gray-900">Dropbox</p>
                <p className="text-sm text-gray-600 mt-1">Photos & Videos</p>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Connected
                  </span>
                </div>
              </div>

              {/* Google Photos */}
              <div className="p-6 bg-white rounded-lg shadow-md border-2 border-gray-200 opacity-50">
                <div className="w-16 h-16 mx-auto mb-3 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.71 7.99a5.5 5.5 0 00-9.9 0l-1.1 2.2a5.5 5.5 0 000 4.96l1.1 2.2a5.5 5.5 0 009.9 0l1.1-2.2a5.5 5.5 0 000-4.96l-1.1-2.2z"/>
                    <path d="M12.29 7.99a5.5 5.5 0 00-9.9 0l-1.1 2.2a5.5 5.5 0 000 4.96l1.1 2.2a5.5 5.5 0 009.9 0l1.1-2.2a5.5 5.5 0 000-4.96l-1.1-2.2z"/>
                  </svg>
                </div>
                <p className="font-semibold text-gray-900">Google Photos</p>
                <p className="text-sm text-gray-600 mt-1">All albums</p>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    Coming soon
                  </span>
                </div>
              </div>

              {/* Amazon Photos */}
              <div className="p-6 bg-white rounded-lg shadow-md border-2 border-gray-200 opacity-50">
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Image
                    src="/icons/amazon-photos.png"
                    alt="Amazon Photos"
                    width={64}
                    height={64}
                  />
                </div>
                <p className="font-semibold text-gray-900">Amazon Photos</p>
                <p className="text-sm text-gray-600 mt-1">Photo library</p>
                <div className="mt-3">
                  <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/viewer"
              className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg mt-6"
            >
              Continue to Your Photos →
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              Your Dropbox account is ready to sync
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/get-started" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
}
