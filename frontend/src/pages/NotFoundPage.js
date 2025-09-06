import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist in our sustainable marketplace.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="block w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mx-auto"
          >
            🏠 Go Back Home
          </button>
          <button
            onClick={() => navigate('/categories')}
            className="block w-full sm:w-auto bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors mx-auto"
          >
            📂 Browse Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
