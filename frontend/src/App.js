import { useState } from 'react';
import './App.css';
import AddProduct from './components/AddProduct';
import CartPage from './components/CartPage';
import Categories from './components/Categories';
import Home from './components/Home';
import { CartProvider } from './context/CartContext';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [refreshProducts, setRefreshProducts] = useState(0);

  const handleShowAddProduct = () => {
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
    // Trigger a refresh of the products list
    setRefreshProducts(prev => prev + 1);
    setCurrentView('home');
  };

  return (
    <CartProvider>
      <div className="App min-h-screen bg-gray-50">
        {currentView === 'home' && (
          <Home 
            onShowAddProduct={handleShowAddProduct} 
            onShowCart={handleShowCart}
            onShowCategories={handleShowCategories}
            refreshTrigger={refreshProducts} 
          />
        )}
        {currentView === 'addProduct' && (
          <AddProduct 
            onBack={handleBackToHome} 
            onProductAdded={handleProductAdded}
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