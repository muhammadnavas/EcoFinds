import { Link } from 'react-router-dom';
import AddProduct from '../components/AddProduct';
import { useAuth } from '../context/AuthContext';

const SellPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to sell products on EcoFinds.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 inline-block"
            >
              Login to Continue
            </Link>
            <Link
              to="/"
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200 inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center text-green-600 hover:text-green-700 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Sell Your Product</h1>
              <p className="text-gray-600 text-sm mt-1">List your eco-friendly items</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/my-listings"
                className="text-gray-600 hover:text-gray-800 transition duration-200 text-sm"
              >
                My Listings
              </Link>
              <div className="text-sm text-gray-600">
                Welcome, {user.username}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selling Tips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">💡 Selling Tips</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-green-700">
            <div>
              <strong>📸 Great Photos:</strong> Use clear, well-lit images showing all angles
            </div>
            <div>
              <strong>📝 Detailed Description:</strong> Include condition, dimensions, and eco-benefits
            </div>
            <div>
              <strong>💰 Fair Pricing:</strong> Research similar items for competitive pricing
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <AddProduct />
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🌱 Why Sell on EcoFinds?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Reach eco-conscious buyers</li>
                <li>• Give items a second life</li>
                <li>• Easy listing process</li>
                <li>• Secure transactions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📋 Listing Guidelines</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Only eco-friendly products</li>
                <li>• Accurate condition description</li>
                <li>• No prohibited items</li>
                <li>• Respond to buyers promptly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;