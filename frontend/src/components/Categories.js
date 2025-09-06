import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AddToCartButton from './AddToCartButton';
import CategoryGrid from './CategoryGrid';
import Logo from './Logo';

const Categories = ({ onBack, onShowProduct, layout = 'browse' }) => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState(null);

  // Fetch all categories and stats
  useEffect(() => {
    fetchCategoriesAndStats();
  }, []);

  const fetchCategoriesAndStats = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and stats in parallel
      const [categoriesRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/categories').catch(() => null),
        fetch('http://localhost:5000/api/categories/stats/overview').catch(() => null)
      ]);

      if (categoriesRes && categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      if (!categoriesRes || !categoriesRes.ok) {
        setError('Unable to load categories');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  // Handle product deletion
  const handleProductDeleted = (deletedProductId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product._id !== deletedProductId)
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Categories</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchCategoriesAndStats();
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Selection View */}
        {!selectedCategory && (
          <>
            {/* Header Section */}
            <button
              onClick={onBack}
              className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            
            {/* Hero Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <Logo size="xl" variant="full" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  Explore Our Categories
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Discover sustainable, eco-friendly products carefully organized by category. 
                  Each selection represents our commitment to environmental responsibility.
                </p>
              </div>

              {/* Stats Section */}
              {stats && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white text-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold">{stats.totalCategories}</div>
                    <div className="text-green-100">Active Categories</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white text-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold">{stats.totalProducts}</div>
                    <div className="text-blue-100">Total Products</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white text-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold">
                      {stats.categoryBreakdown?.[0]?.productCount || 0}
                    </div>
                    <div className="text-purple-100">
                      {stats.categoryBreakdown?.[0]?.name || 'Most Popular'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Grid */}
            <CategoryGrid
              selectedCategory={selectedCategory?.slug || 'all'}
              onCategoryChange={(categorySlug) => {
                const category = categories.find(cat => cat.slug === categorySlug);
                if (category) {
                  handleCategorySelect(category);
                }
              }}
              showAllOption={false}
              cardSize="large"
              showProductCounts={true}
              gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            />
          </>
        )}

        {/* Category Products View */}
        {selectedCategory && (
          <>
            {/* Enhanced Header */}
            <button
              onClick={backToCategories}
              className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Categories
            </button>
            
            {/* Category Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center mb-6">
                <div 
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl mr-6 shadow-lg"
                  style={{ backgroundColor: `${selectedCategory.color}20`, color: selectedCategory.color }}
                >
                  {selectedCategory.icon}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedCategory.name}
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">{selectedCategory.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedCategory.productCount} products
                    </span>
                    <span className="text-gray-500 text-sm">
                      Slug: <code className="bg-gray-100 px-2 py-1 rounded">{selectedCategory.slug}</code>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center mb-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center mb-8">
                <div className="text-gray-300 text-8xl mb-6">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
                <p className="text-gray-600 text-lg">This category doesn't have any products yet.</p>
                <p className="text-gray-500 mt-2">Check back soon for new additions!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => {
                    // Check if current user owns this product
                    const isOwner = isAuthenticated && user && (
                      product.seller?._id === user._id || 
                      product.seller?.username === user.username ||
                      product.sellerName === user.username
                    );

                    const handleDeleteProduct = async (e) => {
                      e.stopPropagation();
                      
                      if (!isAuthenticated || !user) {
                        alert('You must be logged in to delete products');
                        return;
                      }

                      if (!isOwner) {
                        alert('You can only delete your own products');
                        return;
                      }

                      const confirmDelete = window.confirm(
                        `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
                      );

                      if (!confirmDelete) return;

                      try {
                        const response = await fetch(`http://localhost:5000/api/products/${product._id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        });

                        if (response.ok) {
                          alert('Product deleted successfully!');
                          handleProductDeleted(product._id);
                        } else {
                          const data = await response.json();
                          alert(data.message || 'Failed to delete product');
                        }
                      } catch (error) {
                        console.error('Error deleting product:', error);
                        alert('Failed to delete product. Please try again.');
                      }
                    };

                    return (
                    <div 
                      key={product._id} 
                      className="bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1 relative"
                      onClick={(e) => {
                        if (e.target.closest('.add-to-cart-button') || e.target.closest('.delete-product-button')) {
                          return;
                        }
                        if (onShowProduct) {
                          onShowProduct(product._id);
                        }
                      }}
                    >
                      {/* Delete button for product owners */}
                      {isOwner && (
                        <div className="absolute top-2 right-2 z-10 delete-product-button">
                          <button
                            onClick={handleDeleteProduct}
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                            title="Delete Product"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <div className="aspect-w-1 aspect-h-1 w-full">
                        <img
                          src={product.imageUrl || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center`}
                          alt={product.title}
                          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center`;
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ₹{(parseFloat(product.price) * 83).toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            by {product.sellerName}
                          </span>
                        </div>
                        <div className="add-to-cart-button">
                          <AddToCartButton product={product} size="full" />
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing page {currentPage} of {pagination.totalPages} 
                    ({pagination.totalProducts} total products)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              page === currentPage
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
