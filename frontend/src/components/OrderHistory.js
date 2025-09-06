import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const OrderHistory = ({ onBack }) => {
  const { user, authenticatedFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, delivered, shipped, cancelled, pending
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount-high, amount-low

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - in a real app, this would fetch actual order data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders = [
        {
          id: '1',
          productName: 'Vintage Leather Camera Bag',
          productImage: 'https://via.placeholder.com/150x150',
          status: 'delivered',
          orderDate: '2025-09-01',
          deliveryDate: '2025-09-05',
          amount: 125.00,
          seller: 'PhotoLover',
          sellerId: 'seller1',
          tracking: 'TRK123456789',
          quantity: 1,
          shippingAddress: '123 Main St, City, State 12345',
          paymentMethod: 'Credit Card ending in 4567'
        },
        {
          id: '2',
          productName: 'Eco-Friendly Backpack',
          productImage: 'https://via.placeholder.com/150x150',
          status: 'shipped',
          orderDate: '2025-08-28',
          estimatedDelivery: '2025-09-08',
          amount: 45.00,
          seller: 'GreenGoods',
          sellerId: 'seller2',
          tracking: 'TRK987654321',
          quantity: 1,
          shippingAddress: '123 Main St, City, State 12345',
          paymentMethod: 'PayPal'
        },
        {
          id: '3',
          productName: 'Wireless Headphones',
          productImage: 'https://via.placeholder.com/150x150',
          status: 'cancelled',
          orderDate: '2025-08-25',
          cancelledDate: '2025-08-26',
          amount: 80.00,
          seller: 'TechSeller',
          sellerId: 'seller3',
          quantity: 1,
          cancelReason: 'Out of stock',
          refundStatus: 'Refunded',
          refundDate: '2025-08-27'
        },
        {
          id: '4',
          productName: 'Organic Cotton T-Shirt',
          productImage: 'https://via.placeholder.com/150x150',
          status: 'pending',
          orderDate: '2025-09-03',
          amount: 25.00,
          seller: 'EcoFashion',
          sellerId: 'seller4',
          quantity: 2,
          shippingAddress: '123 Main St, City, State 12345',
          paymentMethod: 'Credit Card ending in 4567'
        },
        {
          id: '5',
          productName: 'Bamboo Phone Stand',
          productImage: 'https://via.placeholder.com/150x150',
          status: 'delivered',
          orderDate: '2025-08-20',
          deliveryDate: '2025-08-24',
          amount: 15.00,
          seller: 'BambooStore',
          sellerId: 'seller5',
          quantity: 1,
          shippingAddress: '123 Main St, City, State 12345',
          paymentMethod: 'Credit Card ending in 4567',
          rating: 5,
          review: 'Great product, fast shipping!'
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100 border-green-200';
      case 'shipped': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'shipped':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.orderDate) - new Date(a.orderDate);
      case 'oldest':
        return new Date(a.orderDate) - new Date(b.orderDate);
      case 'amount-high':
        return b.amount - a.amount;
      case 'amount-low':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order history...</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                    filter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-1 text-xs">
                      ({orders.filter(order => order.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {sortedOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${filter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-gray-800">Order #{order.id}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Ordered on {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Product Image */}
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    {/* Product Details */}
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{order.productName}</h4>
                      <p className="text-gray-600 mb-2">Sold by <span className="font-medium">{order.seller}</span></p>
                      <p className="text-gray-600 mb-2">Quantity: {order.quantity}</p>
                      <p className="text-2xl font-bold text-green-600">₹{(order.amount * 83).toLocaleString('en-IN')}</p>
                    </div>

                    {/* Order Status Details */}
                    <div className="md:text-right space-y-2">
                      {order.status === 'delivered' && (
                        <div>
                          <p className="text-sm text-gray-600">Delivered on</p>
                          <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {order.status === 'shipped' && (
                        <div>
                          <p className="text-sm text-gray-600">Expected delivery</p>
                          <p className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                          {order.tracking && (
                            <p className="text-sm text-blue-600">Tracking: {order.tracking}</p>
                          )}
                        </div>
                      )}
                      {order.status === 'cancelled' && (
                        <div>
                          <p className="text-sm text-gray-600">Cancelled on</p>
                          <p className="font-medium">{new Date(order.cancelledDate).toLocaleDateString()}</p>
                          {order.cancelReason && (
                            <p className="text-sm text-gray-600">Reason: {order.cancelReason}</p>
                          )}
                          {order.refundStatus && (
                            <p className="text-sm text-green-600">{order.refundStatus}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                    {order.status === 'delivered' && !order.rating && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm">
                        Write Review
                      </button>
                    )}
                    {order.status === 'shipped' && order.tracking && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm">
                        Track Package
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 text-sm">
                        Cancel Order
                      </button>
                    )}
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200 text-sm">
                      Contact Seller
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200 text-sm">
                      View Details
                    </button>
                  </div>

                  {/* Review Display */}
                  {order.rating && order.review && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">Your Review:</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < order.rating ? 'fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{order.review}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
