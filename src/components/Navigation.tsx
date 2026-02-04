'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationProps {
  username?: string;
}

export default function Navigation({ username }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Check if we're in demo mode
  const isDemoMode = pathname.startsWith('/demo');

  const handleLogout = async () => {
    if (confirm('Log out? You can log in again later.')) {
      setLoggingOut(true);
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/get-started');
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
        setLoggingOut(false);
      }
    }
    setShowDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to home
          </Link>

          {/* Connection Status */}
          <div className="relative">
            {username ? (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>{username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      {loggingOut ? 'Logging out...' : 'Log Out'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/get-started"
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Not logged in</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Link
              href="/demo/viewer"
              className={`px-3 py-1.5 text-sm font-medium rounded ${
                isDemoMode
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Demo
            </Link>
            {username && (
              <Link
                href={`/${username}/viewer`}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  !isDemoMode
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {username}
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 border-b border-gray-200">
          <Link
            href={isDemoMode ? '/demo/viewer' : `/${username}/viewer`}
            className={`px-4 py-2 ${
              isActive(isDemoMode ? '/demo/viewer' : `/${username}/viewer`)
                ? 'text-gray-900 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } rounded-t`}
          >
            Viewer
          </Link>
          {/* <span className="text-gray-400">/</span>
          <Link
            href={isDemoMode ? '/demo/find-duplicates' : `/${username}/find-duplicates`}
            className={`px-4 py-2 ${
              isActive(isDemoMode ? '/demo/find-duplicates' : `/${username}/find-duplicates`)
                ? 'text-gray-900 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } rounded-t`}
          >
            Find Duplicates
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href={isDemoMode ? '/demo/collections' : `/${username}/collections`}
            className={`px-4 py-2 ${
              isActive(isDemoMode ? '/demo/collections' : `/${username}/collections`)
                ? 'text-gray-900 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } rounded-t`}
          >
            Collections
          </Link> */}
        </nav>
      </div>
    </header>
  );
}
