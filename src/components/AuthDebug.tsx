'use client';

import { useAuth } from '@/hooks/useAuth';

/**
 * AuthDebug Component
 * 
 * A utility component to help debug authentication issues.
 * Shows current user state, role, and authentication status.
 * 
 * Usage: Add to any page to see auth state
 * 
 * import AuthDebug from '@/components/AuthDebug';
 * 
 * <AuthDebug />
 */
export default function AuthDebug() {
  const { user, loading, error } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2 text-sm">🔐 Auth Debug</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Loading:</span>
          <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Authenticated:</span>
          <span className={user ? 'text-green-400' : 'text-red-400'}>
            {user ? 'Yes' : 'No'}
          </span>
        </div>
        
        {user && (
          <>
            <div className="border-t border-gray-700 my-2"></div>
            <div>
              <span className="text-gray-400">Name:</span>
              <div className="font-semibold">{user.name}</div>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <div className="font-semibold">{user.email}</div>
            </div>
            <div>
              <span className="text-gray-400">Role:</span>
              <div className="font-semibold text-blue-400">{user.role}</div>
            </div>
            <div>
              <span className="text-gray-400">User ID:</span>
              <div className="font-mono text-xs">{user.id}</div>
            </div>
          </>
        )}
        
        {error && (
          <>
            <div className="border-t border-gray-700 my-2"></div>
            <div>
              <span className="text-red-400">Error:</span>
              <div className="text-red-300 text-xs">{error}</div>
            </div>
          </>
        )}
        
        <div className="border-t border-gray-700 my-2"></div>
        <div className="text-gray-500 text-xs">
          Token: {localStorage.getItem('token') ? '✓' : '✗'}
        </div>
      </div>
    </div>
  );
}
