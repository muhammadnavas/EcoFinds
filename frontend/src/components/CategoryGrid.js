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

  // Default categories with eco-friendly themes (matching product categories)
  const defaultCategories = [
    { 
      name: 'Electronics', 
      icon: '📱', 
      color: '#3B82F6',
      slug: 'electronics',
      productCount: 0,
      description: 'Eco-friendly electronics and gadgets'
    },
    { 
      name: 'Fashion & Clothing', 
      icon: '�', 
      color: '#EC4899',
      slug: 'fashion-clothing',
      productCount: 0,
      description: 'Sustainable fashion and apparel'
    },
    { 
      name: 'Kitchen & Dining', 
      icon: '�️', 
      color: '#F59E0B',
      slug: 'kitchen-dining',
      productCount: 0,
      description: 'Reusable kitchenware and dining'
    },
    { 
      name: 'Home & Garden', 
      icon: '🏡', 
      color: '#10B981',
      slug: 'home-garden',
      productCount: 0,
      description: 'Sustainable home and garden items'
    },
    { 
      name: 'Health & Beauty', 
      icon: '�', 
      color: '#8B5CF6',
      slug: 'health-beauty',
      productCount: 0,
      description: 'Natural personal care products'
    },
    { 
      name: 'Sports & Outdoors', 
      icon: '⚽', 
      color: '#EF4444',
      slug: 'sports-outdoors',
      productCount: 0,
      description: 'Eco-friendly sports equipment'
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
    // Handle both slug and name-based category selection
    let categoryValue;
    
    if (category?.slug === 'all') {
      categoryValue = 'all';
    } else {
      // Use the actual category name for filtering products
      categoryValue = category?.name || category?.slug || 'all';
    }
    
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
        {categories.map((category) => {
          const isSelected = selectedCategory === 'all' ? false : 
            selectedCategory === category.name || 
            selectedCategory === category.slug ||
            selectedCategory === category.name?.toLowerCase();
            
          return (
            <CategoryCard
              key={category._id || category.slug || category.name}
              category={category}
              isSelected={isSelected}
              onClick={handleCategoryClick}
              showProductCount={showProductCounts}
              size={cardSize}
            />
          );
        })}
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
