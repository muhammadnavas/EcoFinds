import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = ({ onBack, onShowMyListings }) => {
  const { user, logout, updateUser, authenticatedFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
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

  useEffect(() => {
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || ''
    });
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
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
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess('');

    const result = await updateUser(editForm);
    
    if (result.success) {
      setUpdateSuccess('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setUpdateError(result.message);
    }
    
    setUpdateLoading(false);
  };

  const handleEditCancel = () => {
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
    setUpdateError('');
    setUpdateSuccess('');
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

  const handleLogout = () => {
    logout();
    if (onBack) onBack();
  };

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
              Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-12 text-white">
            <div className="flex items-center space-x-6">
              <div className="bg-white bg-opacity-20 rounded-full w-24 h-24 flex items-center justify-center">
                <span className="text-4xl font-bold">
                  {user?.username ? user.username.charAt(0).toUpperCase() : '👤'}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{user?.username || 'User'}</h2>
                <p className="text-green-100 text-lg">{user?.email}</p>
                <p className="text-green-100 text-sm mt-1">
                  Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'listings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Listings
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-gray-800">Dashboard Overview</h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                {/* Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Orders */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h4>
                    <div className="space-y-4">
                      {dashboardData.recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No orders yet</p>
                      ) : (
                        dashboardData.recentOrders.map((order) => (
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

                  {/* Cart Items */}
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Items in Cart</h4>
                    <div className="space-y-4">
                      {dashboardData.cartItems.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No items in cart</p>
                      ) : (
                        dashboardData.cartItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Added {item.addedDate}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Listings */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Recent Listings</h4>
                    <button
                      onClick={() => {
                        if (onShowMyListings) onShowMyListings();
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.recentListings.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">📦</div>
                        <p className="text-gray-500">No listings yet</p>
                      </div>
                    ) : (
                      dashboardData.recentListings.map((listing) => (
                        <div key={listing._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <img 
                            src={listing.imageUrl || 'https://via.placeholder.com/200x150'} 
                            alt={listing.title}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                          <h5 className="font-medium text-gray-800 truncate">{listing.title}</h5>
                          <p className="text-green-600 font-bold">${parseFloat(listing.price).toFixed(2)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
                  <button
                    onClick={() => isEditing ? handleEditCancel() : setIsEditing(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isEditing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {updateError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {updateError}
                  </div>
                )}

                {updateSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {updateSuccess}
                  </div>
                )}

                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="City, Country"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {editForm.bio.length}/500 characters
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                          updateLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {updateLoading ? 'Updating...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                        {user?.username || 'Not set'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                        {user?.email || 'Not set'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                        {user?.location || 'Not specified'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                        {user?.phone || 'Not provided'}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border min-h-[100px]">
                        {user?.bio || 'No bio provided'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border text-sm text-gray-600">
                        {user?.id || 'Not available'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">My Product Listings</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-blue-600 text-4xl mb-3">📦</div>
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">Manage Your Listings</h4>
                    <p className="text-blue-700 mb-4">
                      View, edit, and manage all your product listings in one place.
                    </p>
                    <button
                      onClick={() => {
                        if (onShowMyListings) onShowMyListings();
                      }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                    >
                      View My Listings
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
                    <div className="text-gray-600 text-sm">Active Listings</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 mb-1">0</div>
                    <div className="text-gray-600 text-sm">Total Views</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Account Settings</h3>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">Account Security</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Password changes and security settings will be available in a future update.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout Section */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h4 className="text-lg font-semibold text-red-800 mb-2">Sign Out</h4>
                    <p className="text-red-700 mb-4">
                      Sign out of your EcoFinds account. You'll need to log in again to access your account.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600">Products Listed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">Purchases Made</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">★ 5.0</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
