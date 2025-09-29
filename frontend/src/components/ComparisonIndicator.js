import { useComparison } from '../context/ComparisonContext';

const ComparisonIndicator = () => {
  const { products, getComparisonCount, toggleComparisonView, clearComparison } = useComparison();
  
  const count = getComparisonCount();

  if (count === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-bounce-in">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 rounded-full p-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Product Comparison</h4>
              <p className="text-sm text-gray-600">
                {count} product{count > 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button
            onClick={clearComparison}
            className="text-gray-400 hover:text-red-500 transition"
            title="Clear all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product thumbnails */}
        <div className="flex space-x-2 mb-3 overflow-x-auto">
          {products.slice(0, 4).map((productId, index) => (
            <div key={productId} className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={toggleComparisonView}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Compare Now
          </button>
          <button
            onClick={clearComparison}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Clear
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Comparison slots</span>
            <span className="text-xs text-gray-500">{count}/4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(count / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonIndicator;