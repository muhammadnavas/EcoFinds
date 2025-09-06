import { useEffect, useState } from 'react';
import AddToCartButton from './AddToCartButton';
import CartButton from './CartButton';

const Home = ({ onShowAddProduct, onShowCart, onShowCategories, refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  const fetchProducts = async () => {
    try {
      const apiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/products';
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogin = () => {
    setUser({ name: "John Doe", email: "john@example.com" });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
  };

  const ProductCard = ({ product }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative w-full h-48 bg-gray-200">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image'}
            alt={product.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
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
          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">
            {product.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              ${product.price}
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
            <AddToCartButton product={product} size="small" />
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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-green-600 rounded-lg w-10 h-10 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">🌱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">EcoFinds</h1>
                <p className="text-xs text-gray-500 -mt-1">Sustainable Marketplace</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-gray-700 hover:text-green-600 font-medium">Home</button>
              <button 
                onClick={onShowCategories}
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Categories
              </button>
              <button 
                onClick={onShowAddProduct}
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Sell
              </button>
              <button className="text-gray-700 hover:text-green-600 font-medium">Help</button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <CartButton onShowCart={onShowCart} />

              {/* User Menu */}
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
                    <UserIcon size={20} />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-green-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <button 
                    onClick={handleLogin}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Login
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <button className="block text-gray-700 hover:text-green-600 font-medium">Home</button>
              <button 
                onClick={() => {
                  onShowCategories();
                  setIsMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-green-600 font-medium"
              >
                Categories
              </button>
              <button 
                onClick={() => {
                  onShowAddProduct();
                  setIsMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-green-600 font-medium"
              >
                Sell
              </button>
              <button className="block text-gray-700 hover:text-green-600 font-medium">Help</button>
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon size={20} />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-green-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={handleLogin}
                      className="block w-full text-left text-green-600 hover:text-green-700 font-medium"
                    >
                      Login
                    </button>
                    <button className="block w-full text-left bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
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
              Discover Eco-Friendly Products 🌟
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Buy and sell sustainable products for a better tomorrow. 
              Every purchase makes a difference!
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

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
                <div className="absolute left-3 top-3.5">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

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
              {filteredProducts.length} products found
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
              <ProductCard key={product._id} product={product} />
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
                <div className="bg-green-600 rounded-lg w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-white">🌱</span>
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
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
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
    </div>
  );
};

export default Home;