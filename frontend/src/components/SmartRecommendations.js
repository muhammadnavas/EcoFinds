import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import TouchOptimizedCard from './TouchOptimizedCard';

const SmartRecommendations = ({ currentProductId, onShowProduct }) => {
  const [recommendations, setRecommendations] = useState({
    similar: [],
    trending: [],
    personalized: [],
    categoryBased: [],
    priceRange: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personalized');
  
  const { user, isAuthenticated } = useAuth();
  const { products: wishlistProducts } = useWishlist();

  useEffect(() => {
    loadRecommendations();
  }, [currentProductId, user]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const endpoints = {
        similar: currentProductId ? `/api/recommendations/similar/${currentProductId}` : null,
        trending: '/api/recommendations/trending',
        personalized: isAuthenticated ? '/api/recommendations/personalized' : null,
        categoryBased: '/api/recommendations/category-based',
        priceRange: '/api/recommendations/price-range'
      };

      const headers = isAuthenticated ? {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      } : {};

      const promises = Object.entries(endpoints).map(async ([key, endpoint]) => {
        if (!endpoint) return [key, []];
        
        try {
          const response = await fetch(`http://localhost:5000${endpoint}`, { headers });
          const data = await response.json();
          return [key, data.success ? data.data : []];
        } catch (error) {
          console.error(`Error loading ${key} recommendations:`, error);
          return [key, []];
        }
      });

      const results = await Promise.all(promises);
      const newRecommendations = Object.fromEntries(results);
      
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackRecommendationClick = async (productId, type, position) => {
    if (!isAuthenticated) return;
    
    try {
      await fetch('http://localhost:5000/api/analytics/recommendation-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          recommendationType: type,
          position,
          sourceProductId: currentProductId
        })
      });
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  };

  const handleProductClick = (productId, type, position) => {
    trackRecommendationClick(productId, type, position);
    onShowProduct(productId);
  };

  const recommendationTabs = [
    {
      id: 'personalized',
      label: 'For You',
      icon: '🎯',
      description: 'Based on your activity',
      requiresAuth: true
    },
    {
      id: 'similar',
      label: 'Similar Items',
      icon: '🔍',
      description: 'Products like this one',
      requiresProduct: true
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: '🔥',
      description: 'Popular right now'
    },
    {
      id: 'categoryBased',
      label: 'More in Category',
      icon: '📂',
      description: 'From the same category'
    },
    {
      id: 'priceRange',
      label: 'Similar Price',
      icon: '💰',
      description: 'In your price range'
    }
  ];

  const getActiveRecommendations = () => {
    return recommendations[activeTab] || [];
  };

  const RecommendationCard = ({ product, index, type }) => (
    <div className="w-72 flex-shrink-0">
      <TouchOptimizedCard
        product={product}
        onShowProduct={(id) => handleProductClick(id, type, index)}
        onQuickView={(id) => handleProductClick(id, type, index)}
        onProductDeleted={() => loadRecommendations()}
      />
    </div>
  );

  const EmptyState = ({ type }) => {
    const messages = {
      personalized: {
        icon: '🎯',
        title: 'No personalized recommendations yet',
        description: 'Browse products and add items to your wishlist to get personalized recommendations!'
      },
      similar: {
        icon: '🔍',
        title: 'No similar items found',
        description: 'We couldn\'t find products similar to this one.'
      },
      trending: {
        icon: '🔥',
        title: 'No trending products',
        description: 'Check back later for trending items.'
      },
      categoryBased: {
        icon: '📂',
        title: 'No category recommendations',
        description: 'No other products found in this category.'
      },
      priceRange: {
        icon: '💰',
        title: 'No price-matched items',
        description: 'No products found in this price range.'
      }
    };

    const message = messages[type] || messages.trending;

    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">{message.icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{message.title}</h3>
        <p className="text-gray-600 max-w-md mx-auto">{message.description}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="flex space-x-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-72 flex-shrink-0">
                <div className="bg-gray-200 rounded-lg h-64 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const availableTabs = recommendationTabs.filter(tab => {
    if (tab.requiresAuth && !isAuthenticated) return false;
    if (tab.requiresProduct && !currentProductId) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with Tabs */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommendations</h2>
        
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Description */}
        <p className="text-sm text-gray-600 mt-2">
          {availableTabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Recommendations Content */}
      <div className="p-6">
        {getActiveRecommendations().length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {getActiveRecommendations().map((product, index) => (
              <RecommendationCard
                key={product._id}
                product={product}
                index={index}
                type={activeTab}
              />
            ))}
          </div>
        ) : (
          <EmptyState type={activeTab} />
        )}
      </div>

      {/* Improve Recommendations Footer */}
      {isAuthenticated && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Want better recommendations?</p>
              <p className="text-xs text-gray-600">Add more items to your wishlist and browse different categories</p>
            </div>
            <button
              onClick={() => {
                // Navigate to browse page or show tips
              }}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Explore More →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;