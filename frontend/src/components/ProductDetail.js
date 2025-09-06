import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AddToCartButton from './AddToCartButton';
import Logo from './Logo';
import Reviews from './Reviews';

const ProductDetail = ({ productId, onBack, onShowProduct }) => {
  const { user, isAuthenticated, authenticatedFetch } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products?limit=4');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setRelatedProducts(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    };

    if (productId) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [productId]);

  // Delete product function
  const handleDeleteProduct = async () => {
    if (!product || !isAuthenticated || !user) {
      alert('You must be logged in to delete products');
      return;
    }

    // Check if user is the owner of the product
    const isOwner = product.seller?._id === user._id || 
                   product.seller?.username === user.username ||
                   product.sellerName === user.username;

    if (!isOwner) {
      alert('You can only delete your own products');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const response = await authenticatedFetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        onBack(); // Navigate back to previous page
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!product) return;
      
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape') {
        setIsImageZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={onBack}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleImageClick = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleRelatedProductClick = (relatedProductId) => {
    if (onShowProduct) {
      onShowProduct(relatedProductId);
    }
  };

  // Generate multiple demo images for better showcase
  const getProductImages = () => {
    if (!product) return [];
    
    // If product has an images array, use it
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    
    // Generate multiple demo images for better showcase
    const baseImage = product.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center';
    const demoImages = [
      baseImage,
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop&crop=center'
    ];
    
    // Return first 4 images for demo
    return demoImages.slice(0, 4);
  };

  const productImages = getProductImages();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fullscreen Image Modal */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-4xl w-full h-full flex items-center justify-center p-4">
            <img
              src={productImages[selectedImageIndex]}
              alt={product.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close button */}
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation arrows */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedImageIndex + 1} / {productImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-green-600 hover:text-green-700 transition duration-200 text-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Products</span>
            </button>
            <div className="flex items-center">
              <Logo size="xl" variant="full" />
              <h1 className="text-4xl font-bold text-gray-800 ml-5">Product Details</h1>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Image Gallery - Medium sized */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Image - Medium size */}
            <div className="relative group">
              <img
                src={productImages[selectedImageIndex] || '/api/placeholder/400/400'}
                alt={product.title}
                className={`w-full h-80 object-cover rounded-lg shadow-lg cursor-pointer transition duration-300 ${
                  isImageZoomed ? 'scale-110' : 'hover:scale-105'
                }`}
                onClick={handleImageClick}
              />
              
              {/* Image counter */}
              {productImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              )}
              
              {/* Image Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Image Thumbnails Grid */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className={`w-full h-16 object-cover rounded-lg cursor-pointer transition duration-200 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-green-500 scale-105' 
                        : 'hover:scale-105 hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Takes more space */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ₹{(parseFloat(product.price) * 83).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ₹{(parseFloat(product.price) * 83 * 1.2).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                  17% OFF
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <span>Condition: {product.condition || 'Good'}</span>
                <span>Seller: {product.sellerName || product.seller?.username || 'Anonymous'}</span>
              </div>

              {/* Rating Section - Moved to Reviews component */}
              {/* <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-gray-600">({reviews.length} reviews)</span>
                <span className="text-sm text-green-600 font-medium">
                  {averageRating.toFixed(1)} out of 5
                </span>
              </div> */}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
              <p className="text-gray-700">Seller: {product.sellerName || product.seller?.username || 'Anonymous'}</p>
              <p className="text-gray-700 text-sm mt-1">Contact seller for more details</p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              {/* Check if user owns this product */}
              {isAuthenticated && user && (
                (product.seller?._id === user._id || 
                 product.seller?.username === user.username ||
                 product.sellerName === user.username) ? (
                  /* Owner controls */
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDeleteProduct}
                      disabled={deleting}
                      className={`flex-1 flex items-center justify-center px-6 py-3 border border-red-300 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors ${
                        deleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {deleting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700 mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Product
                        </>
                      )}
                    </button>
                    <button className="flex-1 flex items-center justify-center px-6 py-3 border border-blue-300 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Product
                    </button>
                  </div>
                ) : (
                  /* Regular user - Add to Cart */
                  <AddToCartButton product={product} />
                )
              )}
              
              {/* Guest user - Add to Cart */}
              {!isAuthenticated && (
                <AddToCartButton product={product} />
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <Reviews 
            productId={productId} 
            productTitle={product.title}
            onReviewAdded={() => {
              // Optional: refresh product data or show success message
              console.log('Review added successfully!');
            }} 
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition duration-200 cursor-pointer"
                  onClick={() => handleRelatedProductClick(relatedProduct._id)}
                >
                  <img
                    src={relatedProduct.imageUrl || '/api/placeholder/300/300'}
                    alt={relatedProduct.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-green-600 font-bold">
                      ₹{(parseFloat(relatedProduct.price) * 83).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-600">{relatedProduct.sellerName || 'Anonymous'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
