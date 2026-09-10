What about this 

// Replace these with YOUR Firebase project's config values.
// Get them from: Firebase Console → Project settings → General → "Your apps" → SDK setup and configuration
// See FIREBASE_SETUP.md for the full walkthrough.
const firebaseConfig = {
  apiKey: "AIzaSyAM5oAUkVBP3GII7CExMktMj6iE4erZu-M",
  authDomain: "lagme-store.firebaseapp.com",
  projectId: "lagme-store",
  storageBucket: "lagme-store.firebasestorage.app",
  messagingSenderId: "276950478630",
  appId: "1:276950478630:web:9b78b2ce543fd84f3e5be7",
};

firebase.initializeApp(firebaseConfig);
// Firestore powers products, orders, reviews, wishlists, and saved carts.
// You must turn on "Cloud Firestore" in the Firebase console (Build →
// Firestore Database → Create database) and paste in the rules from
// firestore.rules — see FIRESTORE_SETUP.md.
const db = firebase.firestore();
