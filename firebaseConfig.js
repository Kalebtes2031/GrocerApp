// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; // Import Realtime Database if needed
// Import additional Firebase modules as needed

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBio2dIbgE-nFegeTKVNuuzFxmX9VBuYG8",
  authDomain: "yason-7c405.firebaseapp.com",
  projectId: "yason-7c405",
  storageBucket: "yason-7c405.firebasestorage.app",
  messagingSenderId: "704310350921",
  appId: "1:704310350921:web:c0a7b7a44dd37faaa61b98",
  measurementId: "G-D0JTF4SRZ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional: Only available on supported platforms
const database = getDatabase(app);    // Initialize Realtime Database

export { app, analytics, database };
