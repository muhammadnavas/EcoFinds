import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from '../components/AddToCartButton';
import AdvancedFilters from '../components/AdvancedFilters';
import CartButton from '../components/CartButton';
import CompareButton from '../components/CompareButton';
import EnhancedSearch from '../components/EnhancedSearch';
import HeaderLogo from '../components/HeaderLogo';
import HelpWidget from '../components/HelpWidget';
import QuickViewModal from '../components/QuickViewModal';
import TouchOptimizedCard from '../components/TouchOptimizedCard';
import WishlistIndicator from '../components/WishlistIndicator';
import { useAuth } from '../context/AuthContext';

const HomePage = ({ refreshTrigger }) => {
  const navigate = useNavigate();
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
    { id: 'Automotive', name: 'Automotive', icon: '🚗' },
    { id: 'Health & Beauty', name: 'Health & Beauty', icon: '💄' },
    { id: 'Toys & Games', name: 'Toys & Games', icon: '🎮' },
    { id: 'Art & Collectibles', name: 'Art & Collectibles', icon: '🎨' },
    { id: 'Pet Supplies', name: 'Pet Supplies', icon: '🐕' }
  ];

  // Navigation handlers
  const handleShowAddProduct = () => navigate('/sell');
  const handleShowCart = () => navigate('/cart');
  const handleShowCategories = () => navigate('/categories');
  const handleShowLogin = () => navigate('/login');
  const handleShowProfile = () => navigate('/profile');
  const handleShowDashboard = () => navigate('/dashboard');
  const handleShowHelp = () => navigate('/help');
  const handleShowWishlist = () => navigate('/wishlist');
  const handleShowProduct = (productId) => navigate(`/product/${productId}`);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Advanced filters
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      const inPriceRange = price >= filters.priceRange[0] && price <= filters.priceRange[1];
      const matchesCondition = filters.condition === 'all' || product.condition === filters.condition;
      const matchesLocation = !filters.location || product.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesAvailability = filters.availability === 'all' || 
        (filters.availability === 'available' && product.quantity > 0) ||
        (filters.availability === 'sold' && product.quantity === 0);
      const matchesRating = !filters.rating || (product.rating && product.rating >= filters.rating);

      return inPriceRange && matchesCondition && matchesLocation && matchesAvailability && matchesRating;
    });

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const StarIcon = ({ filled }) => (
    <svg className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} filled={true} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} filled={true} />);
      } else {
        stars.push(<StarIcon key={i} filled={false} />);
      }
    }
    return stars;
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={product.name}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => handleShowProduct(product._id)}
        />
        <WishlistIndicator productId={product._id} />
        <div className="absolute top-2 right-2">
          <CompareButton product={product} />
        </div>
        {product.condition && (
          <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
            product.condition === 'new' ? 'bg-green-100 text-green-800' :
            product.condition === 'like-new' ? 'bg-blue-100 text-blue-800' :
            product.condition === 'good' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {product.condition}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2"
            onClick={() => handleShowProduct(product._id)}
          >
            {product.name}
          </h3>
          <span className="text-lg font-bold text-green-600">${product.price}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Category: {product.category}</span>
          {product.rating && (
            <div className="flex items-center">
              <div className="flex mr-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-600">({product.rating})</span>
            </div>
          )}
        </div>
        
        {product.location && (
          <p className="text-sm text-gray-500 mb-3">📍 {product.location}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AddToCartButton 
              product={product}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            />
            <button
              onClick={() => setQuickViewProductId(product._id)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Quick View
            </button>
          </div>
        </div>
        
        {product.seller && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Sold by: <span className="font-medium">{product.seller}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <HeaderLogo />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => handleShowCategories()}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Categories
              </button>
              <button 
                onClick={() => handleShowHelp()}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Help
              </button>
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <CartButton onClick={handleShowCart} />
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleShowAddProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sell Item
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    </button>
                    
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                        <div className="p-3 border-b">
                          <p className="font-medium text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleShowProfile();
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              handleShowDashboard();
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Dashboard
                          </button>
                          <button
                            onClick={() => {
                              handleShowWishlist();
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Wishlist
                          </button>
                        </div>
                        <div className="border-t py-1">
                          <button
                            onClick={() => {
                              logout();
                              setIsMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleShowLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-sm">
          <div className="px-4 py-2 space-y-2">
            <button 
              onClick={() => { handleShowCategories(); setIsMenuOpen(false); }}
              className="block w-full text-left py-2 text-gray-700 hover:text-blue-600"
            >
              Categories
            </button>
            <button 
              onClick={() => { handleShowHelp(); setIsMenuOpen(false); }}
              className="block w-full text-left py-2 text-gray-700 hover:text-blue-600"
            >
              Help
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to EcoFinds
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing products from local sellers and contribute to a sustainable marketplace.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <EnhancedSearch 
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
                categories={categories}
              />
            </div>
            
            {/* Advanced Filters */}
            <div className="lg:w-80">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                categories={categories}
              />
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            isMobile ? (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <TouchOptimizedCard
                    key={product._id}
                    product={product}
                    onViewProduct={handleShowProduct}
                    onQuickView={setQuickViewProductId}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or browse different categories.
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Quick View Modal */}
      {quickViewProductId && (
        <QuickViewModal
          productId={quickViewProductId}
          onClose={() => setQuickViewProductId(null)}
          onViewProduct={handleShowProduct}
        />
      )}

      {/* Help Widget */}
      <HelpWidget onShowHelp={handleShowHelp} />
    </div>
  );
};

export default HomePage;
