import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import AddToCartButton from './AddToCartButton';
import CompareButton from './CompareButton';
import WishlistButton from './WishlistButton';

const TouchOptimizedCard = ({ 
  product, 
  onShowProduct, 
  onQuickView, 
  onProductDeleted, 
  isMobile = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const { user } = useCart();
  
  const cardRef = useRef(null);
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl || product.image || '/api/placeholder/400/300'];

  // Check if user owns this product
  const isOwner = user && (
    product.seller?._id === user._id || 
    product.seller?.username === user.username ||
    product.sellerName === user.username
  );

  // Touch gesture handling for image swiping
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (images.length > 1) {
      if (isLeftSwipe) {
        setCurrentImageIndex(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0);
      } else if (isRightSwipe) {
        setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1);
      }
    }
  };

  // Handle card tap vs long press
  const [pressTimer, setPressTimer] = useState(null);
  const [pressStartTime, setPressStartTime] = useState(null);

  const handleTouchStart = (e) => {
    setPressStartTime(Date.now());
    const timer = setTimeout(() => {
      setShowActions(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    setPressTimer(timer);
    onTouchStart(e);
  };

  const handleTouchEnd = (e) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    const pressDuration = Date.now() - (pressStartTime || 0);
    
    if (pressDuration < 500 && !showActions) {
      if (!e.target.closest('.action-button')) {
        onShowProduct(product._id);
      }
    }
    
    onTouchEnd();
  };

  // Close actions on outside tap
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('touchstart', handleOutsideClick);
      return () => document.removeEventListener('touchstart', handleOutsideClick);
    }
  }, [showActions]);

  const handleDeleteProduct = async (e) => {
    e.stopPropagation();
    
    if (!isOwner) {
      alert('You can only delete your own products');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        if (onProductDeleted) {
          onProductDeleted(product._id);
        }
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
    
    setShowActions(false);
  };

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative group border border-gray-100 ${
        isMobile ? 'touch-manipulation' : 'cursor-pointer'
      }`}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onClick={!isMobile ? () => onShowProduct(product._id) : undefined}
      onMouseEnter={!isMobile ? () => setIsHovered(true) : undefined}
      onMouseLeave={!isMobile ? () => setIsHovered(false) : undefined}
    >
      {/* Mobile Action Overlay */}
      {isMobile && showActions && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 shadow-2xl">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onQuickView(product._id);
                  setShowActions(false);
                }}
                className="action-button flex flex-col items-center p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs font-medium">Quick View</span>
              </button>
              
              <button
                onClick={() => setShowActions(false)}
                className="action-button flex flex-col items-center p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs font-medium">Close</span>
              </button>
              
              <div className="action-button p-3 bg-pink-50 rounded-lg">
                <WishlistButton 
                  product={product} 
                  className="w-full flex flex-col items-center text-pink-600 hover:text-pink-700"
                  iconClassName="w-6 h-6 mb-1"
                  textClassName="text-xs font-medium"
                />
              </div>
              
              {isOwner && (
                <button
                  onClick={handleDeleteProduct}
                  className="action-button flex flex-col items-center p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs font-medium">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
          ✓ Verified
        </span>
        {product.condition && (
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            {product.condition}
          </span>
        )}
      </div>

      {/* Image Section with Swipe Support */}
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-green-600"></div>
          </div>
        )}
        
        <img
          src={images[currentImageIndex]}
          alt={product.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isHovered && !isMobile ? 'scale-110' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageError(true);
            setImageLoaded(true);
            e.target.src = '/api/placeholder/400/300';
          }}
        />

        {/* Image Navigation Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
            {product.title}
          </h3>
          <div className="flex items-center space-x-1">
            <CompareButton productId={product._id} product={product} size="small" />
            <WishlistButton productId={product._id} product={product} size="small" />
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-green-600">
              ₹{(product.price * 83).toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-500 ml-2">
              ${product.price}
            </span>
          </div>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            {product.category}
          </span>
        </div>

        {/* Rating and Location */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3 h-3 ${
                    star <= (product.rating || 4.2) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span>{product.rating || '4.2'}</span>
          </div>
          {product.location && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {product.location}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <AddToCartButton
            product={product}
            className="w-full action-button"
            size={isMobile ? 'large' : 'medium'}
          />
        </div>
      </div>
    </div>
  );
};

export default TouchOptimizedCard;