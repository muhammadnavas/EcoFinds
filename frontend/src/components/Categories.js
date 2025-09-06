import { useEffect, useState } from 'react';
import AddToCartButton from './AddToCartButton';

const Categories = ({ onBack, onShowProduct }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products by category
  const fetchCategoryProducts = async (categorySlug, page = 1) => {
    try {
      setProductsLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/categories/${categorySlug}/products?page=${page}&limit=12`
      );
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
        setCurrentPage(page);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
      setError('Error connecting to server');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchCategoryProducts(category.slug, 1);
  };

  const handlePageChange = (newPage) => {
    if (selectedCategory) {
      fetchCategoryProducts(selectedCategory.slug, newPage);
    }
  };

  const backToCategories = () => {
    setSelectedCategory(null);
    setProducts([]);
    setPagination({});
    setCurrentPage(1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchCategories();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Selection View */}
        {!selectedCategory && (
          <>
            {/* Back to Home button */}
            <div className="mb-8">
              <button
                onClick={onBack}
                className="inline-flex items-center text-green-600 hover:text-green-700 mb-4 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Browse Categories
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing eco-friendly products organized by category
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategorySelect(category)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                >
                  <div className="p-8 text-center">
                    <div 
                      className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-center">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Category Products View */}
        {selectedCategory && (
          <>
            {/* Header with back button */}
            <div className="mb-8">
              <button
                onClick={backToCategories}
                className="inline-flex items-center text-green-600 hover:text-green-700 mb-4 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Categories
              </button>
              
              <div className="flex items-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mr-4"
                  style={{ backgroundColor: `${selectedCategory.color}20`, color: selectedCategory.color }}
                >
                  {selectedCategory.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name}</h1>
                  <p className="text-gray-600 mt-1">{selectedCategory.description}</p>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">This category doesn't have any products yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <div 
                      key={product._id} 
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                      onClick={(e) => {
                        // Don't navigate if clicking on the add to cart button
                        if (e.target.closest('.add-to-cart-button')) {
                          return;
                        }
                        if (onShowProduct) {
                          onShowProduct(product._id);
                        }
                      }}
                    >
                      <div className="aspect-w-1 aspect-h-1 w-full">
                        <img
                          src={product.imageUrl || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center`}
                          alt={product.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center`;
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-green-600">
                            ${product.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            by {product.sellerName}
                          </span>
                        </div>
                        <div className="add-to-cart-button">
                          <AddToCartButton product={product} size="full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            page === currentPage
                              ? 'bg-green-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
