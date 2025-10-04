import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(categoryName || null);

  // Category definitions with enhanced metadata
  const categoryData = {
    electronics: {
      name: 'Electronics',
      icon: '📱',
      description: 'Sustainable products, refurbished devices, and eco-friendly electronics',
      color: 'blue',
      subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Smart Home', 'Accessories']
    },
    'home-garden': {
      name: 'Home & Garden',
      icon: '🏡',
      description: 'Eco-friendly home decor, sustainable gardening tools, and green living products',
      color: 'green',
      subcategories: ['Furniture', 'Decor', 'Garden Tools', 'Plants', 'Sustainable Living']
    },
    fashion: {
      name: 'Fashion',
      icon: '👕',
      description: 'Sustainable clothing, accessories, and pre-loved fashion items',
      color: 'pink',
      subcategories: ['Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Bags']
    },
    books: {
      name: 'Books & Media',
      icon: '📚',
      description: 'Educational materials, entertainment, and digital media',
      color: 'purple',
      subcategories: ['Books', 'Movies', 'Music', 'Games', 'Educational']
    },
    sports: {
      name: 'Sports & Outdoors',
      icon: '⚽',
      description: 'Outdoor gear, sports equipment, and adventure accessories',
      color: 'orange',
      subcategories: ['Fitness', 'Outdoor Gear', 'Sports Equipment', 'Bikes', 'Water Sports']
    }
  };

  useEffect(() => {
    if (categoryName && categoryData[categoryName]) {
      setSelectedCategory(categoryName);
    }
  }, [categoryName]);

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      navigate('/categories');
    } else {
      navigate('/');
    }
  };

  const handleShowProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`/category/${category}`);
  };

  const currentCategoryData = selectedCategory ? categoryData[selectedCategory] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-green-600 hover:text-green-700 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {selectedCategory ? 'Back to Categories' : 'Back to Home'}
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                {currentCategoryData ? `${currentCategoryData.icon} ${currentCategoryData.name}` : '🌿 All Categories'}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentCategoryData ? currentCategoryData.description : 'Discover sustainable products across all categories'}
              </p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mt-4">
            <Link to="/" className="hover:text-green-600 transition duration-200">
              Home
            </Link>
            <span>›</span>
            <Link to="/categories" className="hover:text-green-600 transition duration-200">
              Categories
            </Link>
            {currentCategoryData && (
              <>
                <span>›</span>
                <span className="text-gray-800 font-medium">{currentCategoryData.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Category Overview (when no specific category selected) */}
      {!selectedCategory && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.entries(categoryData).map(([key, category]) => (
              <button
                key={key}
                onClick={() => handleCategorySelect(key)}
                className={`bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition duration-200 border-2 border-transparent hover:border-${category.color}-200`}
              >
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-1">
                  {category.subcategories.slice(0, 3).map((sub, index) => (
                    <span key={index} className={`text-xs bg-${category.color}-100 text-${category.color}-700 px-2 py-1 rounded`}>
                      {sub}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs text-gray-500">+{category.subcategories.length - 3} more</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subcategories (when specific category selected) */}
      {selectedCategory && currentCategoryData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {currentCategoryData.subcategories.map((subcategory, index) => (
              <button
                key={index}
                className={`bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition duration-200 border-2 border-transparent hover:border-${currentCategoryData.color}-200`}
              >
                <h4 className="font-medium text-gray-800">{subcategory}</h4>
              </button>
            ))}
          </div>
        </div>
      )}



      {/* Call to Action */}
      <div className="bg-green-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h3>
          <p className="text-green-100 mb-6">
            Set up alerts for specific items or browse our full marketplace
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-200"
            >
              Browse All Products
            </Link>
            <Link
              to="/sell"
              className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition duration-200"
            >
              Sell Your Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
