import { useState } from 'react';
import Logo from './Logo';

const Help = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      description: 'Learn the basics of using EcoFinds'
    },
    {
      id: 'buying',
      title: 'Buying Items',
      icon: '🛒',
      description: 'How to find and purchase items'
    },
    {
      id: 'selling',
      title: 'Selling Items',
      icon: '💰',
      description: 'List and manage your products'
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: '👤',
      description: 'Manage your account settings'
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      icon: '🔒',
      description: 'Stay safe while trading'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      description: 'Common issues and solutions'
    }
  ];

  const helpContent = {
    'getting-started': [
      {
        question: 'What is EcoFinds?',
        answer: 'EcoFinds is a sustainable marketplace where people can buy and sell pre-owned items, promoting circular economy and reducing waste. Our platform connects buyers and sellers for electronics, fashion, home goods, and more.'
      },
      {
        question: 'How do I create an account?',
        answer: 'Click the "Login" button in the top navigation, then select "Register" to create a new account. You\'ll need to provide a username, email address, and password. After registration, you can complete your profile with additional information.'
      },
      {
        question: 'Is EcoFinds free to use?',
        answer: 'Yes! Creating an account and browsing items is completely free. We don\'t charge listing fees for sellers, and buyers don\'t pay any platform fees. You only pay for the items you purchase.'
      },
      {
        question: 'How do I navigate the platform?',
        answer: 'Use the main navigation bar to browse categories, search for items, access your dashboard, and manage your account. The search bar helps you find specific items, and category filters help narrow down results.'
      }
    ],
    'buying': [
      {
        question: 'How do I search for items?',
        answer: 'Use the search bar at the top of the page to enter keywords, or browse by categories. You can filter results by category, price range, and condition. Click on any item to view detailed information and photos.'
      },
      {
        question: 'How do I contact a seller?',
        answer: 'On any product page, you\'ll find a "Contact Seller" button. This opens a direct message thread where you can ask questions about the item, negotiate price, or arrange pickup/delivery.'
      },
      {
        question: 'How do payments work?',
        answer: 'EcoFinds supports various payment methods including credit/debit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners. You can save payment methods in your account for faster checkout.'
      },
      {
        question: 'What if I\'m not satisfied with my purchase?',
        answer: 'We have a 30-day return policy for items that don\'t match their description. Contact the seller first to resolve any issues. If needed, our support team can help mediate disputes and process returns.'
      },
      {
        question: 'How do I track my orders?',
        answer: 'Visit your Dashboard > Order History to view all your purchases. You\'ll see order status, tracking information, and delivery updates. You\'ll also receive email notifications for order updates.'
      }
    ],
    'selling': [
      {
        question: 'How do I list an item for sale?',
        answer: 'Click "Sell" in the navigation bar, then fill out the listing form with item details, photos, price, and description. Make sure to accurately describe the item\'s condition and include high-quality photos from multiple angles.'
      },
      {
        question: 'What photos should I include?',
        answer: 'Include 3-8 clear, well-lit photos showing the item from different angles. Include close-ups of any wear, damage, or unique features. Good photos significantly increase your chances of selling.'
      },
      {
        question: 'How do I price my items?',
        answer: 'Research similar items on our platform to gauge market prices. Consider the item\'s condition, age, and original retail price. Competitive pricing helps items sell faster. You can always adjust prices later if needed.'
      },
      {
        question: 'How do I manage my listings?',
        answer: 'Go to Dashboard > My Listings to view all your active and sold items. You can edit listings, update prices, mark items as sold, or delete listings. You\'ll also see view counts and saved statistics.'
      },
      {
        question: 'When do I get paid?',
        answer: 'Payments are processed after the buyer confirms receipt of the item or after the protection period expires. Funds are typically available in your account within 2-3 business days and can be withdrawn to your bank account.'
      }
    ],
    'account': [
      {
        question: 'How do I update my profile?',
        answer: 'Go to Dashboard > Edit Profile to update your personal information, bio, location, and contact details. A complete profile builds trust with other users and improves your selling success.'
      },
      {
        question: 'How do I change my password?',
        answer: 'Visit your account settings to change your password. For security, we recommend using a strong, unique password and enabling two-factor authentication if available.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account from the account settings page. Note that this action is permanent and will remove all your listings, messages, and order history. Complete any pending transactions first.'
      },
      {
        question: 'How do I manage notifications?',
        answer: 'In your account settings, you can control which email and push notifications you receive. Options include new messages, order updates, price drop alerts, and platform announcements.'
      }
    ],
    'safety': [
      {
        question: 'How do I stay safe when buying?',
        answer: 'Always review seller profiles and ratings. Ask questions before purchasing. Meet in public places for local pickups. Use our secure payment system rather than cash for online transactions. Report suspicious activity immediately.'
      },
      {
        question: 'What should I do if I encounter a scam?',
        answer: 'Report the user immediately using the "Report" button on their profile or listing. Don\'t send money outside our platform. If you\'ve been scammed, contact our support team with all relevant information and screenshots.'
      },
      {
        question: 'How do I report inappropriate content?',
        answer: 'Use the "Report" button found on listings, profiles, and messages to flag inappropriate content, fake items, or policy violations. Our moderation team reviews all reports promptly.'
      },
      {
        question: 'Is my personal information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your data. We never share your personal information with third parties without consent. Your payment information is handled by secure payment processors.'
      }
    ],
    'troubleshooting': [
      {
        question: 'I can\'t log into my account',
        answer: 'Try resetting your password using the "Forgot Password" link. Check that you\'re using the correct email address. Clear your browser cache and cookies. If issues persist, contact our support team.'
      },
      {
        question: 'My photos won\'t upload',
        answer: 'Ensure photos are under 10MB each and in JPG, PNG, or WebP format. Check your internet connection. Try uploading one photo at a time. If using mobile, ensure the app has camera/storage permissions.'
      },
      {
        question: 'I\'m not receiving email notifications',
        answer: 'Check your spam/junk folder. Ensure notifications are enabled in your account settings. Add our email address to your contacts. If using a work email, check with your IT department about email filters.'
      },
      {
        question: 'The site is loading slowly',
        answer: 'Check your internet connection. Clear your browser cache and cookies. Try using a different browser or device. If problems persist, the issue may be on our end - check our status page or contact support.'
      },
      {
        question: 'I need to contact customer support',
        answer: 'You can reach our support team through the "Contact Us" form, email support@ecofinds.com, or live chat during business hours (9 AM - 6 PM). We typically respond within 24 hours.'
      }
    ]
  };

  const filteredContent = searchQuery
    ? helpContent[selectedCategory]?.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : helpContent[selectedCategory];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
            {/* Header */}
      <header className="bg-white shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <Logo size="xl" variant="full" />
              <div className="ml-5">
                <h1 className="text-3xl font-semibold text-gray-800">Help Center</h1>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors text-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl text-white p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">How can we help you?</h2>
            <p className="text-green-100 text-lg mb-6">
              Find answers to common questions and learn how to make the most of EcoFinds
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Help Topics</h3>
              <nav className="space-y-2">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.title}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="mailto:support@ecofinds.com" className="flex items-center text-green-600 hover:text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email Support
                </a>
                <button className="flex items-center text-green-600 hover:text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Live Chat
                </button>
                <button className="flex items-center text-green-600 hover:text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.5a1.5 1.5 0 11-3 0V10a1 1 0 10-2 0v1.5a3.5 3.5 0 107 0V5.5l8-1.6V9.5a1.5 1.5 0 11-3 0V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Video Tutorials
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Content Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {helpCategories.find(cat => cat.id === selectedCategory)?.icon}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {helpCategories.find(cat => cat.id === selectedCategory)?.title}
                    </h2>
                    <p className="text-gray-600">
                      {helpCategories.find(cat => cat.id === selectedCategory)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Content */}
              <div className="p-6">
                {filteredContent && filteredContent.length > 0 ? (
                  <div className="space-y-6">
                    {filteredContent.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          {item.question}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search or browse different categories
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mt-6 border border-blue-100">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Still need help?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Can't find what you're looking for? Our support team is here to help you with any questions or issues.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                      Contact Support
                    </button>
                    <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition duration-200">
                      Request Feature
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
