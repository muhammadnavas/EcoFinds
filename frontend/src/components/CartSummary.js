import { useCart } from '../context/CartContext';

const CartSummary = ({ showTitle = true, className = "" }) => {
  const { items, getTotalItems, getTotalPrice } = useCart();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {showTitle && (
        <h3 className="font-semibold text-lg mb-3">Cart Summary</h3>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium">{getTotalItems()}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">₹{(getTotalPrice() * 83).toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping:</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        
        <hr className="my-2" />
        
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span className="text-green-600">₹{(getTotalPrice() * 83).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
