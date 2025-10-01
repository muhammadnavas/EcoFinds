import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';
import { useFeedback } from './FeedbackContext';

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
  SET_SYNCING: 'SET_SYNCING',
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

    case CART_ACTIONS.SET_SYNCING:
      return {
        ...state,
        syncing: action.payload
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        syncing: false
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
  loading: true,  // Start with loading true to prevent flash of empty cart
  error: null,
  isOpen: false,
  syncing: false  // Add syncing state for backend operations
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, authenticatedFetch } = useAuth();
  const { withFeedback, showSuccess, showWarning, showInfo, setItemState, clearItemState, getItemState } = useFeedback();

  // Retry utility function
  const retryOperation = useCallback(async (operation, maxRetries = 2) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }, []);

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('ecofinds-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Ensure items have proper structure with _id field
        const normalizedItems = (parsedCart.items || []).map(item => ({
          ...item,
          _id: item._id || item.id, // Normalize ID field
          id: item._id || item.id   // Keep compatibility
        }));
        
        dispatch({ 
          type: CART_ACTIONS.LOAD_CART, 
          payload: {
            items: normalizedItems,
            selectedItems: new Set(parsedCart.selectedItems || [])
          }
        });
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      localStorage.removeItem('ecofinds-cart'); // Clear corrupted data
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const migrateGuestCartToBackend = useCallback(async (guestCartItems) => {
    if (!guestCartItems || guestCartItems.length === 0) return;
    
    try {
      dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: true });
      showInfo(`Syncing ${guestCartItems.length} item(s) to your account... 🔄`, 2000);
      
      let successCount = 0;
      let failureCount = 0;
      
      // Add each guest cart item to the backend with retry logic
      for (const item of guestCartItems) {
        try {
          await retryOperation(async () => {
            const response = await authenticatedFetch('/api/cart/add', {
              method: 'POST',
              body: JSON.stringify({
                productId: item._id || item.id,
                quantity: item.quantity || 1
              })
            });
            
            if (!response || !response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Failed to migrate item ${item.name || item._id}`);
            }
          });
          successCount++;
        } catch (itemError) {
          console.error(`Failed to migrate item ${item.name || item._id}:`, itemError);
          failureCount++;
        }
      }
      
      if (successCount > 0) {
        // Clear guest cart from localStorage after successful migration
        localStorage.removeItem('ecofinds-cart');
        showSuccess(`Successfully synced ${successCount} item(s) to your account! ✨`);
      }
      
      if (failureCount > 0) {
        showWarning(`${failureCount} item(s) could not be synced. Please add them manually. ⚠️`);
      }
      
      console.log(`Cart migration completed: ${successCount} success, ${failureCount} failures`);
    } catch (error) {
      console.error('Error migrating guest cart to backend:', error);
      showWarning('Some items could not be synced to your account. They remain in your local cart. ⚠️');
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Cart sync failed. Please try adding items manually.' });
    } finally {
      dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: false });
    }
  }, [authenticatedFetch, retryOperation, showInfo, showSuccess, showWarning]);

  const loadCartFromBackend = useCallback(async (shouldMigrateGuestCart = true) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      // Get guest cart items before loading backend cart
      let guestCartItems = [];
      if (shouldMigrateGuestCart) {
        const savedCart = localStorage.getItem('ecofinds-cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            guestCartItems = parsedCart.items || [];
          } catch (error) {
            console.error('Error parsing guest cart:', error);
          }
        }
      }
      
      const response = await authenticatedFetch('/api/cart');
      
      if (response && response.ok) {
        const data = await response.json();
        
        // Migrate guest cart items to backend if any exist
        if (guestCartItems.length > 0) {
          await migrateGuestCartToBackend(guestCartItems);
          // Reload cart after migration
          const updatedResponse = await authenticatedFetch('/api/cart');
          if (updatedResponse && updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            dispatch({ 
              type: CART_ACTIONS.LOAD_CART, 
              payload: {
                items: updatedData.items || [],
                selectedItems: new Set(updatedData.selectedItems || [])
              }
            });
          }
        } else {
          dispatch({ 
            type: CART_ACTIONS.LOAD_CART, 
            payload: {
              items: data.items || [],
              selectedItems: new Set(data.selectedItems || [])
            }
          });
        }
      } else {
        // If backend fails, fall back to localStorage
        console.warn('Failed to load cart from backend, falling back to localStorage');
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      // Don't clear cart on error, fall back to localStorage
      loadCartFromLocalStorage();
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, [authenticatedFetch, migrateGuestCartToBackend]);

  // Load cart when user authentication state changes
  useEffect(() => {
    if (user) {
      // Load from backend for authenticated users and migrate guest cart
      loadCartFromBackend(true);
    } else {
      // Load from localStorage for guest users
      loadCartFromLocalStorage();
    }
  }, [user, loadCartFromBackend]);

  // Handle logout - clear backend cart reference but keep local items for guest mode
  useEffect(() => {
    // Only save to localStorage on logout (when user was previously authenticated)
    if (!user && state.items.length > 0 && !state.loading) {
      try {
        const cartData = {
          items: state.items,
          selectedItems: Array.from(state.selectedItems),
          fromLogout: true, // Flag indicating this came from logout
          timestamp: Date.now()
        };
        localStorage.setItem('ecofinds-cart', JSON.stringify(cartData));
        console.log('Cart preserved in localStorage after logout');
      } catch (error) {
        console.error('Failed to preserve cart after logout:', error);
      }
    }
  }, [user, state.items, state.selectedItems, state.loading]);

  // Save cart to localStorage whenever items change (for guest users)
  useEffect(() => {
    if (!user && !state.loading && state.items.length > 0) {
      try {
        const cartData = {
          items: state.items,
          selectedItems: Array.from(state.selectedItems),
          timestamp: Date.now() // Add timestamp for debugging
        };
        localStorage.setItem('ecofinds-cart', JSON.stringify(cartData));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    } else if (!user && !state.loading && state.items.length === 0) {
      // Clear localStorage if cart is empty
      localStorage.removeItem('ecofinds-cart');
    }
  }, [state.items, state.selectedItems, user, state.loading]);

  // Cart actions
  const addToCart = async (product, quantity = 1) => {
    return await withFeedback(
      async () => {
        // Prevent duplicate additions while syncing
        if (state.syncing) {
          throw new Error('Please wait for current operation to complete');
        }

        dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
        dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: true });
        
        // Always add to local state first for immediate UI feedback
        dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { ...product, quantity } });

        if (user && authenticatedFetch) {
          // Save to backend for authenticated users
          await retryOperation(async () => {
            const response = await authenticatedFetch('/api/cart/add', {
              method: 'POST',
              body: JSON.stringify({
                productId: product._id,
                quantity: quantity
              })
            });

            if (!response || !response.ok) {
              throw new Error('Failed to sync with backend');
            }
          });
        }

        dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: false });
        return { success: true };
      },
      {
        loadingKey: `add-to-cart-${product._id}`,
        loadingMessage: `Adding ${product.name} to cart...`,
        successMessage: `${product.name} added to cart! 🛒`,
        errorMessage: `Failed to add ${product.name} to cart`,
        itemId: product._id
      }
    );
  };

  const removeFromCart = async (productId) => {
    const item = state.items.find(item => item._id === productId || item.id === productId);
    const itemName = item?.name || 'Item';
    
    return await withFeedback(
      async () => {
        // Prevent duplicate operations while syncing
        if (state.syncing) {
          throw new Error('Please wait for current operation to complete');
        }

        dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
        dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: true });
        
        // Always remove from local state first for immediate UI feedback
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });

        if (user && authenticatedFetch) {
          // Remove from backend for authenticated users
          await retryOperation(async () => {
            const response = await authenticatedFetch('/api/cart/remove', {
              method: 'DELETE',
              body: JSON.stringify({ productId })
            });

            if (!response || !response.ok) {
              throw new Error('Failed to sync removal with backend');
            }
          });
        }

        dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: false });
        return { success: true };
      },
      {
        loadingKey: `remove-from-cart-${productId}`,
        loadingMessage: `Removing ${itemName} from cart...`,
        successMessage: `${itemName} removed from cart 🗑️`,
        errorMessage: `Failed to remove ${itemName} from cart`,
        itemId: productId
      }
    );
  };

  const updateQuantity = async (productId, quantity) => {
    const item = state.items.find(item => item._id === productId || item.id === productId);
    const itemName = item?.name || 'Item';
    
    return await withFeedback(
      async () => {
        // Prevent duplicate operations while syncing
        if (state.syncing) {
          throw new Error('Please wait for current operation to complete');
        }

        dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
        dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: true });
        
        // Always update local state first for immediate UI feedback
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } });

        if (user && authenticatedFetch) {
          // Update on backend for authenticated users
          await retryOperation(async () => {
            const response = await authenticatedFetch('/api/cart/update', {
              method: 'PUT',
              body: JSON.stringify({ productId, quantity })
            });

            if (!response || !response.ok) {
              throw new Error('Failed to sync quantity update with backend');
            }
          });
        }

        dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: false });
        return { success: true };
      },
      {
        loadingKey: `update-quantity-${productId}`,
        loadingMessage: `Updating ${itemName} quantity...`,
        successMessage: quantity === 0 
          ? `${itemName} removed from cart 🗑️` 
          : `${itemName} quantity updated to ${quantity} ✏️`,
        errorMessage: `Failed to update ${itemName} quantity`,
        itemId: productId
      }
    );
  };

  const clearCart = async () => {
    // Prevent duplicate operations while syncing
    if (state.syncing) {
      console.warn('Cart operation in progress, please wait...');
      return { success: false, error: 'Please wait for current operation to complete' };
    }

    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: true });
      
      // Always clear local state first for immediate UI feedback
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      
      // Clear localStorage for guest users
      localStorage.removeItem('ecofinds-cart');

      if (user && authenticatedFetch) {
        // Clear cart on backend for authenticated users
        try {
          await retryOperation(async () => {
            const response = await authenticatedFetch('/api/cart/clear', {
              method: 'DELETE'
            });

            if (!response || !response.ok) {
              throw new Error('Failed to clear cart on backend');
            }
          });
        } catch (backendError) {
          console.warn('Backend sync failed for cart clear:', backendError);
          // Don't throw error, cart is already cleared locally
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Failed to clear cart' });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: CART_ACTIONS.SET_SYNCING, payload: false });
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
    loadCartFromBackend,
    // Include syncing state for components that need to show loading indicators
    isSyncing: state.syncing,
    // Expose feedback functions for item-level feedback
    getItemState,
    setItemState,
    clearItemState
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

