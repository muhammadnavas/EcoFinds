import { useEffect, useState } from 'react';
import Logo from './Logo';

const CategoryManager = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'productCount', 'createdAt'
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏷️',
    color: '#10B981'
  });

  const iconOptions = [
    '🏷️', '📱', '👔', '🏠', '🎵', '⚽', '📚', '🧸', 
    '🚗', '💄', '🎨', '🔧', '🏃‍♂️', '🍽️', '📸', '🎮',
    '🌿', '♻️', '🌱', '🌍', '💚', '🔋', '☀️', '💡'
  ];

  const colorOptions = [
    '#10B981', '#059669', '#047857', '#065f46', // Green shades
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', // Blue shades
    '#EC4899', '#DB2777', '#BE185D', '#9D174D', // Pink shades
    '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', // Purple shades
    '#F59E0B', '#D97706', '#B45309', '#92400E', // Amber shades
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B', // Red shades
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `http://localhost:5000/api/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCategories();
        resetForm();
        setError(null);
      } else {
        setError(data.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Error connecting to server');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    setIsAddingCategory(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCategories();
        setError(null);
      } else {
        setError(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error connecting to server');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🏷️',
      color: '#10B981'
    });
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  // Filter and sort categories
  const getFilteredAndSortedCategories = () => {
    let filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'productCount':
        return filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
      case 'createdAt':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'name':
      default:
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

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

  const filteredCategories = getFilteredAndSortedCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo size="large" variant="icon" />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Category Manager
                  </h1>
                  <p className="text-gray-600 mt-1">Organize and manage your product categories</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Category</span>
              </button>
            </div>

            {/* Search and Sort Controls */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="productCount">Sort by Product Count</option>
                <option value="createdAt">Sort by Date Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Category Form */}
        {isAddingCategory && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-green-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingCategory ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter category name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Category description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-3 text-xl border-2 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 ${
                          formData.icon === icon 
                            ? 'border-green-500 bg-green-50 shadow-md' 
                            : 'border-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Choose Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg border-2 transition-all transform hover:scale-110 ${
                          formData.color === color 
                            ? 'border-gray-800 shadow-lg' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                  >
                    {formData.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{formData.name || 'Category Name'}</h4>
                    <p className="text-sm text-gray-600">{formData.description || 'No description'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Categories ({filteredCategories.length})
              </h3>
              {searchTerm && (
                <span className="text-sm text-gray-600">
                  Showing results for "{searchTerm}"
                </span>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredCategories.map((category, index) => (
              <div 
                key={category._id} 
                className="px-6 py-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg transition-shadow"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div 
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: category.color }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-xl font-bold text-gray-900">{category.name}</h4>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.productCount || 0} products
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{category.description || 'No description provided'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Slug: <code className="bg-gray-100 px-2 py-1 rounded">{category.slug}</code></span>
                        <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories available'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm 
                  ? `No categories match "${searchTerm}". Try adjusting your search terms.`
                  : 'Get started by creating your first category to organize your products.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-green-600 hover:text-green-700 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
