import { useState } from 'react';
import Cart from './Cart';
import Dashboard from './Dashboard';
import MyListings from './MyListings';
import Navigation from './Navigation';
import OrderHistory from './OrderHistory';
import ProfileEditContent from './ProfileEditContent';

const UserPortal = ({ onBack, onShowProduct, onShowHelp }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page) => {
    if (page === 'help') {
      // Navigate to main help page instead of showing in portal
      onShowHelp();
    } else {
      setCurrentPage(page);
    }
  };

  const handleShowMyListings = () => {
    setCurrentPage('myListings');
  };

  const handleShowOrderHistory = () => {
    setCurrentPage('orderHistory');
  };

  const handleShowCart = () => {
    setCurrentPage('cartPage');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onBack={onBack}
            onShowMyListings={handleShowMyListings}
            onShowOrderHistory={handleShowOrderHistory}
            onShowCart={handleShowCart}
          />
        );
      case 'profileEdit':
        return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileEditContent
              onBack={() => setCurrentPage('dashboard')}
            />
          </div>
        );
      case 'orderHistory':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <OrderHistory
              onBack={() => setCurrentPage('dashboard')}
            />
          </div>
        );
      case 'cartPage':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Cart
              onBack={() => setCurrentPage('dashboard')}
            />
          </div>
        );
      case 'myListings':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MyListings
              onBack={() => setCurrentPage('dashboard')}
              onShowProduct={onShowProduct}
            />
          </div>
        );
      default:
        return (
          <Dashboard
            onBack={onBack}
            onShowMyListings={handleShowMyListings}
            onShowOrderHistory={handleShowOrderHistory}
            onShowCart={handleShowCart}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Header */}
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
              Back to EcoFinds
            </button>
            <h1 className="text-2xl font-bold text-gray-800">User Portal</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Page Content */}
      <div className="flex-1">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default UserPortal;
