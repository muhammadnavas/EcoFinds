// src/context/AuthContext.js
import { createContext, useContext, useEffect, useReducer } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

// --- Helper to generate username if Google displayName is missing ---
const generateUsername = (email) => {
  if (!email) return "user_" + Math.floor(100 + Math.random() * 900);
  const prefix = email.split("@")[0].slice(0, 4);
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}_${randomNum}`;
};

const AuthContext = createContext();

// Auth action types
const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
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

  // Check for existing token/user in localStorage
  useEffect(() => {
    const user = localStorage.getItem('ecofinds-user');
    const token = localStorage.getItem('ecofinds-token');
    if (user && token) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN,
        payload: {
          user: JSON.parse(user),
          token
        }
      });
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
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

        dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: data.user, token: data.token } });
        return { success: true, message: data.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: data.message || 'Login failed' });
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Network error. Please try again.' });
      return { success: false, message: 'Network error. Please try again.' };
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

        dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user: data.user, token: data.token } });
        return { success: true, message: data.message };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: data.message || 'Registration failed' });
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Network error. Please try again.' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Google login with Firebase
  const loginWithGoogle = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Ensure username exists
      const username = googleUser.displayName || generateUsername(googleUser.email);

      const user = {
        uid: googleUser.uid,
        displayName: googleUser.displayName,
        email: googleUser.email,
        photoURL: googleUser.photoURL,
        username
      };

      // Save in localStorage
      localStorage.setItem('ecofinds-user', JSON.stringify(user));
      const token = await googleUser.getIdToken();
      localStorage.setItem('ecofinds-token', token);

      dispatch({ type: AUTH_ACTIONS.LOGIN, payload: { user, token } });

      return { success: true };
    } catch (error) {
      console.error('Google login failed:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Google login failed' });
      return { success: false, message: 'Google login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('ecofinds-token');
    localStorage.removeItem('ecofinds-user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

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
    loginWithGoogle,
    logout,
    clearError,
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
