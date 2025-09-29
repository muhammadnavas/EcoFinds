import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AddToCartButton from './AddToCartButton';
import AdvancedFilters from './AdvancedFilters';
import CartButton from './CartButton';
import CompareButton from './CompareButton';
import EnhancedSearch from './EnhancedSearch';
import HeaderLogo from './HeaderLogo';
import HelpWidget from './HelpWidget';
import QuickViewModal from './QuickViewModal';
import TouchOptimizedCard from './TouchOptimizedCard';
import WishlistIndicator from './WishlistIndicator';

const Home = ({ 
  onShowAddProduct, 
  onShowCart, 
  onShowCategories, 
  onShowLogin,
  onShowProfile,
  onShowDashboard,
  onShowHelp,
  onShowWishlist,
  onShowProduct,
  refreshTrigger
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    condition: 'all',
    location: '',
    sortBy: 'newest',
    availability: 'all',
    rating: 0
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [quickViewProductId, setQuickViewProductId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

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

  // Filter change handler
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply filters to products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply price range filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
    }

    // Apply condition filter
    if (filters.condition !== 'all') {
      filtered = filtered.filter(product => 
        (product.condition || 'good').toLowerCase() === filters.condition.toLowerCase()
      );
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(product => 
        (product.location || '').toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => (product.rating || 4.2) >= filters.rating);
    }

    // Apply availability filter
    if (filters.availability !== 'all') {
      if (filters.availability === 'available') {
        filtered = filtered.filter(product => product.stock > 0);
      } else if (filters.availability === 'out-of-stock') {
        filtered = filtered.filter(product => product.stock === 0);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'name-az':
          return a.title.localeCompare(b.title);
        case 'name-za':
          return b.title.localeCompare(a.title);
        case 'rating':
          return (b.rating || 4.2) - (a.rating || 4.2);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, filters]);

  // Quick view handlers
  const handleQuickView = (productId) => {
    setQuickViewProductId(productId);
  };

  const closeQuickView = () => {
    setQuickViewProductId(null);
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
    const [isHovered, setIsHovered] = useState(false);

    const handleProductClick = (e) => {
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

    const isOwner = isAuthenticated && user && (
      product.seller?._id === user._id || 
      product.seller?.username === user.username ||
      product.sellerName === user.username
    );

    return (
      <div 
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer relative group border border-gray-100"
        onClick={handleProductClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Enhanced Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isOwner && (
            <button
              onClick={handleDeleteProduct}
              disabled={deleting}
              className={`p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 delete-product-button ${
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
          )}
          
          {/* Wishlist Button */}
          <button
            className="p-2 bg-white hover:bg-pink-50 text-gray-600 hover:text-pink-500 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Add to Wishlist"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickView(product._id);
            }}
            className="p-2 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-500 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Quick View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        {/* Enhanced Status Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            ✓ Verified
          </span>
          {product.condition && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
              {product.condition}
            </span>
          )}
        </div>

        {/* Enhanced Image Section */}
        <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-green-600"></div>
            </div>
          )}
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image'}
            alt={product.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageError(true);
              setImageLoaded(true);
              e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Image+Not+Found';
            }}
          />
          
          {/* Overlay on Hover */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? 'opacity-20' : 'opacity-0'
          }`}></div>
        </div>

        {/* Enhanced Content Section */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-800 line-clamp-2 hover:text-green-600 transition-colors leading-tight flex-1">
              {product.title}
            </h3>
            <div className="ml-2 flex items-center text-yellow-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <span className="text-sm text-gray-600 ml-1">4.8</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Enhanced Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">
                ₹{(parseFloat(product.price) * 83).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{(parseFloat(product.price) * 83 * 1.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
              17% OFF
            </span>
          </div>

          {/* Enhanced Category and Seller Info */}
          <div className="flex items-center justify-between mb-4">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">
                  {(product.sellerName || product.seller?.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">
                {product.sellerName || product.seller?.username || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Enhanced Action Section */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
            <div className="flex-1 add-to-cart-button">
              <AddToCartButton product={product} size="small" />
            </div>
            <CompareButton productId={product._id} size="small" />
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
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
              {/* Wishlist */}
              <WishlistIndicator onShowWishlist={onShowWishlist} />
              
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

        {/* Advanced Filters */}
        <AdvancedFilters
          onFiltersChange={handleFiltersChange}
          categories={categories}
          products={products}
          className="mb-8"
        />

        {/* Product Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">
              {searchQuery || selectedCategory !== 'all' 
                ? `Showing ${filteredProducts.length} result(s)`
                : 'Latest Products'
              }
            </h3>
            <div className="text-sm text-gray-500">
              {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <TouchOptimizedCard 
                key={product._id} 
                product={product} 
                onShowProduct={onShowProduct} 
                onProductDeleted={handleProductDeleted}
                onQuickView={(productId) => setQuickViewProductId(productId)}
                isMobile={isMobile}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter settings
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilters({
                  priceRange: [0, 10000],
                  condition: 'all',
                  location: '',
                  sortBy: 'newest',
                  availability: 'all',
                  rating: 0
                });
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
                  <img 
                    src="/logo.png" 
                    alt="EcoFinds Logo" 
                    width="24" 
                    height="24" 
                    style={{ objectFit: 'contain' }}
                  />
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

      {/* Quick View Modal */}
      {quickViewProductId && (
        <QuickViewModal
          productId={quickViewProductId}
          onClose={closeQuickView}
          onShowFullProduct={(productId) => {
            closeQuickView();
            onShowProduct(productId);
          }}
        />
      )}
    </div>
  );
};

export default Home;




