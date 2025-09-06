import { useState } from 'react';
import { useCart } from '../context/CartContext';

const AddToCartButton = ({ product, className = "", size = "medium" }) => {
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const quantity = getItemQuantity(product._id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(product);
    
    // Brief animation delay
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(product._id, newQuantity);
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
          className={`bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${sizeClasses[size]}`}
        >
          -
        </button>
        
        <span className="text-sm font-medium min-w-[2rem] text-center">
          {quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          className={`bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${sizeClasses[size]}`}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`
        bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200
        ${isAdding ? 'scale-95 bg-green-700' : 'hover:scale-105'}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isAdding ? (
        <span className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Adding...</span>
        </span>
      ) : (
        'Add to Cart'
      )}
    </button>
  );
};

export default AddToCartButton;
