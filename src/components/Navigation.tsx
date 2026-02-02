'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getToken, removeToken, hasToken } from '@/lib/utils/tokenStorage';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setIsConnected(hasToken());
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect from Dropbox? You can reconnect later.')) {
      removeToken();
      setIsConnected(false);
      setShowDropdown(false);
      router.push('/');
    }
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
            {isConnected ? (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Connected</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Disconnect Dropbox
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
                <span>Demo Mode</span>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 border-b border-gray-200">
          <Link
            href="/viewer"
            className={`px-4 py-2 ${
              isActive('/viewer')
                ? 'text-gray-900 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } rounded-t`}
          >
            Viewer
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/duplicates"
            className={`px-4 py-2 ${
              isActive('/duplicates')
                ? 'text-gray-900 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } rounded-t`}
          >
            Find Duplicates
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/collections"
            className={`px-4 py-2 ${
              isActive('/collections')
                ? 'text-gray-900 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            } rounded-t`}
          >
            Collections
          </Link>
        </nav>
      </div>
    </header>
  );
}
