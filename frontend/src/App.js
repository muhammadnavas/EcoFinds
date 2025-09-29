import { useState } from 'react';
import './App.css';
import AddProduct from './components/AddProduct';
import CartPage from './components/CartPage';
import Categories from './components/Categories';
import Help from './components/Help';
import Home from './components/Home';
import Login from './components/Login';
import MyListings from './components/MyListings';
import Payment from './components/Payment';
import ProductDetail from './components/ProductDetail';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import ToastContainer from './components/ToastContainer';
import UserPortal from './components/UserPortal';
import UserProfile from './components/UserProfile';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FeedbackProvider } from './context/FeedbackContext';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [refreshProducts, setRefreshProducts] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const handleShowAddProduct = () => {
    setCurrentView('addProduct');
  };

  const handleShowCart = () => {
    setCurrentView('cart');
  };

  const handleShowCategories = () => {
    setCurrentView('categories');
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  const handleShowUserPortal = () => {
    setCurrentView('userPortal');
  };

  const handleShowHelp = () => {
    setCurrentView('help');
  };

  const handleShowMyListings = () => {
    setCurrentView('myListings');
  };

  // Add this handler for payment
  const handleShowPayment = () => {
    setCurrentView('payment');
  };

  const handleShowProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('productDetail');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedProductId(null);
  };

  // Add handler to go back to cart from payment
  const handleBackToCart = () => {
    setCurrentView('cart');
  };

  const handleProductAdded = () => {
    // Trigger a refresh of the products list
    setRefreshProducts(prev => prev + 1);
    setCurrentView('home');
  };

  return (
    <AuthProvider>
      <FeedbackProvider>
        <CartProvider>
          <div className="App min-h-screen bg-gray-50">
            {currentView === 'home' && (
              <Home 
                onShowAddProduct={handleShowAddProduct} 
                onShowCart={handleShowCart}
                onShowCategories={handleShowCategories}
                onShowLogin={handleShowLogin}
                onShowProfile={handleShowProfile}
                onShowDashboard={handleShowUserPortal}
                onShowHelp={handleShowHelp}
                onShowProduct={handleShowProduct}
                refreshTrigger={refreshProducts} 
              />
            )}
            {currentView === 'login' && (
              <Login onBack={handleBackToHome} />
            )}
            {currentView === 'profile' && (
              <UserProfile 
                onBack={handleBackToHome}
                onShowMyListings={handleShowMyListings}
              />
            )}
            {currentView === 'userPortal' && (
              <UserPortal 
                onBack={handleBackToHome}
                onShowProduct={handleShowProduct}
                onShowHelp={handleShowHelp}
              />
            )}
            {currentView === 'help' && (
              <Help onBack={handleBackToHome} />
            )}
            {currentView === 'myListings' && (
              <MyListings 
                onBack={handleBackToHome}
                onShowProduct={handleShowProduct}
              />
            )}
            {currentView === 'myListings' && (
              <MyListings 
                onBack={handleBackToHome}
                onShowProduct={handleShowProduct}
              />
            )}
            {currentView === 'addProduct' && (
              <AddProduct 
                onBack={handleBackToHome} 
                onProductAdded={handleProductAdded}
              />
            )}
            {currentView === 'cart' && (
              <CartPage 
                onBack={handleBackToHome} 
                onCheckout={handleShowPayment} // Add this prop to CartPage
              />
            )}
            {/* Add the payment view */}
            {currentView === 'payment' && (
              <Payment onBack={handleBackToCart} />
            )}
            {currentView === 'categories' && (
              <Categories 
                onBack={handleBackToHome}
                onShowProduct={handleShowProduct}
              />
            )}
            {currentView === 'productDetail' && (
              <ProductDetail 
                productId={selectedProductId}
                onBack={handleBackToHome}
                onShowProduct={handleShowProduct}
              />
            )}
            
            {/* Real-time feedback components */}
            <ToastContainer />
            <SyncStatusIndicator />
          </div>
        </CartProvider>
      </FeedbackProvider>
    </AuthProvider>
  );
}

export default App;