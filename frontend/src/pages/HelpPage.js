import { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const helpSections = [
    {
      id: 'getting-started',
      title: '🚀 Getting Started',
      icon: '🌱',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Welcome to EcoFinds!</h3>
            <p className="text-gray-600 mb-4">
              EcoFinds is your marketplace for sustainable, eco-friendly products. Whether you're buying or selling, 
              we're here to help you make environmentally conscious choices.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Quick Start Steps:</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Browse products by category or use the search function</li>
              <li>Create an account to save favorites and make purchases</li>
              <li>Add items to your cart and proceed to checkout</li>
              <li>List your own eco-friendly products to sell</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">💡 Pro Tips</h4>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              <li>Use detailed search filters to find exactly what you need</li>
              <li>Check product condition descriptions carefully</li>
              <li>Read seller ratings and reviews before purchasing</li>
              <li>Take clear photos when listing your own items</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'buying',
      title: '🛒 Buying Guide',
      icon: '💚',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Buy on EcoFinds</h3>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">1. Finding Products</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Browse by categories like Electronics, Home & Garden, Fashion</li>
              <li>Use the search bar with keywords</li>
              <li>Apply filters for price, condition, location</li>
              <li>Check the "Recently Added" section for new listings</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">2. Product Information</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Review product photos and descriptions</li>
              <li>Check the condition rating (New, Like New, Good, Fair)</li>
              <li>Read seller information and ratings</li>
              <li>Look for eco-friendly certifications or benefits</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">3. Making a Purchase</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Add items to your cart</li>
              <li>Review your order before checkout</li>
              <li>Choose secure payment method</li>
              <li>Confirm shipping address</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🛡️ Buyer Protection</h4>
            <p className="text-blue-700">
              All purchases are protected by our secure payment system. If you have issues with your order, 
              contact our support team within 30 days of purchase.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'selling',
      title: '💼 Selling Guide',
      icon: '📦',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Sell on EcoFinds</h3>
            <p className="text-gray-600 mb-4">
              Turn your unused items into cash while helping others make sustainable choices!
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">1. Creating Your Listing</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Take clear, well-lit photos from multiple angles</li>
              <li>Write detailed, honest descriptions</li>
              <li>Set competitive prices based on condition</li>
              <li>Choose the right category for your item</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">2. What Sells Well</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Electronics in good working condition</li>
              <li>Quality clothing and accessories</li>
              <li>Home decor and furniture</li>
              <li>Books, games, and educational materials</li>
              <li>Garden tools and outdoor equipment</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">3. Listing Guidelines</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Only list items you actually own</li>
              <li>Be honest about condition and defects</li>
              <li>No counterfeit or illegal items</li>
              <li>Respond to buyer questions promptly</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Ready to Start Selling?</h4>
                <p className="text-green-700">Create your first listing today!</p>
              </div>
              <Link
                to="/sell"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'account',
      title: '👤 Account & Profile',
      icon: '⚙️',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Managing Your Account</h3>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Profile Settings</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Update your username and contact information</li>
              <li>Add a bio to build trust with other users</li>
              <li>Set your location for local pickup options</li>
              <li>Upload a profile picture (optional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Privacy & Security</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>Your email is never shared with other users</li>
              <li>Phone numbers are only visible after purchase</li>
              <li>Use strong passwords and keep them secure</li>
              <li>Log out from shared devices</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Dashboard Features</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
              <li>View your active listings</li>
              <li>Track sales and purchase history</li>
              <li>Manage your wishlist</li>
              <li>Access order details and receipts</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'support',
      title: '🤝 Support',
      icon: '💬',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Get Help When You Need It</h3>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Common Issues</h4>
            <div className="space-y-3">
              <div className="border-l-4 border-yellow-400 pl-4">
                <h5 className="font-medium text-gray-800">Can't find my order</h5>
                <p className="text-gray-600 text-sm">Check your email for confirmation, or visit your dashboard to view order history.</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <h5 className="font-medium text-gray-800">Item not as described</h5>
                <p className="text-gray-600 text-sm">Contact the seller first. If unresolved, reach out to our support team with photos.</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <h5 className="font-medium text-gray-800">Payment issues</h5>
                <p className="text-gray-600 text-sm">Verify your payment information and try again. Contact support if problems persist.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Contact Support</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">📧 Email Support</h5>
                <p className="text-gray-600 text-sm mb-2">For non-urgent issues</p>
                <p className="text-green-600 font-medium">support@ecofinds.com</p>
                <p className="text-gray-500 text-xs">Response within 24 hours</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">💬 Live Chat</h5>
                <p className="text-gray-600 text-sm mb-2">Quick help for urgent issues</p>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition duration-200">
                  Start Chat
                </button>
                <p className="text-gray-500 text-xs">Available 9 AM - 6 PM EST</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">📚 More Resources</h4>
            <div className="space-y-2">
              <Link to="/categories" className="block text-blue-600 hover:text-blue-800 text-sm">
                Browse Product Categories →
              </Link>
              <Link to="/sell" className="block text-blue-600 hover:text-blue-800 text-sm">
                Seller Guidelines →
              </Link>
              <button 
                onClick={() => alert('Community Forums coming soon!')}
                className="block text-blue-600 hover:text-blue-800 text-sm text-left"
              >
                Community Forums →
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <h1 className="text-3xl font-bold text-gray-800">Help Center</h1>
              <p className="text-gray-600 mt-1">Find answers to your questions</p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 className="font-semibold text-gray-800 mb-4">Help Topics</h3>
              <nav className="space-y-2">
                {helpSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition duration-200 flex items-center space-x-2 ${
                      activeSection === section.id
                        ? 'bg-green-100 text-green-800 border-l-4 border-green-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {helpSections.find(section => section.id === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Help Bar */}
      <div className="bg-green-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-white text-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span className="text-sm">Need immediate help?</span>
              </div>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition duration-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;