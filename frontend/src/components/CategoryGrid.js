import { useEffect, useState } from 'react';
import CategoryCard from './CategoryCard';

const CategoryGrid = ({ 
  selectedCategory,
  onCategoryChange,
  className = '',
  showAllOption = true,
  gridCols = 'auto',
  cardSize = 'medium',
  showProductCounts = true
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default categories with eco-friendly themes
  const defaultCategories = [
    { 
      name: 'Electronics', 
      icon: '📱', 
      color: '#3B82F6',
      slug: 'electronics',
      productCount: 0,
      description: 'Phones, laptops, and gadgets'
    },
    { 
      name: 'Clothing', 
      icon: '👔', 
      color: '#EC4899',
      slug: 'clothing',
      productCount: 0,
      description: 'Fashion and apparel'
    },
    { 
      name: 'Home & Garden', 
      icon: '🏠', 
      color: '#10B981',
      slug: 'home-garden',
      productCount: 0,
      description: 'Furniture and home decor'
    },
    { 
      name: 'Sports', 
      icon: '⚽', 
      color: '#F59E0B',
      slug: 'sports',
      productCount: 0,
      description: 'Sports equipment and gear'
    },
    { 
      name: 'Books', 
      icon: '📚', 
      color: '#8B5CF6',
      slug: 'books',
      productCount: 0,
      description: 'Books and educational materials'
    },
    { 
      name: 'Toys', 
      icon: '🧸', 
      color: '#F472B6',
      slug: 'toys',
      productCount: 0,
      description: 'Toys and games for all ages'
    },
    { 
      name: 'Automotive', 
      icon: '🚗', 
      color: '#6B7280',
      slug: 'automotive',
      productCount: 0,
      description: 'Car parts and accessories'
    },
    { 
      name: 'Beauty', 
      icon: '💄', 
      color: '#EF4444',
      slug: 'beauty',
      productCount: 0,
      description: 'Cosmetics and personal care'
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/categories');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          // Use default categories if API fails
          setCategories(defaultCategories);
        }
      } else {
        // Use default categories if API is not available
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.log('Using default categories (API not available)');
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    const categoryValue = category?.slug || category?.name?.toLowerCase() || 'all';
    if (onCategoryChange) {
      onCategoryChange(categoryValue);
    }
  };

  const getGridColumns = () => {
    if (gridCols !== 'auto') return gridCols;
    
    const totalItems = categories.length + (showAllOption ? 1 : 0);
    
    if (totalItems <= 4) return 'grid-cols-2 md:grid-cols-4';
    if (totalItems <= 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
    if (totalItems <= 8) return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading categories: {error}</p>
          <button 
            onClick={fetchCategories}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-600 text-sm mt-1">
            Find sustainable products across all categories
          </p>
        </div>
        
        {/* Category Count Badge */}
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {categories.length} categories
        </div>
      </div>

      {/* Categories Grid */}
      <div className={`grid gap-4 ${getGridColumns()}`}>
        {/* All Categories Option */}
        {showAllOption && (
          <CategoryCard
            category={{
              name: 'All Items',
              icon: '🌿',
              color: '#059669',
              slug: 'all',
              productCount: categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)
            }}
            isSelected={selectedCategory === 'all'}
            onClick={() => handleCategoryClick({ slug: 'all' })}
            showProductCount={showProductCounts}
            size={cardSize}
          />
        )}

        {/* Category Cards */}
        {categories.map((category) => (
          <CategoryCard
            key={category._id || category.slug}
            category={category}
            isSelected={selectedCategory === (category.slug || category.name?.toLowerCase())}
            onClick={handleCategoryClick}
            showProductCount={showProductCounts}
            size={cardSize}
          />
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories available</h3>
          <p className="text-gray-600">Categories will appear here once they are added.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
