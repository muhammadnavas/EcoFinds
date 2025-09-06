import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Backend login
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        username: data.user.username,
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem("ecofinds-user", JSON.stringify(userData));
      localStorage.setItem("ecofinds-token", data.token);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register with email
  const register = async (email, password, name) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        username: data.user.username,
        token: data.token,
      };

      setUser(userData);
      localStorage.setItem("ecofinds-user", JSON.stringify(userData));
      localStorage.setItem("ecofinds-token", data.token);
      
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    setUser(null);
    localStorage.removeItem("ecofinds-user");
    localStorage.removeItem("ecofinds-token");
  };

  // Update user data
  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem("ecofinds-user", JSON.stringify(newUserData));
  };

  // Authenticated fetch function
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('ecofinds-token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Authentication required');
    }
    
    return response;
  };

  // Keep user logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("ecofinds-user");
    const storedToken = localStorage.getItem("ecofinds-token");
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        userData.token = storedToken;
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem("ecofinds-user");
        localStorage.removeItem("ecofinds-token");
      }
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    authenticatedFetch,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
