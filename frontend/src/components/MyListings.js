import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MyListings = ({ onBack, onShowProduct }) => {
  const { user, authenticatedFetch } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('http://localhost:5000/api/products/my-listings');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setListings(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch listings');
      }
    } catch (err) {
      setError('Failed to load your listings');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`http://localhost:5000/api/products/${listingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setListings(prev => prev.filter(listing => listing._id !== listingId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete listing');
      }
    } catch (err) {
      setError('Failed to delete listing');
      console.error('Error deleting listing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
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
              Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-800">My Listings</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">
                {user?.username ? user.username.charAt(0).toUpperCase() : '👤'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.username}'s Products</h2>
              <p className="text-gray-600">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Listings Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't created any product listings yet. Start selling your items!
            </p>
            <button
              onClick={onBack}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200"
              >
                <div className="relative">
                  <img
                    src={listing.imageUrl || '/api/placeholder/300/300'}
                    alt={listing.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => onShowProduct(listing._id)}
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleDeleteListing(listing._id)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-200"
                      title="Delete listing"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 
                    className="font-semibold text-gray-900 mb-2 truncate cursor-pointer hover:text-green-600"
                    onClick={() => onShowProduct(listing._id)}
                  >
                    {listing.title}
                  </h3>
                  <p className="text-green-600 font-bold text-lg mb-2">
                    ₹{(parseFloat(listing.price) * 83).toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {listing.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {listing.category}
                    </span>
                    <span>
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;