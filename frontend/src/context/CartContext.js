import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Cart action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  SELECT_ITEM: 'SELECT_ITEM',
  DESELECT_ITEM: 'DESELECT_ITEM',
  SELECT_ALL: 'SELECT_ALL',
  DESELECT_ALL: 'DESELECT_ALL',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };
    }

    case CART_ACTIONS.REMOVE_ITEM:
      const newSelectedItems = new Set(state.selectedItems);
      newSelectedItems.delete(action.payload);
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
        selectedItems: newSelectedItems
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      if (action.payload.quantity <= 0) {
        const removeSelectedItems = new Set(state.selectedItems);
        removeSelectedItems.delete(action.payload.id);
        return {
          ...state,
          items: state.items.filter(item => item._id !== action.payload.id),
          selectedItems: removeSelectedItems
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        selectedItems: new Set()
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || action.payload,
        selectedItems: new Set(action.payload.selectedItems || [])
      };

    case CART_ACTIONS.SELECT_ITEM:
      const selectSet = new Set(state.selectedItems);
      selectSet.add(action.payload);
      return {
        ...state,
        selectedItems: selectSet
      };

    case CART_ACTIONS.DESELECT_ITEM:
      const deselectSet = new Set(state.selectedItems);
      deselectSet.delete(action.payload);
      return {
        ...state,
        selectedItems: deselectSet
      };

    case CART_ACTIONS.SELECT_ALL:
      const inStockItems = state.items.filter(item => item.inStock !== false);
      return {
        ...state,
        selectedItems: new Set(inStockItems.map(item => item._id))
      };

    case CART_ACTIONS.DESELECT_ALL:
      return {
        ...state,
        selectedItems: new Set()
      };

    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  selectedItems: new Set(),
  loading: false,
  error: null,
  isOpen: false
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, authenticatedFetch } = useAuth();

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('ecofinds-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ 
          type: CART_ACTIONS.LOAD_CART, 
          payload: {
            items: parsedCart.items || [],
            selectedItems: new Set(parsedCart.selectedItems || [])
          }
        });
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
  };

  const loadCartFromBackend = useCallback(async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authenticatedFetch('/api/cart');
      
      if (response && response.ok) {
        const data = await response.json();
        dispatch({ 
          type: CART_ACTIONS.LOAD_CART, 
          payload: {
            items: data.items || [],
            selectedItems: data.selectedItems || []
          }
        });
      } else {
        // If backend fails, fall back to localStorage
        console.warn('Failed to load cart from backend, falling back to localStorage');
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      // Clear any potentially corrupted cart data and start fresh
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      loadCartFromLocalStorage();
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, [authenticatedFetch]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (user) {
      // Load from backend for authenticated users
      loadCartFromBackend();
    } else {
      // Load from localStorage for guest users
      loadCartFromLocalStorage();
    }
  }, [user, loadCartFromBackend]);

  // Save cart to localStorage whenever items change (for guest users)
  useEffect(() => {
    if (!user && state.items.length > 0) {
      const cartData = {
        items: state.items,
        selectedItems: Array.from(state.selectedItems)
      };
      localStorage.setItem('ecofinds-cart', JSON.stringify(cartData));
    }
  }, [state.items, state.selectedItems, user]);

  // Cart actions
  const addToCart = async (product, quantity = 1) => {
    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });

      if (user && authenticatedFetch) {
        // Save to backend for authenticated users
        const response = await authenticatedFetch('/api/cart/add', {
          method: 'POST',
          body: JSON.stringify({
            productId: product._id,
            quantity: quantity
          })
        });

        if (response && response.ok) {
          const data = await response.json();
          dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { ...product, quantity } });
        } else {
          throw new Error('Failed to add item to cart');
        }
      } else {
        // Add to local state for guest users
        dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { ...product, quantity } });
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Failed to add item to cart' });
      // Still add to local state even if backend fails
      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { ...product, quantity } });
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });

      if (user && authenticatedFetch) {
        // Remove from backend for authenticated users
        const response = await authenticatedFetch('/api/cart/remove', {
          method: 'DELETE',
          body: JSON.stringify({ productId })
        });

        if (response && response.ok) {
          dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
        } else {
          throw new Error('Failed to remove item from cart');
        }
      } else {
        // Remove from local state for guest users
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      }

      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Failed to remove item from cart' });
      // Still remove from local state even if backend fails
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      return { success: false, error: error.message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });

      if (user && authenticatedFetch) {
        // Update on backend for authenticated users
        const response = await authenticatedFetch('/api/cart/update', {
          method: 'PUT',
          body: JSON.stringify({ productId, quantity })
        });

        if (response && response.ok) {
          dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } });
        } else {
          throw new Error('Failed to update quantity');
        }
      } else {
        // Update local state for guest users
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Failed to update quantity' });
      // Still update local state even if backend fails
      dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } });
      return { success: false, error: error.message };
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });

      if (user && authenticatedFetch) {
        // Clear cart on backend for authenticated users
        const response = await authenticatedFetch('/api/cart/clear', {
          method: 'DELETE'
        });

        if (response && response.ok) {
          dispatch({ type: CART_ACTIONS.CLEAR_CART });
        } else {
          throw new Error('Failed to clear cart');
        }
      } else {
        // Clear local state and localStorage for guest users
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        localStorage.removeItem('ecofinds-cart');
      }

      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Failed to clear cart' });
      // Still clear local state even if backend fails
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      return { success: false, error: error.message };
    }
  };

  // Selection management
  const toggleSelectItem = (itemId) => {
    if (state.selectedItems.has(itemId)) {
      dispatch({ type: CART_ACTIONS.DESELECT_ITEM, payload: itemId });
    } else {
      dispatch({ type: CART_ACTIONS.SELECT_ITEM, payload: itemId });
    }
  };

  const selectAllItems = () => {
    dispatch({ type: CART_ACTIONS.SELECT_ALL });
  };

  const deselectAllItems = () => {
    dispatch({ type: CART_ACTIONS.DESELECT_ALL });
  };

  // Cart calculations
  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSelectedTotal = () => {
    return state.items
      .filter(item => state.selectedItems.has(item._id) && item.inStock !== false)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSelectedCount = () => {
    return state.items
      .filter(item => state.selectedItems.has(item._id) && item.inStock !== false)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const getSelectedItems = () => {
    return state.items.filter(item => state.selectedItems.has(item._id) && item.inStock !== false);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    getTotalItems,
    getTotalPrice,
    getSelectedTotal,
    getSelectedCount,
    getSelectedItems,
    getItemQuantity,
    clearError,
    loadCartFromBackend
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export { CART_ACTIONS };

