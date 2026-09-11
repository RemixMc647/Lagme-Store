/*
  ================================================
  SITE CONFIG — admin access + online payment
  ================================================
  None of the values below are secret; they're safe to be public
  in front-end code (unlike a Paystack SECRET key, which must never
  go in a browser file).
*/

// Emails allowed into the admin dashboard (admin.html) to manage
// products and orders. Add/remove emails as needed.
// IMPORTANT: this list must also be pasted into firestore.rules
// (the isAdmin() function) or the Firestore database will reject
// admin writes even though the dashboard lets you try them.
// See FIRESTORE_SETUP.md.
const ADMIN_EMAILS = [
  "adelabuaderemi02@gmail.com",
  "abdulrazaqqgodwinomeiza1@gmail.com",
];

// Flutterwave PUBLIC key (starts with "FLWPUBK_TEST-" or "FLWPUBK-").
// Get it from Flutterwave Dashboard → Settings → API Keys.
const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK_TEST-bd1567b16066dd22c4532c6999912be9-X";
