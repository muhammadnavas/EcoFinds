import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AddProduct = ({ onBack, onProductAdded }) => {
  const { isAuthenticated, user, authenticatedFetch } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
    images: [''],
    sellerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    // Pre-fill seller name if user is authenticated
    if (isAuthenticated && user && user.username && !formData.sellerName) {
      setFormData(prev => ({
        ...prev,
        sellerName: user.username
      }));
    }
  }, [isAuthenticated, user, formData.sellerName]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        console.error('Failed to fetch categories');
        // Fallback to hardcoded categories if API fails
        setCategories([
          { name: 'Electronics' },
          { name: 'Fashion' },
          { name: 'Home & Garden' },
          { name: 'Musical Instruments' },
          { name: 'Sports' },
          { name: 'Books' },
          { name: 'Toys' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to hardcoded categories if API fails
      setCategories([
        { name: 'Electronics' },
        { name: 'Fashion' },
        { name: 'Home & Garden' },
        { name: 'Musical Instruments' },
        { name: 'Sports' },
        { name: 'Books' },
        { name: 'Toys' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages,
      imageUrl: newImages[0] || '' // Keep first image as main imageUrl for backward compatibility
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages,
        imageUrl: newImages[0] || ''
      }));
    }
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/products';
      
      // Prepare form data with user information
      const submitData = {
        ...formData,
        sellerName: user?.username || formData.sellerName || 'Anonymous'
      };

      let response;
      if (isAuthenticated && authenticatedFetch) {
        // Use authenticated fetch if user is logged in
        response = await authenticatedFetch(apiUrl, {
          method: 'POST',
          body: JSON.stringify(submitData),
        });
      } else {
        // Fallback to regular fetch for non-authenticated users
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
      }

      const data = await response.json();

      if (response.ok && (data.success || data.product)) {
        setSuccess('Product added successfully!');
        setFormData({
          title: '',
          description: '',
          category: '',
          price: '',
          imageUrl: '',
          images: [''],
          sellerName: '',
        });
        if (onProductAdded) {
          onProductAdded(data.data || data.product);
        }
        // Auto redirect after 2 seconds
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-green-600 hover:text-green-700 mb-4 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-600 mt-2">
            Share your items with the EcoFinds community and help promote sustainable living!
          </p>
        </div>

        {/* Authentication Info */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">Not Signed In</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You can still add products, but consider signing in to manage your listings and build seller reputation.
                </p>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && user && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Signed in as {user.username}</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your product will be associated with your account for easy management.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Enter a descriptive title for your product"
                maxLength="100"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Describe your product's condition, features, and any other relevant details"
                maxLength="500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Category and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                >
                  <option value="">Select a category</option>
                  {categoriesLoading ? (
                    <option value="">Loading categories...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.name || category} value={category.name || category}>
                        {category.name || category}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Multiple Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (optional)
              </label>
              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                        placeholder={`Image URL ${index + 1}`}
                      />
                    </div>
                    {image && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Remove image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center text-green-600 hover:text-green-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Another Image
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Add multiple image URLs to showcase your product from different angles. The first image will be used as the main product image.
              </p>
            </div>

            {/* Seller Name */}
            {/* Seller Name */}
            <div>
              <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-2">
                {isAuthenticated ? 'Seller Name' : 'Your Name (optional)'}
              </label>
              <input
                id="sellerName"
                name="sellerName"
                type="text"
                value={formData.sellerName}
                onChange={handleInputChange}
                disabled={isAuthenticated && user}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200 ${
                  isAuthenticated && user ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
                placeholder={isAuthenticated ? user?.username : "Enter your name or username"}
              />
              <p className="text-sm text-gray-500 mt-1">
                {isAuthenticated && user 
                  ? 'Your username will be used as the seller name'
                  : 'This will be displayed as the seller name for this product'
                }
              </p>
            </div>            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding Product...
                  </div>
                ) : (
                  '🌱 Add Product'
                )}
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-2">💡 Tips for a great listing:</h3>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Use a clear, descriptive title</li>
              <li>• Include condition details in the description</li>
              <li>• Set a fair price based on condition and market value</li>
              <li>• Use high-quality images when possible</li>
              <li>• Be honest about any flaws or wear</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
