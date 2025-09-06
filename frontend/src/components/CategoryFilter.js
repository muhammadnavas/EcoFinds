import { useEffect, useState } from 'react';

const CategoryFilter = ({ 
  selectedCategory,
  onCategoryChange,
  layout = 'dropdown', // 'dropdown', 'pills', 'sidebar'
  className = '',
  showCounts = true,
  placeholder = 'Select category...'
}) => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Default categories
  const defaultCategories = [
    { name: 'All Items', slug: 'all', icon: '🌿', color: '#059669', productCount: 0 },
    { name: 'Electronics', slug: 'electronics', icon: '📱', color: '#3B82F6', productCount: 0 },
    { name: 'Clothing', slug: 'clothing', icon: '👔', color: '#EC4899', productCount: 0 },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏠', color: '#10B981', productCount: 0 },
    { name: 'Sports', slug: 'sports', icon: '⚽', color: '#F59E0B', productCount: 0 },
    { name: 'Books', slug: 'books', icon: '📚', color: '#8B5CF6', productCount: 0 },
    { name: 'Toys', slug: 'toys', icon: '🧸', color: '#F472B6', productCount: 0 },
    { name: 'Automotive', slug: 'automotive', icon: '🚗', color: '#6B7280', productCount: 0 },
    { name: 'Beauty', slug: 'beauty', icon: '💄', color: '#EF4444', productCount: 0 }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/categories');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const allCategories = [
            { name: 'All Items', slug: 'all', icon: '🌿', color: '#059669', 
              productCount: data.data.reduce((sum, cat) => sum + (cat.productCount || 0), 0) },
            ...data.data
          ];
          setCategories(allCategories);
        } else {
          setCategories(defaultCategories);
        }
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCategoryData = () => {
    return categories.find(cat => cat.slug === selectedCategory) || categories[0];
  };

  const handleCategorySelect = (category) => {
    if (onCategoryChange) {
      onCategoryChange(category.slug);
    }
    setIsOpen(false);
  };

  // Dropdown Layout
  const renderDropdown = () => (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        disabled={loading}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
            ) : (
              <>
                <span className="text-lg">{getSelectedCategoryData()?.icon}</span>
                <span className="font-medium text-gray-900">
                  {getSelectedCategoryData()?.name || placeholder}
                </span>
                {showCounts && getSelectedCategoryData()?.productCount !== undefined && (
                  <span className="text-sm text-gray-500">
                    ({getSelectedCategoryData().productCount})
                  </span>
                )}
              </>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategorySelect(category)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                selectedCategory === category.slug ? 'bg-green-50 text-green-700' : 'text-gray-900'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="flex-1 font-medium">{category.name}</span>
              {showCounts && category.productCount !== undefined && (
                <span className="text-sm text-gray-500">
                  ({category.productCount})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Pills Layout
  const renderPills = () => (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      ) : (
        categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => handleCategorySelect(category)}
            className={`
              inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 hover:scale-105
              ${selectedCategory === category.slug
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            {showCounts && category.productCount !== undefined && (
              <span className={`text-xs ${selectedCategory === category.slug ? 'text-green-100' : 'text-gray-500'}`}>
                ({category.productCount})
              </span>
            )}
          </button>
        ))
      )}
    </div>
  );

  // Sidebar Layout
  const renderSidebar = () => (
    <div className={`space-y-1 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      {loading ? (
        <div className="flex items-center space-x-2 p-3">
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      ) : (
        categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => handleCategorySelect(category)}
            className={`
              w-full flex items-center justify-between p-3 rounded-lg text-left
              transition-all duration-200 hover:bg-gray-50
              ${selectedCategory === category.slug
                ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                : 'text-gray-700 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </div>
            {showCounts && category.productCount !== undefined && (
              <span className={`text-sm ${selectedCategory === category.slug ? 'text-green-600' : 'text-gray-500'}`}>
                {category.productCount}
              </span>
            )}
          </button>
        ))
      )}
    </div>
  );

  // Render based on layout
  switch (layout) {
    case 'pills':
      return renderPills();
    case 'sidebar':
      return renderSidebar();
    case 'dropdown':
    default:
      return renderDropdown();
  }
};

export default CategoryFilter;
