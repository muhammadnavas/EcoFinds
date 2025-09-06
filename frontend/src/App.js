import { useState, useEffect } from 'react';
import './App.css';
import AddProduct from './components/AddProduct';
import CartPage from './components/CartPage';
import Categories from './components/Categories';
import Home from './components/Home';
import Login from './components/Login';
import { CartProvider } from './context/CartContext';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [refreshProducts, setRefreshProducts] = useState(0);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setCurrentView('home');
  };

  const handleShowAddProduct = () => {
    if (!isAuthenticated) {
      setCurrentView('login');
      return;
    }
    setCurrentView('addProduct');
  };

  const handleShowCart = () => {
    setCurrentView('cart');
  };

  const handleShowCategories = () => {
    setCurrentView('categories');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleProductAdded = () => {
    setRefreshProducts(prev => prev + 1);
    setCurrentView('home');
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="App min-h-screen bg-gray-50">
        {currentView === 'home' && (
          <Home 
            onShowAddProduct={handleShowAddProduct}
            onShowCart={handleShowCart}
            onShowCategories={handleShowCategories}
            onShowLogin={handleShowLogin}
            onLogout={handleLogout}
            user={user}
            isAuthenticated={isAuthenticated}
            refreshTrigger={refreshProducts}
          />
        )}
        {currentView === 'login' && (
          <Login onLogin={handleLogin} onBack={handleBackToHome} />
        )}
        {currentView === 'addProduct' && (
          <AddProduct 
            onBack={handleBackToHome}
            onProductAdded={handleProductAdded}
            user={user}
          />
        )}
        {currentView === 'cart' && (
          <CartPage onBack={handleBackToHome} />
        )}
        {currentView === 'categories' && (
          <Categories onBack={handleBackToHome} />
        )}
      </div>
    </CartProvider>
  );
}

export default App;