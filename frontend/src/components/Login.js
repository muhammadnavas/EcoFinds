//src/components/Login.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onBack }) => {
  const { login, register, loading, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
    clearError();
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!formData.username.trim()) {
        setFormError('Username is required');
        return false;
      }
      if (formData.username.length < 3) {
        setFormError('Username must be at least 3 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    
    if (!formData.password.trim()) {
      setFormError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;
      
      if (isSignUp) {
        result = await register(formData.username, formData.email, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        // Auto redirect to home after successful auth
        setTimeout(() => {
          if (onBack) onBack();
        }, 1000);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setFormError('');
    clearError();
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center text-white hover:text-green-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-lg">
            {/* New EcoFinds Logo with green and purple leaf design */}
            <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              {/* Green leaf */}
              <path d="M20 50 Q50 20 80 50 Q50 30 20 50" fill="#22c55e" />
              {/* Purple leaf overlay */}
              <path d="M40 50 Q70 20 80 50 Q65 30 40 50" fill="#8b5cf6" />
              {/* Base arch - green */}
              <path d="M10 60 Q30 40 50 60 Q70 40 90 60 Q70 70 50 60 Q30 70 10 60" fill="#16a34a" />
              {/* Base arch - purple */}
              <path d="M20 70 Q40 50 60 70 Q80 50 90 70 Q80 80 60 70 Q40 80 20 70" fill="#7c3aed" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EcoFinds</h1>
          <p className="text-green-100">Sustainable Second-Hand Marketplace</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {displayError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required={isSignUp}
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Enter your username"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Enter your password"
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={isSignUp}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={toggleSignUp}
                className="ml-2 text-green-600 hover:text-green-700 font-semibold transition duration-200"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center text-white">
          <p className="text-sm opacity-90">
            Join our community of eco-conscious buyers and sellers
          </p>
          <div className="flex justify-center space-x-6 mt-4 text-xs opacity-80">
            <span>♻️ Sustainable</span>
            <span>🛡️ Secure</span>
            <span>🤝 Community</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;