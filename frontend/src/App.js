import { useState } from 'react';
import './App.css';
import AddProduct from './components/AddProduct';
import CartPage from './components/CartPage';
import Categories from './components/Categories';
import Home from './components/Home';
import Login from './components/Login';
import MyListings from './components/MyListings';
import ProductDetail from './components/ProductDetail';
import UserProfile from './components/UserProfile';
import Payment from './components/Payment'; // Add this import

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

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
      <CartProvider>
        <div className="App min-h-screen bg-gray-50">
          {currentView === 'home' && (
            <Home 
              onShowAddProduct={handleShowAddProduct} 
              onShowCart={handleShowCart}
              onShowCategories={handleShowCategories}
              onShowLogin={handleShowLogin}
              onShowProfile={handleShowProfile}
              onShowMyListings={handleShowMyListings}
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
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;