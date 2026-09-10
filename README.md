# Lord & Grace — Multipurpose Enterprises

A full storefront for Lord & Grace: cosmetics, toiletries, footwear, makeup, clothing, perfume, and phone accessories. Plain HTML/CSS/JavaScript (no build step, no framework) backed by Firebase for accounts, a live product catalog, orders, reviews, wishlists, and an admin dashboard — the same kind of feature set as Jumia or Temu, sized for a small store.

## Features
- **Accounts** — email/password or Google sign-in (see `FIREBASE_SETUP.md`)
- **Live product catalog** — managed from `admin.html`, no redeploying to change what's for sale
- **Search, category filters, and sorting** (price, top rated)
- **Ratings & reviews** — customers can rate and review anything they've seen
- **Wishlist** — saved per account, synced across devices
- **Cart synced to your account** — starts a cart on your phone, finish it on desktop
- **Real online payment** via Paystack (card/bank transfer), alongside the original WhatsApp checkout (see `PAYSTACK_SETUP.md`)
- **Order history & tracking** — customers see their past orders and status (pending → confirmed → shipped → delivered) under Account → My Orders
- **Admin dashboard** (`admin.html`) — add/edit/delete products, track stock, and update order status, restricted to the email(s) in `js/config.js`

## What's in here

```
index.html          → the storefront page
admin.html           → the admin dashboard (products + orders)
css/style.css        → storefront styling
css/admin.css         → admin dashboard styling
js/config.js          → admin emails + Paystack public key
js/products.js        → STARTER CATALOG ONLY — a one-time import into Firestore, then edit products from admin.html instead
js/firebase-config.js → your Firebase project keys (see FIREBASE_SETUP.md)
js/db.js              → all Firestore reads/writes (products, orders, reviews, wishlist, cart)
js/auth.js            → sign-in/sign-up
js/app.js             → storefront behavior (cart, checkout, search, reviews, wishlist)
js/admin.js           → admin dashboard behavior
assets/               → the logo lives here; add your own product photos here too if you don't want to link external ones
firestore.rules        → database security rules (paste into Firebase console)
```

Setup guides: `FIREBASE_SETUP.md` (accounts) → `FIRESTORE_SETUP.md` (database + admin) → `PAYSTACK_SETUP.md` (online payment). Do them in that order — each depends on the one before it.

## Managing products: `admin.html`, not `js/products.js`

Once Firestore is set up (`FIRESTORE_SETUP.md`) and you've imported the
starter catalog once, **add, edit, and delete products from `admin.html`**
— changes appear on the live site immediately, for every visitor, with no
redeploy. `js/products.js` is only the one-time starter data; editing it
after the import won't change anything customers see.

To change categories: edit the `CATEGORIES` list near the top of
`js/products.js` (used for both the starter import and the admin dashboard's
category dropdown) — each product's `category` must match one of these
exactly: Cosmetics, Toiletries, Footwear, Makeup, Clothing, Perfume, Phone
Accessories.

### Using your own images
Two options:
1. **Link to an image already online** — paste the URL into `image: "..."`.
2. **Upload your own photo** — drop the image file into the `assets` folder (e.g. `assets/lipstick.jpg`), then set `image: "assets/lipstick.jpg"`.

The current catalog uses placeholder images so the site works out of the box — replace every `image` field with a real product photo when you're ready to go live.

### Currency and contact details
At the top of `js/products.js`:
```js
const CURRENCY_SYMBOL = "₦";
const WHATSAPP_NUMBER = "2348068418941"; // 0806 841 8941, in international format
const CONTACT_PHONE_DISPLAY = "0806 841 8941";
const FACEBOOK_URL = "https://www.facebook.com/share/19fsA89pAr/";
const STORE_ADDRESS = "Shop 116 Dick road, Aleshinloye way, Ibadan";
```
- `CURRENCY_SYMBOL` is set to Naira (₦) — that's what's shown on every price.
- `WHATSAPP_NUMBER` is where "Checkout" sends the customer's order as a pre-filled message. There's no payment gateway built in; this is the simplest way to take orders without setting up a backend — you confirm the order and payment directly with the customer over WhatsApp. If the number ever changes, update it here in full international format with no `+` or spaces.
- `CONTACT_PHONE_DISPLAY`, `FACEBOOK_URL`, and `STORE_ADDRESS` are shown in the footer. The phone number and Facebook link are also referenced directly in `index.html` (header, nav, hero button, and footer) — if either ever changes, update them in both `products.js` and `index.html`.

### The logo
`assets/lord-and-grace-logo.jpg` is your logo, shown in a gold-ringed circle in the header and footer. Replace that file with a new export (keep the same filename) if the logo is ever redesigned.

## How to put this on GitHub and make it live

1. Create a new repository on GitHub (e.g. `lord-and-grace-store`).
2. Upload all the files in this folder, keeping the same folder structure (`css/`, `js/`, `assets/`, `index.html`, this `README.md`).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch", pick the `main` branch and `/ (root)` folder, then save.
5. GitHub gives you a live URL after a minute or two, usually `https://your-username.github.io/lord-and-grace-store/`.

Any time you push a change to GitHub (e.g. to `index.html` or the theme colors), the live site updates automatically within a minute. Product changes go through `admin.html` instead and show up immediately, with no push needed.

## Notes

- Signed-in customers get a saved cart (follows them across devices), a wishlist, and order history. A guest's cart still resets on refresh, same as before — signing in (required at checkout) picks it back up.
- The site uses the black-and-gold theme throughout, with a scrolling promo strip at the top for announcements (edit the text directly in `index.html`, inside `.promo-strip`) and a "Quality Products / Affordable Prices / Reliable Service / Shop With Confidence" trust strip under the hero.
- Customers can check out with real online payment (Paystack) or the original WhatsApp flow — both are available side-by-side at checkout — and can also reach you via the WhatsApp/call number or Facebook page, linked in the header and footer, with the shop address shown in the footer.
- This is a Capacitor project (`android/`) — after changing anything in `www/`, run `npx cap sync android` before rebuilding the Android app so it picks up the changes. The root-level copies (`index.html`, `css/`, `js/`, etc.) are what GitHub Pages serves and must be kept identical to `www/`.
