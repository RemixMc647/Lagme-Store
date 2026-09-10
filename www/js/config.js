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
  "owner@example.com",
];

// Paystack PUBLIC key (starts with "pk_test_" or "pk_live_").
// Get it from Paystack Dashboard → Settings → API Keys & Webhooks.
// See PAYSTACK_SETUP.md for the full walkthrough.
const PAYSTACK_PUBLIC_KEY = "PASTE_YOUR_PAYSTACK_PUBLIC_KEY_HERE";
