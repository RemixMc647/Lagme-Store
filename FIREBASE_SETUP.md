# Setting up Sign In / Sign Up (Firebase)

The code for accounts is already built into the site (`js/auth.js`, plus the
account button and modal in `index.html`). You just need to create a free
Firebase project and drop your project's keys into `js/firebase-config.js`.

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com
2. "Add project" → name it (e.g. `lord-and-grace-store`) → follow the prompts
   (Google Analytics is optional, you can skip it)

## 2. Turn on the sign-in methods you want
1. In the left sidebar: **Build → Authentication** → "Get started"
2. Go to the **Sign-in method** tab
3. Enable **Email/Password**
4. Enable **Google** as well (needed for the "Continue with Google" button) —
   pick a support email when prompted

## 3. Register a web app and get your config
1. In Project settings (gear icon, top left) → scroll to **"Your apps"**
2. Click the **</>** (web) icon → give it a nickname (e.g. `store-web`) →
   Register app
3. Firebase shows you a `firebaseConfig` object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "lord-and-grace-store.firebaseapp.com",
     projectId: "lord-and-grace-store",
     storageBucket: "lord-and-grace-store.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```
4. Copy those real values into `js/firebase-config.js` in your project,
   replacing the `PASTE_YOUR_...` placeholders. Leave the
   `firebase.initializeApp(firebaseConfig);` line as-is.

## 4. Allow your site's domain
Firebase blocks auth requests from domains it doesn't recognize.
1. Authentication → Settings → **Authorized domains**
2. Add your GitHub Pages domain, e.g. `remixmc647.github.io`
   (`localhost` is already allowed by default, for testing)

## 5. Push the updated `firebase-config.js` and test
Once the real keys are in place and committed/pushed, open your live site:
- Tap the account icon (top right) → try **Sign Up** with a test email
- Add something to cart → **Checkout on WhatsApp** — if you're signed out,
  it'll now stop you and ask you to sign in first, then continue the WhatsApp
  order automatically once you're signed in.

## Where to see your registered users
Firebase Console → Authentication → **Users** tab shows everyone who's signed
up, their email, and when they last signed in.

## Notes
- Passwords are handled entirely by Firebase — nothing password-related is
  stored in your own code or repo.
- The free "Spark" plan covers this comfortably (10K verifications/month) —
  no billing needed for a store this size.
- If you ever want order history stored per-account (not just sent via
  WhatsApp), that's a further step using Firestore — let me know if you want
  that built next.
