import { useEffect, useState } from 'react';

const AddProduct = ({ onBack, onProductAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
    sellerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/products';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && (data.success || data.product)) {
        setSuccess('Product added successfully!');
        setFormData({
          title: '',
          description: '',
          category: '',
          price: '',
          imageUrl: '',
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

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a direct link to an image of your product. If left empty, a placeholder will be used.
              </p>
            </div>

            {/* Seller Name */}
            <div>
              <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (optional)
              </label>
              <input
                id="sellerName"
                name="sellerName"
                type="text"
                value={formData.sellerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Enter your name or username"
                maxLength="50"
              />
            </div>

            {/* Submit Button */}
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
