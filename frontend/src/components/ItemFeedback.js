import { useEffect, useState } from 'react';

const ItemFeedback = ({ itemState, className = '' }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (itemState.success || itemState.error) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [itemState.success, itemState.error]);

  if (!itemState.loading && !itemState.success && !itemState.error) {
    return null;
  }

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${className}`}>
      {/* Loading State */}
      {itemState.loading && (
        <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-lg border-2 border-blue-200 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Success State */}
      {itemState.success && showAnimation && (
        <div className="bg-green-50 bg-opacity-95 rounded-lg p-4 shadow-lg border-2 border-green-200 animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="text-green-500 text-2xl animate-pulse">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-green-700 font-medium">Success!</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {itemState.error && showAnimation && (
        <div className="bg-red-50 bg-opacity-95 rounded-lg p-4 shadow-lg border-2 border-red-200 animate-shake">
          <div className="flex items-center space-x-3">
            <div className="text-red-500 text-2xl">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-red-700 font-medium">Error!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemFeedback;