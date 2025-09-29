import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useFeedback } from '../context/FeedbackContext';

const ProductComparison = ({ onClose, comparedProducts = [], productDetails = {}, onClearComparison }) => {
  const { showSuccess, showWarning } = useFeedback();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  // Use product details from context
  useEffect(() => {
    if (!Array.isArray(comparedProducts) || comparedProducts.length === 0) {
      setProducts([]);
      return;
    }
    
    // Extract product details from context
    const productList = comparedProducts
      .map(productId => productDetails[productId])
      .filter(product => product !== null && product !== undefined);
    
    setProducts(productList);
  }, [comparedProducts, productDetails]);

  // Generate comparison data
  const getComparisonData = () => {
    if (!Array.isArray(products) || products.length === 0) return [];

    return [
      {
        label: 'Product Image',
        type: 'image',
        values: products.map(product => product?.imageUrl || '/api/placeholder/200/200')
      },
      {
        label: 'Product Name',
        type: 'text',
        values: products.map(product => product?.title || 'Unknown Product')
      },
      {
        label: 'Price (₹)',
        type: 'price',
        values: products.map(product => {
          const price = product?.price ? parseFloat(product.price) : 0;
          // Convert from USD to INR (approximate conversion)
          const priceInINR = price * 83;
          return priceInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 });
        })
      },
      {
        label: 'Category',
        type: 'badge',
        values: products.map(product => product?.category || 'Unknown')
      },
      {
        label: 'Condition',
        type: 'text',
        values: products.map(product => product?.condition || 'Good')
      },
      {
        label: 'Seller',
        type: 'text',
        values: products.map(product => product?.sellerName || product?.seller?.username || 'Anonymous')
      },
      {
        label: 'Description',
        type: 'description',
        values: products.map(product => product?.description || 'No description available')
      },
      {
        label: 'Listed Date',
        type: 'date',
        values: products.map(product => {
          const date = product?.createdAt ? new Date(product.createdAt) : new Date();
          return date.toLocaleDateString();
        })
      },
      {
        label: 'Rating',
        type: 'rating',
        values: products.map(() => '4.5 ⭐') // Mock ratings
      },
      {
        label: 'Availability',
        type: 'status',
        values: products.map(() => 'In Stock')
      }
    ];
  };

  const comparisonData = getComparisonData();

  const handleClearAll = () => {
    if (onClearComparison) {
      onClearComparison();
    }
    showSuccess('Comparison cleared');
  };

  const handleAddToCart = (product) => {
    if (product) {
      addToCart(product);
      showSuccess(`Added ${product.title} to cart`);
    }
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = Array.isArray(comparedProducts) 
      ? comparedProducts.filter(id => id !== productId)
      : [];
    if (onClearComparison) {
      onClearComparison(updatedProducts);
    }
  };

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">No Products to Compare</h3>
          <p className="text-gray-600 mb-6">
            Add products to your comparison list to see them side by side.
          </p>
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Product Comparison</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Comparing {Array.isArray(products) ? products.length : 0} product{(Array.isArray(products) && products.length > 1) ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleClearAll}
                className="px-3 py-2 sm:px-4 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-800 w-40 sticky left-0 bg-gray-50 border-r border-gray-200">Features</th>
                  {Array.isArray(products) && products.map((product, index) => (
                    <th key={product?._id || index} className="text-center p-4 relative min-w-64">
                      <button
                        onClick={() => handleRemoveProduct(product?._id)}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition z-10"
                        title="Remove from comparison"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="text-sm font-medium text-gray-600 pr-6">Product {index + 1}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(comparisonData) && comparisonData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 font-semibold text-gray-700 border-r border-gray-200 sticky left-0 bg-inherit">
                      {row.label}
                    </td>
                    {Array.isArray(row.values) && row.values.map((value, colIndex) => (
                      <td key={colIndex} className="p-4 text-center">
                        {row.type === 'image' && (
                          <div className="flex justify-center">
                            <img
                              src={value}
                              alt={`Product ${colIndex + 1}`}
                              className="w-24 h-24 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/96/96';
                              }}
                            />
                          </div>
                        )}
                        {row.type === 'text' && (
                          <span className="text-gray-800">{value}</span>
                        )}
                        {row.type === 'price' && (
                          <span className="text-2xl font-bold text-green-600">₹{value}</span>
                        )}
                        {row.type === 'badge' && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {value}
                          </span>
                        )}
                        {row.type === 'description' && (
                          <div className="text-sm text-gray-600 text-left max-w-xs mx-auto leading-relaxed">
                            <div className="line-clamp-4">
                              {value && value.length > 120 ? value.substring(0, 120) + '...' : (value || 'No description')}
                            </div>
                          </div>
                        )}
                        {row.type === 'date' && (
                          <span className="text-sm text-gray-600">{value}</span>
                        )}
                        {row.type === 'rating' && (
                          <span className="text-sm font-medium text-yellow-600">{value}</span>
                        )}
                        {row.type === 'status' && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {value}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center space-x-4">
              {Array.isArray(products) && products.map(product => (
                <div key={product?._id || Math.random()} className="text-center">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md hover:shadow-lg"
                  >
                    Add to Cart
                  </button>
                  <div className="text-xs text-gray-500 mt-1 max-w-32">
                    {product?.title && product.title.length > 20 ? product.title.substring(0, 20) + '...' : (product?.title || 'Unknown Product')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;