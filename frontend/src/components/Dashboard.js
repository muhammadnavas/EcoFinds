import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Dashboard = ({ onBack, onShowMyListings, onShowOrderHistory, onShowCart }) => {
  const { user, authenticatedFetch } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalListings: 0,
      totalViews: 0,
      totalSales: 0,
      totalEarnings: 0
    },
    recentOrders: [],
    recentListings: [],
    cartItems: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's listings for stats
      const listingsResponse = await authenticatedFetch('http://localhost:5000/api/products/my-listings');
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        const listings = listingsData.data || [];
        
        setDashboardData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            totalListings: listings.length
          },
          recentListings: listings.slice(0, 5)
        }));
      }

      // Simulate other data - in a real app, these would come from actual APIs
      setDashboardData(prev => ({
        ...prev,
        recentOrders: [
          {
            id: '1',
            productName: 'Vintage Camera',
            status: 'delivered',
            date: '2025-09-01',
            amount: 125.00,
            seller: 'PhotoLover'
          },
          {
            id: '2',
            productName: 'Eco-Friendly Backpack',
            status: 'shipped',
            date: '2025-08-28',
            amount: 45.00,
            seller: 'GreenGoods'
          },
          {
            id: '3',
            productName: 'Wireless Headphones',
            status: 'cancelled',
            date: '2025-08-25',
            amount: 80.00,
            seller: 'TechSeller'
          }
        ],
        cartItems: [
          {
            id: '1',
            name: 'Leather Jacket',
            price: 65.00,
            image: 'https://via.placeholder.com/100x100',
            addedDate: '2025-09-03'
          },
          {
            id: '2',
            name: 'Smart Watch',
            price: 150.00,
            image: 'https://via.placeholder.com/100x100',
            addedDate: '2025-09-02'
          }
        ]
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-green-600 hover:text-green-700 transition duration-200 text-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center">
              <Logo size="xl" variant="full" />
              <h1 className="text-4xl font-bold text-gray-800 ml-5">Dashboard</h1>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="bg-white bg-opacity-20 rounded-full w-20 h-20 flex items-center justify-center">
              <span className="text-3xl font-bold">
                {user?.username ? user.username.charAt(0).toUpperCase() : '👤'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username || 'User'}!</h2>
              <p className="text-green-100 text-lg">Here's what's happening with your account</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Listings</p>
                <p className="text-3xl font-bold">{dashboardData.stats.totalListings}</p>
              </div>
              <div className="text-green-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Views</p>
                <p className="text-3xl font-bold">{dashboardData.stats.totalViews}</p>
              </div>
              <div className="text-blue-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Sales</p>
                <p className="text-3xl font-bold">{dashboardData.stats.totalSales}</p>
              </div>
              <div className="text-purple-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold">${dashboardData.stats.totalEarnings}</p>
              </div>
              <div className="text-orange-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={onShowMyListings}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
          >
            <div className="text-green-600 text-2xl mb-2">📦</div>
            <div className="font-medium text-gray-800">My Listings</div>
            <div className="text-sm text-gray-600">Manage products</div>
          </button>
          
          <button
            onClick={onShowOrderHistory}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
          >
            <div className="text-blue-600 text-2xl mb-2">📋</div>
            <div className="font-medium text-gray-800">Order History</div>
            <div className="text-sm text-gray-600">View purchases</div>
          </button>
          
          <button
            onClick={onShowCart}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
          >
            <div className="text-purple-600 text-2xl mb-2">🛒</div>
            <div className="font-medium text-gray-800">Shopping Cart</div>
            <div className="text-sm text-gray-600">{dashboardData.cartItems.length} items</div>
          </button>
          
          <button
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
          >
            <div className="text-orange-600 text-2xl mb-2">💬</div>
            <div className="font-medium text-gray-800">Messages</div>
            <div className="text-sm text-gray-600">Chat with sellers</div>
          </button>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
              <button
                onClick={onShowOrderHistory}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                dashboardData.recentOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{order.productName}</p>
                      <p className="text-sm text-gray-600">from {order.seller}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">${order.amount.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Listings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Listings</h3>
              <button
                onClick={onShowMyListings}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentListings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📦</div>
                  <p className="text-gray-500">No listings yet</p>
                </div>
              ) : (
                dashboardData.recentListings.slice(0, 3).map((listing) => (
                  <div key={listing._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img 
                      src={listing.imageUrl || 'https://via.placeholder.com/60x60'} 
                      alt={listing.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 truncate">{listing.title}</p>
                      <p className="text-green-600 font-bold">${parseFloat(listing.price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
