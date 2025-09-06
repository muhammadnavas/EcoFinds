import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProduct from '../components/AddProduct';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [refreshProducts, setRefreshProducts] = useState(0);

  const handleBack = () => {
    navigate('/');
  };

  const handleProductAdded = (product) => {
    // Trigger a refresh of the products list when we go back to home
    setRefreshProducts(prev => prev + 1);
    // Navigate back to home page
    navigate('/', { state: { refreshTrigger: refreshProducts + 1 } });
  };

  return (
    <AddProduct 
      onBack={handleBack} 
      onProductAdded={handleProductAdded}
    />
  );
};

export default AddProductPage;
