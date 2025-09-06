import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

const CartIcon = ({ size = 24 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
  </svg>
);

const XIcon = ({ size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MinusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CartButton = ({ onShowCart }) => {
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <button 
        className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
        onClick={() => setIsCartOpen(true)}
      >
        <CartIcon size={24} />
        {getTotalItems() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>

      {isCartOpen && (
        <CartSidebar 
          onClose={() => setIsCartOpen(false)} 
          onShowCart={onShowCart}
        />
      )}
    </>
  );
};

const CartSidebar = ({ onClose, onShowCart }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  // Prevent body scroll when cart is open and handle animation
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Trigger animation after a small delay
    setTimeout(() => setIsVisible(true), 10);
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Delay the actual close to allow animation
    setTimeout(() => onClose(), 300);
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here!');
    // Here you would integrate with a payment processor
  };

  const handleViewCart = () => {
    handleClose();
    onShowCart();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[450px] md:w-[500px] lg:w-[550px] bg-white shadow-2xl z-[70] flex flex-col transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          position: 'fixed',
          top: '0',
          bottom: '0',
          right: '0',
          margin: '0',
          padding: '0',
          border: 'none',
          outline: 'none',
          maxWidth: '100vw',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🛒</div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Your cart is empty</h3>
              <p className="text-gray-500 text-lg">Add some eco-friendly products to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <CartItem 
                  key={item._id} 
                  item={item} 
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50 p-6 space-y-6">
            {/* Total */}
            <div className="flex items-center justify-between text-xl font-semibold">
              <span>Total:</span>
              <span className="text-green-600">₹{(getTotalPrice() * 83).toLocaleString('en-IN')}</span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                onClick={handleViewCart}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-lg"
              >
                View Full Cart
              </button>
              <button 
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-lg"
              >
                Quick Checkout
              </button>
              <button 
                onClick={clearCart}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-lg"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const [imageError, setImageError] = useState(false);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      onRemove(item._id);
    } else {
      onUpdateQuantity(item._id, newQuantity);
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border">
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
        <h4 className="font-medium text-base text-gray-900 truncate">{item.title}</h4>
        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
        <p className="text-lg font-semibold text-green-600 mt-2">₹{(item.price * 83).toLocaleString('en-IN')}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <MinusIcon size={18} />
        </button>
        
        <span className="w-10 text-center text-base font-medium">{item.quantity}</span>
        
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <PlusIcon size={18} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item._id)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <XIcon size={18} />
      </button>
    </div>
  );
};

export default CartButton;
