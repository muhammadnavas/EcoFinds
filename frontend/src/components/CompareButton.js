import { useComparison } from '../context/ComparisonContext';
import { useFeedback } from '../context/FeedbackContext';

const CompareButton = ({ productId, product, size = 'medium', className = '' }) => {
  const { 
    addToComparison, 
    removeFromComparison, 
    isInComparison, 
    isComparisonFull, 
    canAddProduct, 
    getComparisonCategory, 
    categoryError,
    clearError 
  } = useComparison();
  const { showSuccess, showWarning, showError } = useFeedback();
  
  const isComparing = isInComparison(productId);
  const isFull = isComparisonFull();

  const handleToggleCompare = (e) => {
    e.stopPropagation();
    
    if (isComparing) {
      removeFromComparison(productId);
      showSuccess('Removed from comparison');
      return;
    }

    if (isFull) {
      showWarning(`You can only compare up to 4 products at once`);
      return;
    }

    // Check if we have product data for category validation
    if (!product) {
      showError('Product information not available for comparison');
      return;
    }

    // Check category compatibility
    if (!canAddProduct(product)) {
      const currentCategory = getComparisonCategory();
      showError(`Can only compare products from the same category. Current comparison contains ${currentCategory} products.`);
      return;
    }

    addToComparison(productId, product);
    showSuccess(`Added ${product.title} to comparison`);
    
    // Clear any previous errors
    if (categoryError) {
      clearError();
    }
  };

  const sizeClasses = {
    small: 'p-2 text-xs',
    medium: 'p-2.5 text-sm',
    large: 'p-3 text-base'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleToggleCompare}
      disabled={!isComparing && isFull}
      className={`
        ${sizeClasses[size]}
        ${isComparing 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
        }
        ${(!isComparing && isFull) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded-lg transition-all duration-200 font-medium
        ${className}
      `}
      title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
    >
      <div className="flex items-center space-x-1">
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {size !== 'small' && (
          <span>{isComparing ? 'Comparing' : 'Compare'}</span>
        )}
      </div>
    </button>
  );
};

export default CompareButton;