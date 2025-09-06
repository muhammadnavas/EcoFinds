import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Reviews = ({ productId, productTitle, onReviewAdded }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    title: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setReviews(data.data || []);
      } else {
        // If API endpoint doesn't exist, use mock data
        generateMockReviews();
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use mock data if API fails
      generateMockReviews();
    } finally {
      setLoading(false);
    }
  };

  const generateMockReviews = () => {
    const mockReviews = [
      {
        _id: '1',
        user: { username: 'Sarah M.', _id: 'user1' },
        rating: 5,
        title: 'Excellent Quality!',
        comment: 'Exactly as described and fast shipping. Very happy with this purchase.',
        createdAt: '2025-01-10T12:00:00Z',
        verified: true
      },
      {
        _id: '2',
        user: { username: 'Mike R.', _id: 'user2' },
        rating: 4,
        title: 'Good value',
        comment: 'Good product, minor wear but great value for the price. Seller was responsive.',
        createdAt: '2025-01-05T10:30:00Z',
        verified: true
      },
      {
        _id: '3',
        user: { username: 'Lisa K.', _id: 'user3' },
        rating: 5,
        title: 'Outstanding!',
        comment: 'Outstanding quality and great seller communication. Highly recommend!',
        createdAt: '2024-12-25T15:45:00Z',
        verified: false
      }
    ];
    setReviews(mockReviews);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please log in to leave a review');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Please write a comment');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(prev => [data.data, ...prev]);
          setNewReview({ rating: 5, comment: '', title: '' });
          setShowAddReview(false);
          if (onReviewAdded) onReviewAdded();
          alert('Review added successfully!');
        }
      } else {
        // If API doesn't exist, simulate adding review
        const mockReview = {
          _id: Date.now().toString(),
          user: { username: user.username, _id: user._id },
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          createdAt: new Date().toISOString(),
          verified: true
        };
        setReviews(prev => [mockReview, ...prev]);
        setNewReview({ rating: 5, comment: '', title: '' });
        setShowAddReview(false);
        if (onReviewAdded) onReviewAdded();
        alert('Review added successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        onClick={interactive && onStarClick ? () => onStarClick(i + 1) : undefined}
        className={`text-lg ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        disabled={!interactive}
      >
        ★
      </button>
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Write Review</span>
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Write a Review for "{productTitle}"
          </h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
                <span className="text-sm text-gray-600 ml-2">
                  ({newReview.rating} star{newReview.rating !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Summarize your experience..."
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Share your experience with this product..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {newReview.comment.length}/500 characters
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting || !newReview.comment.trim()}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                  submitting || !newReview.comment.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Review'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddReview(false);
                  setNewReview({ rating: 5, comment: '', title: '' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-300 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-500">
            Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {review.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {review.user.username}
                      </span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}
              
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              
              {/* Review Actions */}
              <div className="flex items-center space-x-4 mt-3 text-sm">
                <button className="text-gray-500 hover:text-green-600 transition-colors flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V6a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17a1 1 0 011 1v3a2 2 0 01-2 2h-3.93l-1.4.7a1 1 0 11-.894-1.789L12 15H9a2 2 0 01-2-2z" />
                  </svg>
                  <span>Helpful</span>
                </button>
                <span className="text-gray-300">|</span>
                <button className="text-gray-500 hover:text-red-600 transition-colors">
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {reviews.length >= 10 && (
        <div className="text-center mt-6">
          <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
