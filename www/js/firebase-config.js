// Replace these with YOUR Firebase project's config values.
// Get them from: Firebase Console → Project settings → General → "Your apps" → SDK setup and configuration
// See FIREBASE_SETUP.md for the full walkthrough.

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);

// Firestore powers products, orders, reviews, wishlists, and saved carts.
// You must turn on "Cloud Firestore" in the Firebase console (Build →
// Firestore Database → Create database) and paste in the rules from
// firestore.rules — see FIRESTORE_SETUP.md.
const db = firebase.firestore();
