import { useEffect, useState } from 'react';

const AdvancedSearchFilter = ({ 
  onFilterChange, 
  categories = [], 
  products = [],
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState({
    priceRange: { min: '', max: '' },
    category: 'all',
    condition: 'all',
    sortBy: 'newest',
    location: '',
    sellerRating: 'all',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceStats, setPriceStats] = useState({ min: 0, max: 1000 });

  // Calculate price statistics from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products
        .map(p => parseFloat(p.price) || 0)
        .filter(p => p > 0);
      
      if (prices.length > 0) {
        setPriceStats({
          min: Math.floor(Math.min(...prices)),
          max: Math.ceil(Math.max(...prices))
        });
      }
    }
  }, [products]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (type, value) => {
    const newPriceRange = { ...filters.priceRange, [type]: value };
    handleFilterChange('priceRange', newPriceRange);
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: { min: '', max: '' },
      category: 'all',
      condition: 'all',
      sortBy: 'newest',
      location: '',
      sellerRating: 'all'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const conditionOptions = [
    { value: 'all', label: 'Any Condition' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'Any Rating' },
    { value: '4+', label: '4+ Stars' },
    { value: '3+', label: '3+ Stars' },
    { value: '2+', label: '2+ Stars' },
    { value: '1+', label: '1+ Star' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Basic Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex-1 min-w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Toggle */}
        <div className="flex items-end">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={`Min (${priceStats.min})`}
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder={`Max (${priceStats.max})`}
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {conditionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Seller Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seller Rating</label>
              <select
                value={filters.sellerRating}
                onChange={(e) => handleFilterChange('sellerRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="City, State, or ZIP"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Price Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Price Filters</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Under $25', min: '', max: '25' },
                { label: '$25 - $50', min: '25', max: '50' },
                { label: '$50 - $100', min: '50', max: '100' },
                { label: '$100 - $250', min: '100', max: '250' },
                { label: 'Over $250', min: '250', max: '' }
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleFilterChange('priceRange', { min: range.min, max: range.max })}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.priceRange.min === range.min && filters.priceRange.max === range.max
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filters.category !== 'all' && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
            Category: {categories.find(c => c.id === filters.category)?.name}
            <button
              onClick={() => handleFilterChange('category', 'all')}
              className="hover:text-green-900"
            >
              ×
            </button>
          </span>
        )}
        {(filters.priceRange.min || filters.priceRange.max) && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
            Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
            <button
              onClick={() => handleFilterChange('priceRange', { min: '', max: '' })}
              className="hover:text-blue-900"
            >
              ×
            </button>
          </span>
        )}
        {filters.condition !== 'all' && (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
            Condition: {conditionOptions.find(c => c.value === filters.condition)?.label}
            <button
              onClick={() => handleFilterChange('condition', 'all')}
              className="hover:text-purple-900"
            >
              ×
            </button>
          </span>
        )}
        {filters.location && (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
            Location: {filters.location}
            <button
              onClick={() => handleFilterChange('location', '')}
              className="hover:text-orange-900"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearchFilter;