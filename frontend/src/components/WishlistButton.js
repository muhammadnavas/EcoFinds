import { useFeedback } from '../context/FeedbackContext';
import { useWishlist } from '../context/WishlistContext';

const WishlistButton = ({ 
  productId, 
  product, 
  size = 'medium', 
  className = '', 
  iconClassName = '',
  textClassName = ''
}) => {
  const { 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist, 
    canAddProduct, 
    getWishlistCategory, 
    categoryError,
    clearError 
  } = useWishlist();
  const { showSuccess, showWarning, showError } = useFeedback();
  
  const isInWishlistState = isInWishlist(productId);

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    
    if (isInWishlistState) {
      removeFromWishlist(productId);
      showSuccess('Removed from wishlist');
      return;
    }

    // Check if we have product data for category validation
    if (!product) {
      showError('Product information not available');
      return;
    }

    // Check category compatibility
    if (!canAddProduct(product)) {
      const currentCategory = getWishlistCategory();
      showError(`Can only add products from the same category to wishlist. Current wishlist contains ${currentCategory} products.`);
      return;
    }

    addToWishlist(productId, product);
    showSuccess(`Added ${product.title} to wishlist`);
    
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
      onClick={handleToggleWishlist}
      className={`
        ${iconClassName || textClassName ? '' : sizeClasses[size]}
        ${isInWishlistState 
          ? 'bg-pink-600 text-white hover:bg-pink-700' 
          : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-300'
        }
        cursor-pointer rounded-lg transition-all duration-200 font-medium
        ${className}
      `}
      title={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <div className={iconClassName || textClassName ? 'flex flex-col items-center' : 'flex items-center space-x-1'}>
        <svg 
          className={iconClassName || iconSizes[size]} 
          fill={isInWishlistState ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        {size !== 'small' && (
          <span className={textClassName}>{isInWishlistState ? 'Wishlisted' : 'Wishlist'}</span>
        )}
      </div>
    </button>
  );
};

export default WishlistButton;