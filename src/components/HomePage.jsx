import React, { useState } from 'react';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Custom Icons (replacing lucide-react)
  const SearchIcon = () => (
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const CartIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
    </svg>
  );

  const UserIcon = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const PlusIcon = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

  const FilterIcon = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
    </svg>
  );

  const StarIcon = () => (
    <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  // Mock product data
  const [products] = useState([
    {
      id: 1,
      title: "Wireless Bluetooth Headphones",
      price: 89.99,
      category: "electronics",
      image: "🎧",
      rating: 4.5,
      seller: "TechStore"
    },
    {
      id: 2,
      title: "Organic Cotton T-Shirt",
      price: 29.99,
      category: "fashion",
      image: "👕",
      rating: 4.2,
      seller: "EcoFashion"
    },
    {
      id: 3,
      title: "Smart Fitness Tracker",
      price: 149.99,
      category: "electronics",
      image: "⌚",
      rating: 4.7,
      seller: "FitTech"
    },
    {
      id: 4,
      title: "Ceramic Coffee Mug Set",
      price: 24.99,
      category: "home",
      image: "☕",
      rating: 4.3,
      seller: "HomeGoods"
    },
    {
      id: 5,
      title: "LED Desk Lamp",
      price: 45.99,
      category: "home",
      image: "💡",
      rating: 4.4,
      seller: "LightCo"
    },
    {
      id: 6,
      title: "Running Sneakers",
      price: 79.99,
      category: "fashion",
      image: "👟",
      rating: 4.6,
      seller: "SportStyle"
    },
    {
      id: 7,
      title: "Smartphone Case",
      price: 19.99,
      category: "electronics",
      image: "📱",
      rating: 4.1,
      seller: "AccessoryHub"
    },
    {
      id: 8,
      title: "Kitchen Cutting Board",
      price: 34.99,
      category: "home",
      image: "🔪",
      rating: 4.8,
      seller: "KitchenPro"
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🏷️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'fashion', name: 'Fashion', icon: '👔' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleLogin = () => {
    setUser({ name: "John Doe", email: "john@example.com" });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">🛒 EcoFinds</div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-gray-700 hover:text-blue-600 font-medium">Home</button>
              <button className="text-gray-700 hover:text-blue-600 font-medium">Categories</button>
              <button className="text-gray-700 hover:text-blue-600 font-medium">Sell</button>
              <button className="text-gray-700 hover:text-blue-600 font-medium">Help</button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
                <CartIcon size={24} />
                {getTotalCartItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalCartItems()}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2">
                    <UserIcon size={20} />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <button 
                    onClick={handleLogin}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Login
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
              <button className="block text-gray-700 hover:text-blue-600 font-medium">Home</button>
              <button className="block text-gray-700 hover:text-blue-600 font-medium">Categories</button>
              <button className="block text-gray-700 hover:text-blue-600 font-medium">Sell</button>
              <button className="block text-gray-700 hover:text-blue-600 font-medium">Help</button>
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserIcon size={20} />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-gray-600 hover:text-blue-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button 
                      onClick={handleLogin}
                      className="block w-full text-left text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Login
                    </button>
                    <button className="block w-full text-left bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-blue-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Eco-Friendly Products
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Buy and sell sustainable products for a better tomorrow
          </p>
          
          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2">
              <PlusIcon size={20} />
              <span>Start Selling</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Browse Products
            </button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search for eco-friendly products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FilterIcon size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All Products' : 
             categories.find(cat => cat.id === selectedCategory)?.name}
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                {product.image}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  <div className="flex items-center space-x-1">
                    <StarIcon />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  by {product.seller}
                </p>
                
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-green-400 mb-4">🛒 EcoFinds</div>
              <p className="text-gray-400 mb-4">
                Your trusted marketplace for eco-friendly and sustainable products. 
                Connect with conscious sellers and buyers worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors">
                  f
                </div>
                <div className="w-8 h-8 bg-green-400 rounded flex items-center justify-center cursor-pointer hover:bg-green-500 transition-colors">
                  t
                </div>
                <div className="w-8 h-8 bg-green-700 rounded flex items-center justify-center cursor-pointer hover:bg-green-800 transition-colors">
                  in
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
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EcoFinds. All rights reserved. Built for Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;