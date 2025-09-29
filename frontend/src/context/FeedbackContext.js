import { createContext, useCallback, useContext, useReducer } from 'react';

const FeedbackContext = createContext();

// Feedback action types
const FEEDBACK_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL_NOTIFICATIONS: 'CLEAR_ALL_NOTIFICATIONS',
  SET_LOADING_STATE: 'SET_LOADING_STATE',
  CLEAR_LOADING_STATE: 'CLEAR_LOADING_STATE',
  SET_ITEM_STATE: 'SET_ITEM_STATE',
  CLEAR_ITEM_STATE: 'CLEAR_ITEM_STATE'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Feedback reducer
const feedbackReducer = (state, action) => {
  switch (action.type) {
    case FEEDBACK_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case FEEDBACK_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => 
          notification.id !== action.payload
        )
      };

    case FEEDBACK_ACTIONS.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };

    case FEEDBACK_ACTIONS.SET_LOADING_STATE:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: action.payload.state
        }
      };

    case FEEDBACK_ACTIONS.CLEAR_LOADING_STATE:
      const newLoadingStates = { ...state.loadingStates };
      delete newLoadingStates[action.payload];
      return {
        ...state,
        loadingStates: newLoadingStates
      };

    case FEEDBACK_ACTIONS.SET_ITEM_STATE:
      return {
        ...state,
        itemStates: {
          ...state.itemStates,
          [action.payload.itemId]: action.payload.state
        }
      };

    case FEEDBACK_ACTIONS.CLEAR_ITEM_STATE:
      const newItemStates = { ...state.itemStates };
      delete newItemStates[action.payload];
      return {
        ...state,
        itemStates: newItemStates
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  notifications: [],
  loadingStates: {},
  itemStates: {}
};

// Feedback provider component
export const FeedbackProvider = ({ children }) => {
  const [state, dispatch] = useReducer(feedbackReducer, initialState);

  // Generate unique ID for notifications
  const generateId = () => Date.now() + Math.random().toString(36).substr(2, 9);

  // Add notification
  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000, action = null) => {
    const id = generateId();
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
      action
    };

    dispatch({ type: FEEDBACK_ACTIONS.ADD_NOTIFICATION, payload: notification });

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: FEEDBACK_ACTIONS.REMOVE_NOTIFICATION, payload: id });
      }, duration);
    }

    return id;
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((id) => {
    dispatch({ type: FEEDBACK_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: FEEDBACK_ACTIONS.CLEAR_ALL_NOTIFICATIONS });
  }, []);

  // Show success notification
  const showSuccess = useCallback((message, duration = 3000, action = null) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration, action);
  }, [addNotification]);

  // Show error notification
  const showError = useCallback((message, duration = 5000, action = null) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration, action);
  }, [addNotification]);

  // Show warning notification
  const showWarning = useCallback((message, duration = 4000, action = null) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration, action);
  }, [addNotification]);

  // Show info notification
  const showInfo = useCallback((message, duration = 3000, action = null) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, duration, action);
  }, [addNotification]);

  // Set loading state for operations
  const setLoadingState = useCallback((key, isLoading, message = '') => {
    dispatch({
      type: FEEDBACK_ACTIONS.SET_LOADING_STATE,
      payload: {
        key,
        state: { loading: isLoading, message }
      }
    });
  }, []);

  // Clear loading state
  const clearLoadingState = useCallback((key) => {
    dispatch({ type: FEEDBACK_ACTIONS.CLEAR_LOADING_STATE, payload: key });
  }, []);

  // Set item-specific state (for individual cart items)
  const setItemState = useCallback((itemId, state) => {
    dispatch({
      type: FEEDBACK_ACTIONS.SET_ITEM_STATE,
      payload: { itemId, state }
    });
  }, []);

  // Clear item state
  const clearItemState = useCallback((itemId) => {
    dispatch({ type: FEEDBACK_ACTIONS.CLEAR_ITEM_STATE, payload: itemId });
  }, []);

  // Get loading state
  const getLoadingState = useCallback((key) => {
    return state.loadingStates[key] || { loading: false, message: '' };
  }, [state.loadingStates]);

  // Get item state
  const getItemState = useCallback((itemId) => {
    return state.itemStates[itemId] || { loading: false, success: false, error: false };
  }, [state.itemStates]);

  // Convenience method for cart operations
  const withFeedback = useCallback(async (operation, {
    loadingKey,
    loadingMessage = 'Processing...',
    successMessage,
    errorMessage = 'Operation failed',
    itemId = null
  }) => {
    try {
      // Set loading state
      if (loadingKey) {
        setLoadingState(loadingKey, true, loadingMessage);
      }
      if (itemId) {
        setItemState(itemId, { loading: true, success: false, error: false });
      }

      // Execute operation
      const result = await operation();

      if (result && result.success) {
        // Show success feedback
        if (successMessage) {
          showSuccess(successMessage);
        }
        if (itemId) {
          setItemState(itemId, { loading: false, success: true, error: false });
          // Clear success state after animation
          setTimeout(() => clearItemState(itemId), 2000);
        }
      } else {
        throw new Error(result?.error || 'Operation failed');
      }

      return result;
    } catch (error) {
      // Show error feedback
      showError(errorMessage);
      if (itemId) {
        setItemState(itemId, { loading: false, success: false, error: true });
        // Clear error state after animation
        setTimeout(() => clearItemState(itemId), 3000);
      }
      throw error;
    } finally {
      // Clear loading state
      if (loadingKey) {
        clearLoadingState(loadingKey);
      }
    }
  }, [setLoadingState, setItemState, showSuccess, showError, clearItemState, clearLoadingState]);

  const value = {
    ...state,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setLoadingState,
    clearLoadingState,
    setItemState,
    clearItemState,
    getLoadingState,
    getItemState,
    withFeedback
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

// Custom hook to use feedback context
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export { FEEDBACK_ACTIONS };
