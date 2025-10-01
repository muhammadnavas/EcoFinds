import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ComparisonProvider, useComparison } from './context/ComparisonContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { NotificationProvider } from './context/NotificationContext';
import { WishlistProvider } from './context/WishlistContext';

// Pages
import AddProductPage from './pages/AddProductPage';
import CartPageWrapper from './pages/CartPageWrapper';
import CategoriesPage from './pages/CategoriesPage';
import HelpPage from './pages/HelpPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProductPage from './pages/ProductPage';
import SellPage from './pages/SellPage';

// Components
import ComparisonIndicator from './components/ComparisonIndicator';
import Layout from './components/Layout';
import Login from './components/Login';
import MyListings from './components/MyListings';
import Payment from './components/Payment';
import ProductComparison from './components/ProductComparison';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import ToastContainer from './components/ToastContainer';
import UserPortal from './components/UserPortal';
import UserProfile from './components/UserProfile';
import Wishlist from './components/Wishlist';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <FeedbackProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <ComparisonProvider>
                <Router>
                  <div className="App min-h-screen bg-gray-50">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Layout><HomePage /></Layout>} />
                      <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
                      <Route path="/category/:categoryName" element={<Layout><CategoriesPage /></Layout>} />
                      <Route path="/product/:id" element={<Layout><ProductPage /></Layout>} />
                      <Route path="/help" element={<Layout><HelpPage /></Layout>} />
                      <Route path="/login" element={<Login />} />
                      
                      {/* Protected Routes - require authentication */}
                      <Route path="/sell" element={
                        <ProtectedRoute>
                          <Layout><SellPage /></Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/add-product" element={
                        <ProtectedRoute>
                          <Layout><AddProductPage /></Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/cart" element={<Layout><CartPageWrapper /></Layout>} />
                      <Route path="/payment" element={
                        <ProtectedRoute>
                          <Layout><Payment /></Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Layout><UserProfile /></Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Layout><UserPortal /></Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/my-listings" element={
                        <ProtectedRoute>
                          <Layout><MyListings /></Layout>
                        </ProtectedRoute>
                      } />
                      <Route path="/wishlist" element={
                        <ProtectedRoute>
                          <Layout><Wishlist /></Layout>
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch all route - 404 */}
                      <Route path="/404" element={<Layout><NotFoundPage /></Layout>} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                    
                    {/* Global UI Components */}
                    <ComparisonWrapper />
                    <ToastContainer />
                    <SyncStatusIndicator />
                  </div>
                </Router>
              </ComparisonProvider>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </FeedbackProvider>
    </AuthProvider>
  );
}

// Wrapper to use comparison context and render indicator/modal
function ComparisonWrapper() {
  const {
    isComparisonViewOpen,
    products,
    productDetails,
    toggleComparisonView,
    clearComparison
  } = useComparison();

  return (
    <>
      <ComparisonIndicator />
      {isComparisonViewOpen && (
        <ProductComparison
          onClose={toggleComparisonView}
          comparedProducts={products}
          productDetails={productDetails}
          onClearComparison={clearComparison}
        />
      )}
    </>
  );
}

export default App;