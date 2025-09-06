import { useNavigate, useParams } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';

const ProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleShowProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <ProductDetail 
      productId={id}
      onBack={handleBack} 
      onShowProduct={handleShowProduct}
    />
  );
};

export default ProductPage;
