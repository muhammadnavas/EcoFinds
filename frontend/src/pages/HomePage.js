import { useNavigate } from 'react-router-dom';
import Home from '../components/Home';

const HomePage = ({ refreshTrigger }) => {
  const navigate = useNavigate();

  const handleShowAddProduct = () => {
    navigate('/add-product');
  };

  const handleShowCart = () => {
    navigate('/cart');
  };

  const handleShowCategories = () => {
    navigate('/categories');
  };

  const handleShowProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Home 
      onShowAddProduct={handleShowAddProduct} 
      onShowCart={handleShowCart}
      onShowCategories={handleShowCategories}
      onShowProduct={handleShowProduct}
      refreshTrigger={refreshTrigger} 
    />
  );
};

export default HomePage;
