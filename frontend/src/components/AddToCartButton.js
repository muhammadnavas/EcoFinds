import { useState } from 'react';
import { useCart } from '../context/CartContext';

const AddToCartButton = ({ product, className = "", size = "medium" }) => {
  const { addToCart, getItemQuantity, updateQuantity, getItemState } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const quantity = getItemQuantity(product._id);
  const itemState = getItemState ? getItemState(product._id) : { loading: false, success: false, error: false };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      // Brief animation delay
      setTimeout(() => {
        setIsAdding(false);
      }, 300);
    }
  };

  const handleQuantityChange = async (newQuantity) => {
    try {
      await updateQuantity(product._id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Size variants
  const sizeClasses = {
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-2 text-sm font-medium",
    large: "px-6 py-3 text-base font-semibold"
  };

  if (quantity > 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={itemState.loading}
          className={`bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${sizeClasses[size]} ${itemState.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {itemState.loading ? (
            <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            '-'
          )}
        </button>
        
        <span className={`text-sm font-medium min-w-[2rem] text-center ${itemState.success ? 'text-green-600' : ''}`}>
          {quantity}
          {itemState.success && (
            <span className="ml-1 text-green-500 animate-bounce">✓</span>
          )}
        </span>
        
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={itemState.loading}
          className={`bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${sizeClasses[size]} ${itemState.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {itemState.loading ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            '+'
          )}
        </button>
      </div>
    );
  }

  const getButtonContent = () => {
    if (isAdding || itemState.loading) {
      return (
        <span className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Adding...</span>
        </span>
      );
    }

    if (itemState.success) {
      return (
        <span className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Added!</span>
        </span>
      );
    }

    if (itemState.error) {
      return 'Try Again';
    }

    return 'Add to Cart';
  };

  const getButtonStyles = () => {
    if (itemState.success) {
      return 'bg-green-700 text-white scale-105';
    }
    
    if (itemState.error) {
      return 'bg-red-600 text-white hover:bg-red-700';
    }

    if (isAdding || itemState.loading) {
      return 'bg-green-700 text-white scale-95';
    }

    return 'bg-green-600 text-white hover:bg-green-700 hover:scale-105';
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || itemState.loading}
      className={`
        rounded-lg transition-all duration-200 transform
        ${getButtonStyles()}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {getButtonContent()}
    </button>
  );
};

export default AddToCartButton;
