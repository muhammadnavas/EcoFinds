import { useEffect, useRef, useState } from 'react';

const EnhancedSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  categories, 
  products = [],
  onSearch 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    'iPhone', 'laptop', 'vintage', 'books', 'guitar', 'camera', 
    'furniture', 'clothes', 'shoes', 'electronics'
  ]);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ecofinds-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (searchQuery.length > 0) {
      const productSuggestions = products
        .filter(product => 
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map(product => ({
          type: 'product',
          text: product.title,
          category: product.category,
          price: product.price
        }));

      const categorySuggestions = categories
        .filter(cat => 
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          cat.id !== 'all'
        )
        .slice(0, 3)
        .map(cat => ({
          type: 'category',
          text: cat.name,
          icon: cat.icon
        }));

      const keywordSuggestions = popularSearches
        .filter(term => 
          term.toLowerCase().includes(searchQuery.toLowerCase()) &&
          term.toLowerCase() !== searchQuery.toLowerCase()
        )
        .slice(0, 3)
        .map(term => ({
          type: 'keyword',
          text: term
        }));

      setSuggestions([...productSuggestions, ...categorySuggestions, ...keywordSuggestions]);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products, categories, popularSearches]);

  // Handle search submission
  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      // Add to recent searches
      const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('ecofinds-recent-searches', JSON.stringify(newRecentSearches));
      
      setSearchQuery(query);
      setShowSuggestions(false);
      
      if (onSearch) {
        onSearch(query);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'category') {
      setSelectedCategory(categories.find(cat => cat.name === suggestion.text)?.id || 'all');
      setSearchQuery('');
    } else {
      handleSearch(suggestion.text);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="flex">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-l-lg px-4 py-3 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[140px]"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search for products, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full px-4 py-3 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            className="bg-green-600 text-white px-6 py-3 rounded-r-lg hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0) && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {suggestion.type === 'product' && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                      {suggestion.type === 'category' && (
                        <span className="text-lg">{suggestion.icon}</span>
                      )}
                      {suggestion.type === 'keyword' && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.type === 'product' && (
                        <div className="text-xs text-gray-500">
                          {suggestion.category} • ₹{(suggestion.price * 83).toLocaleString('en-IN')}
                        </div>
                      )}
                      {suggestion.type === 'category' && (
                        <div className="text-xs text-gray-500">Category</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Recent Searches</h4>
                <button
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('ecofinds-recent-searches');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-3"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-800">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {searchQuery.length === 0 && (
            <div className="p-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Searches</h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.slice(0, 6).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
