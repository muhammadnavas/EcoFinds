import { useNavigate } from 'react-router-dom';
import Home from '../components/Home';

const HomePage = ({ refreshTrigger }) => {
  const navigate = useNavigate();

  const handleShowAddProduct = () => navigate('/sell');
  const handleShowCart = () => navigate('/cart');
  const handleShowCategories = () => navigate('/categories');
  const handleShowLogin = () => navigate('/login');
  const handleShowProfile = () => navigate('/profile');
  const handleShowDashboard = () => navigate('/dashboard');
  const handleShowHelp = () => navigate('/help');
  const handleShowWishlist = () => navigate('/wishlist');
  const handleShowProduct = (productId) => navigate(`/product/${productId}`);

  return (
    <Home 
      onShowAddProduct={handleShowAddProduct} 
      onShowCart={handleShowCart}
      onShowCategories={handleShowCategories}
      onShowLogin={handleShowLogin}
      onShowProfile={handleShowProfile}
      onShowDashboard={handleShowDashboard}
      onShowHelp={handleShowHelp}
      onShowWishlist={handleShowWishlist}
      onShowProduct={handleShowProduct}
      refreshTrigger={refreshTrigger} 
    />
  );
};

export default HomePage;
