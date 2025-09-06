import { useEffect, useState } from 'react';
import AddToCartButton from './AddToCartButton';

const ProductDetail = ({ productId, onBack, onShowProduct }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [reviews] = useState([
    {
      id: 1,
      user: "Sarah M.",
      rating: 5,
      comment: "Excellent quality! Exactly as described and fast shipping.",
      date: "2025-01-10"
    },
    {
      id: 2,
      user: "Mike R.",
      rating: 4,
      comment: "Good product, minor wear but great value for the price.",
      date: "2025-01-05"
    },
    {
      id: 3,
      user: "Lisa K.",
      rating: 5,
      comment: "Outstanding quality and great seller communication.",
      date: "2024-12-25"
    }
  ]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        const data = await response.json();
        
        if (response.ok) {
          setProduct(data);
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
        
        if (response.ok) {
          setRelatedProducts(data.products || []);
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
      prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleRelatedProductClick = (relatedProductId) => {
    if (onShowProduct) {
      onShowProduct(relatedProductId);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-green-600 hover:text-green-700 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Products
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Product Details</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <img
                src={product.images?.[selectedImageIndex] || product.image || '/api/placeholder/600/600'}
                alt={product.name}
                className={`w-full rounded-lg shadow-lg cursor-pointer transition duration-300 ${
                  isImageZoomed ? 'scale-110' : 'hover:scale-105'
                }`}
                onClick={handleImageClick}
                style={{ aspectRatio: '1/1', objectFit: 'cover' }}
              />
              
              {/* Image Navigation Arrows */}
              {product.images && product.images.length > 1 && (
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

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition duration-200 ${
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

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-gray-600">({reviews.length} reviews)</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <span>Condition: {product.condition}</span>
                <span>Location: {product.location}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
              <p className="text-gray-700">Contact: {product.contactInfo}</p>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-gray-600">({reviews.length} reviews)</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{review.user}</span>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
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
                    src={relatedProduct.image || '/api/placeholder/300/300'}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-green-600 font-bold">${parseFloat(relatedProduct.price).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{relatedProduct.condition}</p>
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
