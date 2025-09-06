import { useNavigate } from 'react-router-dom';
import CartPage from '../components/CartPage';

const CartPageWrapper = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <CartPage onBack={handleBack} />
  );
};

export default CartPageWrapper;
