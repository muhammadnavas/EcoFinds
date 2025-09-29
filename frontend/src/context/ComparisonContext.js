import { createContext, useCallback, useContext, useReducer } from 'react';

const ComparisonContext = createContext();

// Comparison action types
const COMPARISON_ACTIONS = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT',
  CLEAR_COMPARISON: 'CLEAR_COMPARISON',
  TOGGLE_COMPARISON_VIEW: 'TOGGLE_COMPARISON_VIEW',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Maximum products that can be compared
const MAX_COMPARISON_PRODUCTS = 4;

// Comparison reducer
const comparisonReducer = (state, action) => {
  switch (action.type) {
    case COMPARISON_ACTIONS.ADD_PRODUCT:
      const { productId, productData } = action.payload;
      
      // Ensure state.products is an array
      const currentProducts = Array.isArray(state.products) ? state.products : [];
      
      // Don't add if product is already in comparison
      if (currentProducts.includes(productId)) {
        return state;
      }
      
      // Don't add if max limit reached
      if (currentProducts.length >= MAX_COMPARISON_PRODUCTS) {
        return state;
      }
      
      // Check category restriction if there are existing products
      if (currentProducts.length > 0 && state.productDetails[currentProducts[0]]) {
        const existingCategory = state.productDetails[currentProducts[0]].category;
        if (productData.category !== existingCategory) {
          // Category mismatch - don't add
          return {
            ...state,
            products: currentProducts,
            categoryError: `Can only compare products from the same category. Current comparison contains ${existingCategory} products.`
          };
        }
      }
      
      return {
        ...state,
        products: [...currentProducts, productId],
        productDetails: {
          ...state.productDetails,
          [productId]: productData
        },
        categoryError: null
      };

    case COMPARISON_ACTIONS.REMOVE_PRODUCT:
      const currentProductsForRemoval = Array.isArray(state.products) ? state.products : [];
      const newProductDetails = { ...state.productDetails };
      delete newProductDetails[action.payload];
      
      return {
        ...state,
        products: currentProductsForRemoval.filter(productId => productId !== action.payload),
        productDetails: newProductDetails,
        categoryError: null
      };

    case COMPARISON_ACTIONS.CLEAR_COMPARISON:
      return {
        ...state,
        products: action.payload || [],
        productDetails: {},
        categoryError: null
      };

    case COMPARISON_ACTIONS.TOGGLE_COMPARISON_VIEW:
      return {
        ...state,
        isComparisonViewOpen: !state.isComparisonViewOpen
      };

    case COMPARISON_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        categoryError: null
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  products: [], // Array of product IDs
  productDetails: {}, // Object mapping productId to product data
  isComparisonViewOpen: false,
  categoryError: null
};

// Comparison provider component
export const ComparisonProvider = ({ children }) => {
  const [state, dispatch] = useReducer(comparisonReducer, initialState);

  // Add product to comparison
  const addToComparison = useCallback((productId, productData) => {
    dispatch({ 
      type: COMPARISON_ACTIONS.ADD_PRODUCT, 
      payload: { productId, productData }
    });
  }, []);

  // Remove product from comparison
  const removeFromComparison = useCallback((productId) => {
    dispatch({ type: COMPARISON_ACTIONS.REMOVE_PRODUCT, payload: productId });
  }, []);

  // Clear all products from comparison
  const clearComparison = useCallback((newProducts = []) => {
    dispatch({ type: COMPARISON_ACTIONS.CLEAR_COMPARISON, payload: newProducts });
  }, []);

  // Toggle comparison view
  const toggleComparisonView = useCallback(() => {
    dispatch({ type: COMPARISON_ACTIONS.TOGGLE_COMPARISON_VIEW });
  }, []);

  // Check if product is in comparison
  const isInComparison = useCallback((productId) => {
    return Array.isArray(state.products) && state.products.includes(productId);
  }, [state.products]);

  // Check if comparison is full
  const isComparisonFull = useCallback(() => {
    return Array.isArray(state.products) && state.products.length >= MAX_COMPARISON_PRODUCTS;
  }, [state.products]);

  // Get comparison count
  const getComparisonCount = useCallback(() => {
    return Array.isArray(state.products) ? state.products.length : 0;
  }, [state.products]);

  // Clear category error
  const clearError = useCallback(() => {
    dispatch({ type: COMPARISON_ACTIONS.CLEAR_ERROR });
  }, []);

  // Get current comparison category
  const getComparisonCategory = useCallback(() => {
    if (!Array.isArray(state.products) || state.products.length === 0) return null;
    const firstProduct = state.productDetails[state.products[0]];
    return firstProduct ? firstProduct.category : null;
  }, [state.products, state.productDetails]);

  // Check if product can be added (category validation)
  const canAddProduct = useCallback((productData) => {
    if (!Array.isArray(state.products) || state.products.length === 0) return true;
    if (state.products.length >= MAX_COMPARISON_PRODUCTS) return false;
    
    const currentCategory = getComparisonCategory();
    return currentCategory === productData.category;
  }, [state.products, getComparisonCategory]);

  const value = {
    ...state,
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparisonView,
    isInComparison,
    isComparisonFull,
    getComparisonCount,
    clearError,
    getComparisonCategory,
    canAddProduct,
    MAX_COMPARISON_PRODUCTS
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

// Custom hook to use comparison context
export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export { COMPARISON_ACTIONS };

