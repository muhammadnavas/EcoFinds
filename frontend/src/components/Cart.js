import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Payment from './Payment';

const Cart = ({ onBack }) => {
  const { user } = useAuth();
  const { 
    items: cartItems, 
    selectedItems, 
    loading, 
    error,
    updateQuantity: updateCartQuantity, 
    removeFromCart,
    toggleSelectItem: toggleCartItemSelection,
    selectAllItems,
    deselectAllItems,
    getSelectedTotal,
    getSelectedCount,
    getSelectedItems,
    clearError
  } = useCart();
  
  const [updating, setUpdating] = useState({});
  const [showPayment, setShowPayment] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  // Handle proceeding to checkout
  const handleProceedToCheckout = () => {
    const selectedCartItems = getSelectedItems();
    if (selectedCartItems.length === 0) {
      alert('Please select items to checkout');
      return;
    }
    setShowPayment(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentData) => {
    // You might want to clear the cart or redirect
    setShowPayment(false);
    alert('Payment successful! Order placed.');
    // Optionally clear selected items or entire cart
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <Payment
        onBack={handlePaymentCancel}
        cartItems={getSelectedItems()}
        cartTotal={getSelectedTotal()}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  // Wrapper functions to handle loading states
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await updateCartQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const toggleSelectItem = (itemId) => {
    toggleCartItemSelection(itemId);
  };

  const selectAll = () => {
    selectAllItems();
  };

  const deselectAll = () => {
    deselectAllItems();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-green-600 hover:text-green-700 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
            <div className="text-sm text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some items to get started!</p>
            <button
              onClick={onBack}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === cartItems.filter(item => item.inStock).length && cartItems.filter(item => item.inStock).length > 0}
                      onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="font-medium text-gray-800">Select All Available Items</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {selectedItems.size} of {cartItems.filter(item => item.inStock).length} selected
                  </span>
                </div>
              </div>

              {/* Cart Items List */}
              {cartItems.map((item) => (
                <div key={item.id} className={`bg-white rounded-lg shadow-sm p-6 ${!item.inStock ? 'opacity-60' : ''}`}>
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <div className="pt-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        disabled={!item.inStock}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
                      />
                    </div>

                    {/* Product Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">Sold by {item.seller}</p>
                          <p className="text-sm text-gray-600 mb-2">Condition: {item.condition}</p>
                          
                          {/* Additional Details */}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                            {item.size && <span className="bg-gray-100 px-2 py-1 rounded">Size: {item.size}</span>}
                            {item.material && <span className="bg-gray-100 px-2 py-1 rounded">{item.material}</span>}
                            {item.warranty && <span className="bg-gray-100 px-2 py-1 rounded">Warranty: {item.warranty}</span>}
                            {item.batteryLife && <span className="bg-gray-100 px-2 py-1 rounded">Battery: {item.batteryLife}</span>}
                          </div>

                          {!item.inStock && (
                            <div className="flex items-center text-red-600 text-sm mb-2">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Out of Stock
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-green-600">₹{(item.price * 83).toLocaleString('en-IN')}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">₹{(item.originalPrice * 83).toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating[item.id] || !item.inStock}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[3rem] text-center">
                              {updating[item.id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto"></div>
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating[item.id] || !item.inStock}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating[item.id]}
                            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                          >
                            {updating[item.id] ? 'Removing...' : 'Remove'}
                          </button>

                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Subtotal</p>
                            <p className="font-semibold">₹{(item.price * item.quantity * 83).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Items ({getSelectedCount()})</span>
                    <span>₹{(getSelectedTotal() * 83).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{(getSelectedTotal() * 83 * 0.08).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">₹{(getSelectedTotal() * 83 * 1.08).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedItems.size === 0}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout ({selectedItems.size})
                </button>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure checkout
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
                    </svg>
                    Free shipping on all orders
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    30-day return policy
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">Saved for Later</h4>
                  <p className="text-sm text-gray-600">Move items here to save for later</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
