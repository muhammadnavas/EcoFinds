// src/context/AuthContext.js
import { createContext, useContext, useEffect, useReducer } from 'react';

const AuthContext = createContext();

// Auth action types
const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
          case AUTH_ACTIONS.UPDATE_USER:
        return {
          ...state,
          user: { ...state.user, ...action.payload },
          loading: false,
          error: null
        };
      case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
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
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ecofinds-token');
      const user = localStorage.getItem('ecofinds-user');

      if (token && user) {
        try {
          // Verify token with backend
          const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            dispatch({
              type: AUTH_ACTIONS.LOGIN,
              payload: {
                user: data.user,
                token: token
              }
            });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('ecofinds-token');
            localStorage.removeItem('ecofinds-user');
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('ecofinds-token');
          localStorage.removeItem('ecofinds-user');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Normal login
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('ecofinds-token', data.token);
        localStorage.setItem('ecofinds-user', JSON.stringify(data.user));

        // Dispatch login action - this will trigger cart context to migrate guest cart
        dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: data.user, token: data.token } });
        return { success: true, message: data.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: data.message || 'Login failed' });
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Registration
  const register = async (username, email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('ecofinds-token', data.token);
        localStorage.setItem('ecofinds-user', JSON.stringify(data.user));

        // Dispatch login action - this will trigger cart context to migrate guest cart
        dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: data.user, token: data.token } });
        return { success: true, message: data.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: data.message || 'Registration failed' });
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const updateUser = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authenticatedFetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update user in state and localStorage
        const updatedUser = { ...state.user, ...data.user };
        localStorage.setItem('ecofinds-user', JSON.stringify(updatedUser));

        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: data.user
        });

        return { success: true, message: data.message || 'Profile updated successfully' };
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: data.message || 'Failed to update profile'
        });
        return { success: false, message: data.message || 'Failed to update profile' };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    // Clear authentication data
    localStorage.removeItem('ecofinds-token');
    localStorage.removeItem('ecofinds-user');
    
    // Dispatch logout action - this will trigger cart context to handle the transition
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const authenticatedFetch = async (url, options = {}) => {
    const token = state.token || localStorage.getItem('ecofinds-token');
    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, authOptions);
      if (response.status === 401) logout();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
    authenticatedFetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export { AUTH_ACTIONS };

