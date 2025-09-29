import { createContext, useCallback, useContext, useReducer } from 'react';

const WishlistContext = createContext();

// Wishlist action types
const WISHLIST_ACTIONS = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  REMOVE_PRODUCT: 'REMOVE_PRODUCT',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  CLEAR_ERROR: 'CLEAR_ERROR',
  TOGGLE_WISHLIST_VIEW: 'TOGGLE_WISHLIST_VIEW'
};

// Wishlist reducer
const wishlistReducer = (state, action) => {
  switch (action.type) {
    case WISHLIST_ACTIONS.ADD_PRODUCT:
      const { productId, productData } = action.payload;
      
      // Ensure state.products is an array
      const currentProducts = Array.isArray(state.products) ? state.products : [];
      
      // Don't add if product is already in wishlist
      if (currentProducts.includes(productId)) {
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
            categoryError: `Can only add products from the same category to wishlist. Current wishlist contains ${existingCategory} products.`
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

    case WISHLIST_ACTIONS.REMOVE_PRODUCT:
      const currentProductsForRemoval = Array.isArray(state.products) ? state.products : [];
      const newProductDetails = { ...state.productDetails };
      delete newProductDetails[action.payload];
      
      return {
        ...state,
        products: currentProductsForRemoval.filter(productId => productId !== action.payload),
        productDetails: newProductDetails,
        categoryError: null
      };

    case WISHLIST_ACTIONS.CLEAR_WISHLIST:
      return {
        ...state,
        products: action.payload || [],
        productDetails: {},
        categoryError: null
      };

    case WISHLIST_ACTIONS.TOGGLE_WISHLIST_VIEW:
      return {
        ...state,
        isWishlistViewOpen: !state.isWishlistViewOpen
      };

    case WISHLIST_ACTIONS.CLEAR_ERROR:
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
  isWishlistViewOpen: false,
  categoryError: null
};

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Add product to wishlist
  const addToWishlist = useCallback((productId, productData) => {
    dispatch({ 
      type: WISHLIST_ACTIONS.ADD_PRODUCT, 
      payload: { productId, productData }
    });
  }, []);

  // Remove product from wishlist
  const removeFromWishlist = useCallback((productId) => {
    dispatch({ type: WISHLIST_ACTIONS.REMOVE_PRODUCT, payload: productId });
  }, []);

  // Clear all products from wishlist
  const clearWishlist = useCallback((newProducts = []) => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_WISHLIST, payload: newProducts });
  }, []);

  // Toggle wishlist view
  const toggleWishlistView = useCallback(() => {
    dispatch({ type: WISHLIST_ACTIONS.TOGGLE_WISHLIST_VIEW });
  }, []);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return Array.isArray(state.products) && state.products.includes(productId);
  }, [state.products]);

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return Array.isArray(state.products) ? state.products.length : 0;
  }, [state.products]);

  // Clear category error
  const clearError = useCallback(() => {
    dispatch({ type: WISHLIST_ACTIONS.CLEAR_ERROR });
  }, []);

  // Get current wishlist category
  const getWishlistCategory = useCallback(() => {
    if (!Array.isArray(state.products) || state.products.length === 0) return null;
    const firstProduct = state.productDetails[state.products[0]];
    return firstProduct ? firstProduct.category : null;
  }, [state.products, state.productDetails]);

  // Check if product can be added (category validation)
  const canAddProduct = useCallback((productData) => {
    if (!Array.isArray(state.products) || state.products.length === 0) return true;
    
    const currentCategory = getWishlistCategory();
    return currentCategory === productData.category;
  }, [state.products, getWishlistCategory]);

  const value = {
    ...state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    toggleWishlistView,
    isInWishlist,
    getWishlistCount,
    clearError,
    getWishlistCategory,
    canAddProduct
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export { WISHLIST_ACTIONS };

