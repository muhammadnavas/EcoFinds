import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';

const ProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Add breadcrumb tracking
    const breadcrumb = {
      path: `/product/${id}`,
      title: product?.name || 'Product Details',
      timestamp: Date.now()
    };
    
    // Store in sessionStorage for breadcrumb navigation
    const breadcrumbs = JSON.parse(sessionStorage.getItem('breadcrumbs') || '[]');
    const updatedBreadcrumbs = [...breadcrumbs.filter(b => b.path !== breadcrumb.path), breadcrumb];
    sessionStorage.setItem('breadcrumbs', JSON.stringify(updatedBreadcrumbs.slice(-5))); // Keep last 5
  }, [id, product]);

  const handleBack = () => {
    // Try to go back to a meaningful page
    const breadcrumbs = JSON.parse(sessionStorage.getItem('breadcrumbs') || '[]');
    if (breadcrumbs.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleShowProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600 transition duration-200">
              Home
            </Link>
            <span>›</span>
            <Link to="/categories" className="hover:text-green-600 transition duration-200">
              Products
            </Link>
            <span>›</span>
            <span className="text-gray-800 font-medium">
              {product?.name || 'Product Details'}
            </span>
          </nav>
        </div>
      </div>

      <ProductDetail
        productId={id}
        onBack={handleBack}
        onShowProduct={handleShowProduct}
        onProductLoad={setProduct}
      />
    </div>
  );
};

export default ProductPage;