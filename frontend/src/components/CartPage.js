import { useState } from 'react';
import { useCart } from '../context/CartContext';

const CartPage = ({ onBack }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const ArrowLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      alert('Order placed successfully! 🎉');
      clearCart();
      setIsCheckingOut(false);
      onBack();
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon />
                <span className="ml-2">Back to Shop</span>
              </button>
              <h1 className="text-xl font-semibold">Shopping Cart</h1>
            </div>
          </div>
        </header>

        {/* Empty Cart */}
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any eco-friendly products yet!</p>
          <button
            onClick={onBack}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon />
                <span className="ml-2">Back to Shop</span>
              </button>
              <h1 className="text-xl font-semibold">Shopping Cart</h1>
            </div>
            
            <button
              onClick={clearCart}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <TrashIcon />
              <span className="ml-2">Clear Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Cart Items ({items.length})</h2>
              
              <div className="space-y-6">
                {items.map((item) => (
                  <CartPageItem
                    key={item._id}
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{(getTotalPrice() * 83).toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">₹{(getTotalPrice() * 83 * 0.08).toLocaleString('en-IN')}</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    ₹{(getTotalPrice() * 83 * 1.08).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  🔒 Secure checkout powered by sustainability
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPageItem = ({ item, onRemove, onUpdateQuantity }) => {
  const [imageError, setImageError] = useState(false);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      onRemove(item._id);
    } else {
      onUpdateQuantity(item._id, newQuantity);
    }
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-b last:border-b-0">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        <img
          src={imageError ? 'https://via.placeholder.com/80x80/e5e7eb/6b7280?text=No+Image' : item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
        <p className="text-lg font-semibold text-green-600 mt-2">₹{(item.price * 83).toLocaleString('en-IN')}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          -
        </button>
        
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          +
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item._id)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
        title="Remove item"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default CartPage;
