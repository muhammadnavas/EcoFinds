import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AddToCartButton from './AddToCartButton';
import CartButton from './CartButton';
import EnhancedSearch from './EnhancedSearch';
import HeaderLogo from './HeaderLogo';
import HelpWidget from './HelpWidget';

const Home = ({ 
  onShowAddProduct, 
  onShowCart, 
  onShowCategories, 
  onShowLogin,
  onShowProfile,
  onShowDashboard,
  onShowHelp,
  onShowProduct,
  refreshTrigger
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🏷️' },
    { id: 'Electronics', name: 'Electronics', icon: '📱' },
    { id: 'Fashion', name: 'Fashion', icon: '👔' },
    { id: 'Home & Garden', name: 'Home & Garden', icon: '🏠' },
    { id: 'Musical Instruments', name: 'Musical Instruments', icon: '🎵' },
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Books', name: 'Books', icon: '📚' },
    { id: 'Toys', name: 'Toys', icon: '🧸' },
  ];

  // Custom Icons
  const UserIcon = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const MenuIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  const XIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const StarIcon = () => (
    <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async (searchParams = {}) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (searchParams.search) {
        queryParams.append('search', searchParams.search);
      }
      if (searchParams.category && searchParams.category !== 'all') {
        queryParams.append('category', searchParams.category);
      }
      if (searchParams.minPrice) {
        queryParams.append('minPrice', searchParams.minPrice);
      }
      if (searchParams.maxPrice) {
        queryParams.append('maxPrice', searchParams.maxPrice);
      }
      if (searchParams.sortBy) {
        queryParams.append('sortBy', searchParams.sortBy);
      }
      if (searchParams.sortOrder) {
        queryParams.append('sortOrder', searchParams.sortOrder);
      }
      
      const url = `${apiUrl}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        // Handle new API response format
        if (data.success) {
          setProducts(data.data || []);
        } else {
          // Fallback for old format
          setProducts(data.products || []);
        }
      } else {
        console.error('Failed to fetch products:', response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  // Enhanced search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchProducts({
      search: query,
      category: selectedCategory
    });
  };

  // Category change handler
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchProducts({
      search: searchQuery,
      category: category
    });
  };

  const handleLogoutClick = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Handle product deletion
  const handleProductDeleted = (deletedProductId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product._id !== deletedProductId)
    );
  };

  const ProductCard = ({ product, onShowProduct, onProductDeleted }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleProductClick = (e) => {
      // Don't navigate if clicking on the add to cart button or delete button
      if (e.target.closest('.add-to-cart-button') || e.target.closest('.delete-product-button')) {
        return;
      }
      if (onShowProduct) {
        onShowProduct(product._id);
      }
    };

    const handleDeleteProduct = async (e) => {
      e.stopPropagation();
      
      if (!isAuthenticated || !user) {
        alert('You must be logged in to delete products');
        return;
      }

      // Check if user is the owner of the product
      const isOwner = product.seller?._id === user._id || 
                     product.seller?.username === user.username ||
                     product.sellerName === user.username;

      if (!isOwner) {
        alert('You can only delete your own products');
        return;
      }

      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
      );

      if (!confirmDelete) return;

      try {
        setDeleting(true);
        const response = await fetch(`http://localhost:5000/api/products/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          alert('Product deleted successfully!');
          if (onProductDeleted) {
            onProductDeleted(product._id);
          }
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      } finally {
        setDeleting(false);
      }
    };

    // Check if current user owns this product
    const isOwner = isAuthenticated && user && (
      product.seller?._id === user._id || 
      product.seller?.username === user.username ||
      product.sellerName === user.username
    );

    return (
      <div 
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer relative"
        onClick={handleProductClick}
      >
        {/* Delete button for product owners */}
        {isOwner && (
          <div className="absolute top-2 right-2 z-10 delete-product-button">
            <button
              onClick={handleDeleteProduct}
              disabled={deleting}
              className={`p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors ${
                deleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Delete Product"
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        )}

        <div className="relative w-full h-48 bg-gray-200">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image'}
            alt={product.title}
            className={`w-full h-full object-cover transition-opacity duration-300 hover:scale-105 transition-transform ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true);
              setImageLoaded(true);
              e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Image+Not+Found';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1 hover:text-green-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              ₹{(parseFloat(product.price) * 83).toLocaleString('en-IN')}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs">👤</span>
            </div>
            <span>by {product.sellerName || product.seller?.username || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-1">
              <StarIcon />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
            <div className="add-to-cart-button">
              <AddToCartButton product={product} size="small" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <div className="flex items-center">
              <HeaderLogo />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-gray-700 hover:text-green-600 font-medium text-lg">Home</button>
              <button 
                onClick={onShowCategories}
                className="text-gray-700 hover:text-green-600 font-medium text-lg"
              >
                Categories
              </button>
              <button 
                onClick={onShowAddProduct}
                className="text-gray-700 hover:text-green-600 font-medium text-lg"
              >
                Sell
              </button>
              <button 
                onClick={onShowHelp}
                className="text-gray-700 hover:text-green-600 font-medium text-lg"
              >
                Help
              </button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {/* Cart */}
              <CartButton onShowCart={onShowCart} />

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={onShowDashboard}
                    className="flex items-center space-x-2 bg-green-100 text-green-700 rounded-full px-4 py-3 hover:bg-green-200 transition-colors text-base"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <span className="font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={onShowProfile}
                    className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-3 hover:bg-gray-200 transition-colors text-base"
                  >
                    <UserIcon size={24} />
                    <span className="font-medium">{user.username || user.name}</span>
                  </button>
                  <button 
                    onClick={handleLogoutClick}
                    className="text-base text-gray-600 hover:text-green-600 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <button 
                    onClick={onShowLogin}
                    className="text-green-600 hover:text-green-700 font-medium transition-colors text-lg"
                  >
                    Login
                  </button>
                  <button 
                    onClick={onShowLogin}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-3"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-6 space-y-6">
              <button className="block text-gray-700 hover:text-green-600 font-medium text-lg">Home</button>
              <button 
                onClick={() => {
                  onShowCategories();
                  setIsMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-green-600 font-medium text-lg"
              >
                Categories
              </button>
              <button 
                onClick={() => {
                  onShowAddProduct();
                  setIsMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-green-600 font-medium text-lg"
              >
                Sell
              </button>
              <button 
                onClick={() => {
                  onShowHelp();
                  setIsMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-green-600 font-medium text-lg"
              >
                Help
              </button>
              <div className="pt-4 border-t">
                {isAuthenticated && user ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        onShowDashboard();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full text-left hover:text-green-600 transition-colors text-lg"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      <span className="font-medium">Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        onShowProfile();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full text-left hover:text-green-600 transition-colors text-lg"
                    >
                      <UserIcon size={24} />
                      <span className="font-medium">{user.username || user.name}</span>
                    </button>
                    <button 
                      onClick={handleLogoutClick}
                      className="text-base text-gray-600 hover:text-green-600 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        onShowLogin();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-green-600 hover:text-green-700 font-medium text-lg"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => {
                        onShowLogin();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-br from-green-600 via-blue-600 to-green-800 rounded-2xl text-white p-8 mb-8 relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isAuthenticated ? `Welcome back, ${user?.username || user?.name}! 👋` : 'Discover Eco-Friendly Products 🌟'}
            </h2>
            <p className="text-lg opacity-90 mb-6">
              {isAuthenticated 
                ? 'Ready to find your next sustainable purchase or list something new?'
                : 'Buy and sell sustainable products for a better tomorrow. Every purchase makes a difference!'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onShowAddProduct}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                + Start Selling
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
                Browse Products
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <EnhancedSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            categories={categories}
            products={products}
            onSearch={handleSearch}
          />
        </div>

        {/* Product Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">
              {searchQuery || selectedCategory !== 'all' 
                ? `Showing ${products.length} result(s)`
                : 'Latest Products'
              }
            </h3>
            <div className="text-sm text-gray-500">
              {products.length} products found
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onShowProduct={onShowProduct} 
                onProductDeleted={handleProductDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or category filter
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Show All Products
            </button>
          </div>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center mr-2 p-1">
                  <svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    {/* Green leaf */}
                    <path d="M9.6 24 Q24 9.6 38.4 24 Q24 14.4 9.6 24" fill="#22c55e" />
                    {/* Purple leaf overlay */}
                    <path d="M19.2 24 Q33.6 9.6 38.4 24 Q31.2 14.4 19.2 24" fill="#8b5cf6" />
                    {/* Base arch - green */}
                    <path d="M4.8 28.8 Q14.4 19.2 24 28.8 Q33.6 19.2 43.2 28.8 Q33.6 33.6 24 28.8 Q14.4 33.6 4.8 28.8" fill="#16a34a" />
                    {/* Base arch - purple */}
                    <path d="M9.6 33.6 Q19.2 24 28.8 33.6 Q38.4 24 43.2 33.6 Q38.4 38.4 28.8 33.6 Q19.2 38.4 9.6 33.6" fill="#7c3aed" />
                  </svg>
                </div>
                <span className="text-xl font-bold">EcoFinds</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted marketplace for eco-friendly and sustainable products. 
                Connect with conscious sellers and buyers worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors">
                  📘
                </div>
                <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                  🐦
                </div>
                <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors">
                  💼
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">About Us</button></li>
                <li><button className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={onShowHelp} className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">Electronics</button></li>
                <li><button className="hover:text-white transition-colors">Fashion</button></li>
                <li><button className="hover:text-white transition-colors">Home & Garden</button></li>
                <li><button className="hover:text-white transition-colors">All Categories</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <div className="flex justify-center space-x-8 text-sm mb-4">
              <span>♻️ Eco-Friendly</span>
              <span>🛡️ Secure Trading</span>
              <span>🤝 Community Driven</span>
              <span>💚 Sustainable Living</span>
            </div>
            <p className="text-gray-400">&copy; 2025 EcoFinds. All rights reserved. Built for sustainability.</p>
          </div>
        </div>
      </footer>

      {/* Floating Help Widget */}
      <HelpWidget onShowHelp={onShowHelp} />
    </div>
  );
};

export default Home;