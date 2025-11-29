// components/OfflineIndicator.jsx
import { useState, useEffect } from 'react';
import { WifiIcon } from '@heroicons/react/24/outline';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {!isOnline ? (
        <div className="bg-yellow-500 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiIcon className="w-5 h-5" />
            <span className="font-medium">You're offline. Check your internet connection.</span>
          </div>
        </div>
      ) : (
        <div className="bg-green-500 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiIcon className="w-5 h-5" />
            <span className="font-medium">Back online! 🎉</span>
          </div>
        </div>
      )}
    </div>
  );
}
