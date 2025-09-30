import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Notification types
const NOTIFICATION_TYPES = {
  PRICE_DROP: 'price_drop',
  NEW_LISTING: 'new_listing',
  WISHLIST_UPDATE: 'wishlist_update',
  MESSAGE: 'message',
  REVIEW: 'review',
  SYSTEM: 'system'
};

// Notification actions
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_READ: 'MARK_READ',
  MARK_ALL_READ: 'MARK_ALL_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_PREFERENCES: 'SET_PREFERENCES'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: {
    [NOTIFICATION_TYPES.PRICE_DROP]: true,
    [NOTIFICATION_TYPES.NEW_LISTING]: true,
    [NOTIFICATION_TYPES.WISHLIST_UPDATE]: true,
    [NOTIFICATION_TYPES.MESSAGE]: true,
    [NOTIFICATION_TYPES.REVIEW]: true,
    [NOTIFICATION_TYPES.SYSTEM]: true,
    email: true,
    push: true
  }
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        id: Date.now().toString(),
        ...action.payload,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.MARK_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: removedNotification && !removedNotification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      const unreadCount = action.payload.filter(n => !n.isRead).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount
      };

    case NOTIFICATION_ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load notifications and preferences from API
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      loadPreferences();
    }
  }, [isAuthenticated, user]);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      const ws = new WebSocket(`ws://localhost:5000/notifications/${user.id}`);
      
      ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        if (state.preferences[notification.type]) {
          addNotification(notification);
        }
      };

      return () => ws.close();
    }
  }, [isAuthenticated, user, state.preferences]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS, payload: data.data });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_PREFERENCES, payload: data.data });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const addNotification = useCallback((notification) => {
    dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: notification });
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    dispatch({ type: NOTIFICATION_ACTIONS.MARK_READ, payload: notificationId });
    
    try {
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_READ });
    
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const removeNotification = useCallback(async (notificationId) => {
    dispatch({ type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
    
    try {
      await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences) => {
    dispatch({ type: NOTIFICATION_ACTIONS.SET_PREFERENCES, payload: newPreferences });
    
    try {
      await fetch('http://localhost:5000/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPreferences)
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }, []);

  // Helper functions for creating specific notification types
  const notifyPriceDrop = useCallback((product, oldPrice, newPrice) => {
    addNotification({
      type: NOTIFICATION_TYPES.PRICE_DROP,
      title: 'Price Drop Alert!',
      message: `${product.title} is now $${newPrice} (was $${oldPrice})`,
      data: { productId: product._id, oldPrice, newPrice },
      icon: '💰'
    });
  }, [addNotification]);

  const notifyNewListing = useCallback((product, category) => {
    addNotification({
      type: NOTIFICATION_TYPES.NEW_LISTING,
      title: 'New listing in your followed category',
      message: `New ${category} listing: ${product.title}`,
      data: { productId: product._id, category },
      icon: '🆕'
    });
  }, [addNotification]);

  const notifyWishlistUpdate = useCallback((product, action) => {
    const messages = {
      back_in_stock: `${product.title} is back in stock!`,
      price_change: `Price updated for ${product.title}`,
      sold: `${product.title} from your wishlist was sold`
    };
    
    addNotification({
      type: NOTIFICATION_TYPES.WISHLIST_UPDATE,
      title: 'Wishlist Update',
      message: messages[action] || `Update for ${product.title}`,
      data: { productId: product._id, action },
      icon: '💝'
    });
  }, [addNotification]);

  const notifyMessage = useCallback((sender, message) => {
    addNotification({
      type: NOTIFICATION_TYPES.MESSAGE,
      title: `New message from ${sender.username}`,
      message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: { senderId: sender.id, messageId: message.id },
      icon: '💬'
    });
  }, [addNotification]);

  const notifyReview = useCallback((product, reviewer) => {
    addNotification({
      type: NOTIFICATION_TYPES.REVIEW,
      title: 'New review on your product',
      message: `${reviewer.username} reviewed ${product.title}`,
      data: { productId: product._id, reviewerId: reviewer.id },
      icon: '⭐'
    });
  }, [addNotification]);

  const value = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updatePreferences,
    notifyPriceDrop,
    notifyNewListing,
    notifyWishlistUpdate,
    notifyMessage,
    notifyReview,
    NOTIFICATION_TYPES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export { NOTIFICATION_TYPES };
