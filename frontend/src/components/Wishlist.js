import { useCart } from '../context/CartContext';
import { useFeedback } from '../context/FeedbackContext';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = ({ onBack, onShowProduct }) => {
  const { 
    products, 
    productDetails, 
    removeFromWishlist, 
    clearWishlist, 
    getWishlistCount,
    getWishlistCategory 
  } = useWishlist();
  const { addToCart } = useCart();
  const { showSuccess, showWarning } = useFeedback();

  const wishlistProducts = products.map(productId => productDetails[productId]).filter(Boolean);
  const category = getWishlistCategory();

  const handleRemoveFromWishlist = (productId, productTitle) => {
    removeFromWishlist(productId);
    showSuccess(`Removed ${productTitle} from wishlist`);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showSuccess(`Added ${product.title} to cart`);
  };

  const handleClearWishlist = () => {
    if (products.length === 0) return;
    clearWishlist();
    showSuccess('Wishlist cleared');
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    showSuccess(`Moved ${product.title} to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600">
                  {getWishlistCount()} item{getWishlistCount() !== 1 ? 's' : ''} 
                  {category && ` in ${category}`}
                </p>
              </div>
            </div>
            
            {products.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistProducts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="text-6xl mb-6">💝</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist. You can add products from the same category to compare and organize your favorites.
            </p>
            <button
              onClick={onBack}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          // Products Grid
          <div>
            {/* Category Badge */}
            {category && (
              <div className="mb-6">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Category: {category}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={product.imageUrl || '/api/placeholder/300/200'}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-t-xl cursor-pointer"
                      onClick={() => onShowProduct(product._id)}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id, product.title)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 
                      className="font-semibold text-gray-800 mb-2 cursor-pointer hover:text-green-600 transition-colors line-clamp-2"
                      onClick={() => onShowProduct(product._id)}
                    >
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{(parseFloat(product.price) * 83).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.condition || 'Good'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Actions */}
            {wishlistProducts.length > 1 && (
              <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bulk Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      wishlistProducts.forEach(product => addToCart(product));
                      clearWishlist();
                      showSuccess(`Added all ${wishlistProducts.length} items to cart`);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Add All to Cart
                  </button>
                  <button
                    onClick={() => {
                      wishlistProducts.forEach(product => addToCart(product));
                      showSuccess(`Added all ${wishlistProducts.length} items to cart`);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Copy All to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;