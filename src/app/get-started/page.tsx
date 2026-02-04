'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GetStartedPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('monica');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessToken.trim()) {
      setError('Please enter your access code');
      return;
    }

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    setIsValidating(true);

    try {
      // Call login API to create session
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials. Please check your access code and username.');
        setIsValidating(false);
        return;
      }

      // Redirect to user's viewer page
      router.push(data.redirectUrl);
    } catch (err) {
      setError('Failed to connect. Please try again.');
      setIsValidating(false);
    }
  };

  const handleViewDemo = () => {
    router.push('/demo/viewer');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Started with Monica's Storybook
          </h1>
          <p className="text-lg text-gray-600">
            Connect your Dropbox to organize your photos, or explore with demo data
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Enter Access Token */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Enter Access Code
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter the access code provided to you to connect your photos
              </p>
            </div>

            <form onSubmit={handleTokenSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder:text-gray-400"
                  disabled={isValidating}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  id="token"
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your access code..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder:text-gray-400"
                  disabled={isValidating}
                />
                <p className="mt-2 text-xs text-gray-500">
                  This code was provided to you by your organizer
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isValidating || !accessToken.trim() || !username.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : 'Continue →'}
              </button>
            </form>
          </div>

          {/* Option B: View Demo */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Explore Demo
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Try the app with sample photos and see how it works
              </p>
            </div>

            <div className="mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">Demo includes:</h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sample photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Duplicate detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Collections & albums</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Scrapbook layouts</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleViewDemo}
              className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Demo →
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
