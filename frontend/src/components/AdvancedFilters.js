import { useState } from 'react';

const AdvancedFilters = ({ 
  onFiltersChange, 
  categories, 
  products = [],
  className = '' 
}) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 10000], // Default price range in USD
    condition: 'all',
    location: '',
    sortBy: 'newest',
    availability: 'all',
    rating: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const [priceRangeInput, setPriceRangeInput] = useState([0, 10000]);

  // Available filter options
  const conditions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'used', label: 'Used' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'name-za', label: 'Name: Z to A' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'available', label: 'Available Only' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  // Get unique locations from products
  const locations = [
    ...new Set(products.map(product => product.location).filter(Boolean))
  ].sort();

  // Update filters and notify parent
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    updateFilters(newFilters);
  };

  // Handle price range change
  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRangeInput];
    newRange[index] = parseInt(value) || 0;
    
    // Ensure min <= max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    setPriceRangeInput(newRange);
    handleFilterChange('priceRange', newRange);
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters = {
      priceRange: [0, 10000],
      condition: 'all',
      location: '',
      sortBy: 'newest',
      availability: 'all',
      rating: 0
    };
    setPriceRangeInput([0, 10000]);
    updateFilters(defaultFilters);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.condition !== 'all') count++;
    if (filters.location !== '') count++;
    if (filters.availability !== 'all') count++;
    if (filters.rating > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Filter Toggle Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <span className="text-sm font-medium">
                {showFilters ? 'Hide' : 'Show'} Filters
              </span>
              <svg 
                className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Content */}
      {showFilters && (
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {conditions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {availabilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range (USD)
            </label>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={priceRangeInput[0]}
                  onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={priceRangeInput[1]}
                  onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="10000"
                />
              </div>
            </div>
            
            {/* Price Range Slider */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="10000"
                step="50"
                value={priceRangeInput[0]}
                onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="50"
                value={priceRangeInput[1]}
                onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>$10,000</span>
              </div>
            </div>
          </div>

          {/* Location */}
          {locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange('rating', filters.rating === rating ? 0 : rating)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-colors ${
                    filters.rating >= rating
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm">{rating}+</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {filters.condition !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {conditions.find(c => c.value === filters.condition)?.label}
                <button
                  onClick={() => handleFilterChange('condition', 'all')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filters.location}
                <button
                  onClick={() => handleFilterChange('location', '')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.rating > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.rating}+ Stars
                <button
                  onClick={() => handleFilterChange('rating', 0)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
                <button
                  onClick={() => {
                    setPriceRangeInput([0, 10000]);
                    handleFilterChange('priceRange', [0, 10000]);
                  }}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;