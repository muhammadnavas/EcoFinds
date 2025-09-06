// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYCxqa_B7jSG3cbszJtsWsbGOfgWmB9dQ",
  authDomain: "nmit-7e454.firebaseapp.com",
  projectId: "nmit-7e454",
  storageBucket: "nmit-7e454.appspot.com",
  messagingSenderId: "735227583565",
  appId: "1:735227583565:web:76b8931acc752c3c341004",
  measurementId: "G-GHMEDT9EHX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
