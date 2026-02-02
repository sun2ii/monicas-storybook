'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function OnboardingHero() {
  const [showProviders, setShowProviders] = useState(false);

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

        {/* Storage Providers */}
        {!showProviders ? (
          <button
            onClick={() => setShowProviders(true)}
            className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Connect Your Storage
          </button>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-700 font-medium">Choose your storage providers:</p>

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
              </div>

              {/* Google Photos */}
              <div className="p-6 bg-white rounded-lg shadow-md border-2 border-transparent hover:border-indigo-400 transition-all cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-3 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.71 7.99a5.5 5.5 0 00-9.9 0l-1.1 2.2a5.5 5.5 0 000 4.96l1.1 2.2a5.5 5.5 0 009.9 0l1.1-2.2a5.5 5.5 0 000-4.96l-1.1-2.2z"/>
                    <path d="M12.29 7.99a5.5 5.5 0 00-9.9 0l-1.1 2.2a5.5 5.5 0 000 4.96l1.1 2.2a5.5 5.5 0 009.9 0l1.1-2.2a5.5 5.5 0 000-4.96l-1.1-2.2z"/>
                  </svg>
                </div>
                <p className="font-semibold text-gray-900">Google Photos</p>
                <p className="text-sm text-gray-600 mt-1">All albums</p>
              </div>

              {/* Amazon Photos */}
              <div className="p-6 bg-white rounded-lg shadow-md border-2 border-transparent hover:border-indigo-400 transition-all cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <img
                    src="/icons/amazon-photos.png"
                    alt="Amazon Photos"
                    className="w-16 h-16"
                  />
                </div>
                <p className="font-semibold text-gray-900">Amazon Photos</p>
                <p className="text-sm text-gray-600 mt-1">Photo library</p>
              </div>
            </div>

            <Link
              href="/viewer"
              className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg mt-6"
            >
              Continue to Your Photos →
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              (Demo mode - no actual connection required)
            </p>
          </div>
        )}

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
