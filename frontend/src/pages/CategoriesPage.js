import { useNavigate } from 'react-router-dom';
import Categories from '../components/Categories';

const CategoriesPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleShowProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Categories 
      onBack={handleBack} 
      onShowProduct={handleShowProduct} 
    />
  );
};

export default CategoriesPage;
