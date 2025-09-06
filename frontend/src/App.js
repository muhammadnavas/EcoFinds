import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { CartProvider } from './context/CartContext';
import AddProductPage from './pages/AddProductPage';
import CartPageWrapper from './pages/CartPageWrapper';
import CategoriesPage from './pages/CategoriesPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProductPage from './pages/ProductPage';

function App() {
  const refreshProducts = 0;

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage refreshTrigger={refreshProducts} />} />
              <Route path="product/:id" element={<ProductPage />} />
              <Route path="cart" element={<CartPageWrapper />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="add-product" element={<AddProductPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;