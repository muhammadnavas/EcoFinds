import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ helper to create username
const generateUsername = (email) => {
  if (!email) return "user_" + Math.floor(100 + Math.random() * 900);
  const prefix = email.split("@")[0].slice(0, 4);
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}_${randomNum}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Google login
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const username = generateUsername(firebaseUser.email);

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      username: username,
    };

    setUser(userData);
    localStorage.setItem("ecofinds-user", JSON.stringify(userData));
  };

  // ✅ Email login
  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    const username = generateUsername(firebaseUser.email);

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email,
      username: username,
    };

    setUser(userData);
    localStorage.setItem("ecofinds-user", JSON.stringify(userData));
  };

  // ✅ Register with email
  const register = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    const username = generateUsername(firebaseUser.email);

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email,
      username: username,
    };

    setUser(userData);
    localStorage.setItem("ecofinds-user", JSON.stringify(userData));
  };

  // ✅ Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("ecofinds-user");
  };

  // ✅ Keep user logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("ecofinds-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loginWithGoogle,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
