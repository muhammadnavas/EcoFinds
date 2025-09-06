import { useState } from 'react';

const HelpWidget = ({ onShowHelp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const quickHelp = [
    {
      title: 'How to buy',
      description: 'Search for items, contact sellers, and make secure payments',
      icon: '🛒'
    },
    {
      title: 'How to sell',
      description: 'List your items with photos and descriptions',
      icon: '💰'
    },
    {
      title: 'Account help',
      description: 'Manage your profile and settings',
      icon: '👤'
    },
    {
      title: 'Safety tips',
      description: 'Stay safe while buying and selling',
      icon: '🔒'
    }
  ];

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && !isOpen && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap">
              Need help?
              <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}

          {/* Quick Help Panel */}
          {isOpen && (
            <div className="absolute bottom-full right-0 mb-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Quick Help</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  {quickHelp.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                        <p className="text-gray-600 text-xs">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    onShowHelp();
                    setIsOpen(false);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium"
                >
                  Visit Help Center
                </button>
              </div>
            </div>
          )}

          {/* Help Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center hover:scale-105"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default HelpWidget;
