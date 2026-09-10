# Setting up the database (Firestore)

Products, orders, reviews, wishlists, and saved carts are all stored in
Cloud Firestore, part of the same Firebase project you already created for
sign-in (see `FIREBASE_SETUP.md`). This is what turns the site from "just a
catalog" into something that behaves like Jumia or Temu — real orders,
per-account history, live inventory, ratings.

## 1. Turn on Firestore
1. Go to your project in https://console.firebase.google.com
2. Left sidebar: **Build → Firestore Database** → **Create database**
3. Choose **Production mode** (not test mode — the rules below handle
   security) and pick a region close to your customers.

## 2. Paste in the security rules
1. In Firestore, go to the **Rules** tab.
2. Open `firestore.rules` in this project, copy the whole file, and paste
   it over what's in the console.
3. **Before publishing**, edit the `isAdmin()` list near the top so it has
   the *same* email address(es) as `ADMIN_EMAILS` in `js/config.js`. These
   two lists must match, or the admin dashboard will look like it's letting
   you save changes but Firestore will silently reject them.
4. Click **Publish**.

## 3. Set your admin email
Open `js/config.js` and replace the placeholder in `ADMIN_EMAILS` with the
email you'll sign in with on `admin.html`. That email needs an account —
sign up for it once on the main site (the account/sign-up form), the same
way a customer would.

## 4. Import the starter catalog
1. Sign in at `admin.html` with your admin account.
2. On the **Products** tab, click **Import starter catalog** — this is a
   one-time button that copies everything currently in `js/products.js`
   into Firestore. Once Firestore has products, the live site reads from
   there instead of the file, and the button disappears.
3. From then on, add/edit/delete products from `admin.html` — no more
   editing `products.js` or redeploying to change what's for sale.

## What's stored where
- `products/{id}` — the catalog. `products/{id}/reviews/{id}` — reviews.
- `orders/{id}` — every order placed, with status you update from the
  admin Orders tab (pending → confirmed → shipped → delivered, etc.)
- `wishlists/{uid}` and `carts/{uid}` — one doc per signed-in customer.

## Notes
- The free "Spark" plan's Firestore quota (50K reads / 20K writes per day)
  comfortably covers a store this size.
- If you ever add more admins, update **both** `ADMIN_EMAILS` in
  `js/config.js` and the list inside `isAdmin()` in `firestore.rules`, then
  re-publish the rules.
