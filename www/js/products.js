/*
  ================================================
  STARTER CATALOG (seed data only)
  ================================================
  Products now live in Firestore, managed from admin.html, so they can be
  added/edited/removed without redeploying the site and stay in sync across
  every visitor's browser.

  This file is only used once: the "Import starter catalog" button in
  admin.html copies SEED_PRODUCTS into Firestore the first time you set the
  site up. After that, edit products from admin.html instead — changes here
  won't affect the live site once Firestore has data.

  If Firestore isn't configured yet (see FIRESTORE_SETUP.md), the site falls
  back to showing SEED_PRODUCTS directly so it still works out of the box.
*/

const CURRENCY_SYMBOL = "₦"; // Lord & Grace sells in Naira

// Checkout sends the order as a pre-filled WhatsApp message (no payment backend needed).
// Use the full number with country code and no + or spaces, e.g. "2348012345678"
const WHATSAPP_NUMBER = "2348068418941";

// Customer-facing contact details shown in the header/footer
const CONTACT_PHONE_DISPLAY = "0806 841 8941";
const FACEBOOK_URL = "https://www.facebook.com/share/19fsA89pAr/";
const STORE_ADDRESS = "Shop 116 Dick road, Aleshinloye way, Ibadan";

const CATEGORIES = [
  "Cosmetics",
  "Toiletries",
  "Footwear",
  "Makeup",
  "Clothing",
  "Perfume",
  "Phone Accessories",
  "Jewelry",
  "Home & Kitchen",
  "Gadgets",
];

// Icon shown per category on the homepage category grid (Temu/Jumia-style).
// Add an entry here if you add a new category above.
const CATEGORY_ICONS = {
  Cosmetics: "💄",
  Toiletries: "🧴",
  Footwear: "👟",
  Makeup: "💅",
  Clothing: "👗",
  Perfume: "🌸",
  "Phone Accessories": "🎧",
  Jewelry: "💍",
  "Home & Kitchen": "🍽️",
  Gadgets: "🔌",
};

// Homepage banner carousel slides. Edit freely — add/remove slides,
// change the text, colors, or link. `href` can be "#catalog" to jump to
// the shop, or "#catalog?cat=Perfume" style is not auto-parsed — for a
// category deep link just use "#catalog" and let shoppers browse.
const BANNER_SLIDES = [
  {
    eyebrow: "Beauty, Style & More For You",
    title: "All You Need,<br>All In One Place.",
    sub: "Cosmetics, toiletries, footwear, makeup, clothing, perfume and phone accessories — quality products at affordable prices.",
    cta: "Shop the catalog",
    href: "#catalog",
    gradient: "linear-gradient(120deg, #9C7C1D 0%, #E4C158 100%)",
  },
  {
    eyebrow: "⚡ Limited Time",
    title: "Flash Sales<br>Up To 40% Off.",
    sub: "Grab today's flash deals before the countdown runs out — new drops added regularly.",
    cta: "View flash sales",
    href: "#flashSale",
    gradient: "linear-gradient(120deg, #C0392B 0%, #E4894F 100%)",
  },
  {
    eyebrow: "Fresh Arrivals",
    title: "New Season,<br>New Favorites.",
    sub: "Fresh drops across clothing, footwear and accessories — updated every week.",
    cta: "Explore new in",
    href: "#catalog",
    gradient: "linear-gradient(120deg, #1A1811 0%, #6B5B1D 100%)",
  },
];

const SEED_PRODUCTS = [
  {
    id: 1,
    name: "Complete Cosmetic Set",
    category: "Cosmetics",
    price: 12500,
    oldPrice: 16000,
    image: "https://placehold.co/500x500/C9A227/1A1811?text=Cosmetics",
    badge: "Best Seller",
    description: "All-in-one cosmetic kit covering face, eyes, and lips.",
  },
  {
    id: 2,
    name: "Nail & Beauty Kit",
    category: "Cosmetics",
    price: 6500,
    oldPrice: null,
    image: "https://placehold.co/500x500/C9A227/1A1811?text=Beauty+Kit",
    badge: null,
    description: "Everyday beauty essentials kit for a full glow-up routine.",
  },
  {
    id: 3,
    name: "Body Wash & Lotion Set",
    category: "Toiletries",
    price: 8500,
    oldPrice: 10500,
    image: "https://placehold.co/500x500/0B0B0C/E4C158?text=Toiletries",
    badge: "Sale",
    description: "Matching body wash and lotion set for soft, fresh skin daily.",
  },
  {
    id: 4,
    name: "Family Toiletries Pack",
    category: "Toiletries",
    price: 11000,
    oldPrice: null,
    image: "https://placehold.co/500x500/0B0B0C/E4C158?text=Toiletries+Pack",
    badge: "New",
    description: "Bundle of everyday bathroom essentials for the whole home.",
  },
  {
    id: 5,
    name: "Classic Sneakers",
    category: "Footwear",
    price: 15000,
    oldPrice: 19000,
    image: "https://placehold.co/500x500/9C7C1D/FFFFFF?text=Sneakers",
    badge: "Sale",
    description: "Comfortable everyday sneakers, available in multiple sizes.",
    flashSale: true,
    saleEndsAt: Date.now() + 6 * 60 * 60 * 1000, // demo: 6 hours from page load
  },
  {
    id: 6,
    name: "Men's Formal Shoes",
    category: "Footwear",
    price: 18500,
    oldPrice: null,
    image: "https://placehold.co/500x500/9C7C1D/FFFFFF?text=Formal+Shoes",
    badge: null,
    description: "Sharp formal shoes built for both the office and events.",
  },
  {
    id: 7,
    name: "Professional Makeup Palette",
    category: "Makeup",
    price: 9500,
    oldPrice: null,
    image: "https://placehold.co/500x500/E4C158/1A1811?text=Makeup+Palette",
    badge: "Best Seller",
    description: "Blendable eyeshadow and blush palette for everyday to glam looks.",
  },
  {
    id: 8,
    name: "Matte Lipstick Set",
    category: "Makeup",
    price: 5200,
    oldPrice: 6800,
    image: "https://placehold.co/500x500/E4C158/1A1811?text=Lipstick+Set",
    badge: "Sale",
    description: "Long-lasting matte lipstick set in everyday shades.",
  },
  {
    id: 9,
    name: "Ladies' Ankara Dress",
    category: "Clothing",
    price: 14500,
    oldPrice: null,
    image: "https://placehold.co/500x500/1A1811/E4C158?text=Ankara+Dress",
    badge: "New",
    description: "Vibrant Ankara dress tailored for a flattering everyday fit.",
  },
  {
    id: 10,
    name: "Men's Casual Shirt",
    category: "Clothing",
    price: 9800,
    oldPrice: 12500,
    image: "https://placehold.co/500x500/1A1811/E4C158?text=Casual+Shirt",
    badge: "Sale",
    description: "Breathable everyday shirt that pairs well with anything.",
  },
  {
    id: 11,
    name: "Coco Chanel Inspired Perfume",
    category: "Perfume",
    price: 13500,
    oldPrice: 17000,
    image: "https://placehold.co/500x500/C9A227/FFFFFF?text=Perfume",
    badge: "Best Seller",
    description: "Long-lasting fragrance with a fresh, elegant scent profile.",
  },
  {
    id: 12,
    name: "Daisy Inspired Perfume",
    category: "Perfume",
    price: 12000,
    oldPrice: null,
    image: "https://placehold.co/500x500/C9A227/FFFFFF?text=Perfume",
    badge: "New",
    description: "Light floral fragrance, perfect for daytime wear.",
  },
  {
    id: 13,
    name: "20W Fast USB-C Charger",
    category: "Phone Accessories",
    price: 8500,
    oldPrice: 11000,
    image: "https://placehold.co/500x500/9C7C1D/FFFFFF?text=Charger",
    badge: "Best Seller",
    description: "Compact fast charger that tops up most phones in under an hour.",
  },
  {
    id: 14,
    name: "Wireless Earbuds Pro",
    category: "Phone Accessories",
    price: 15500,
    oldPrice: 19000,
    image: "https://placehold.co/500x500/9C7C1D/FFFFFF?text=Earbuds",
    badge: "Sale",
    description: "Bluetooth earbuds with a full-day charging case battery life.",
    flashSale: true,
    saleEndsAt: Date.now() + 3 * 60 * 60 * 1000, // demo: 3 hours from page load
  },
  {
    id: 15,
    name: "2-in-1 Hair Straightener Comb",
    category: "Cosmetics",
    price: 8500,
    oldPrice: null,
    image: "images/hair-straightener-comb.jpg",
    badge: "New",
    description: "Ceramic straightening comb brush — smooths and styles in one pass. Available in red, black/pink, teal and white.",
  },
  {
    id: 16,
    name: "Bamboo-Print Round Plates (Set of 3) — B1007",
    category: "Home & Kitchen",
    price: 700,
    oldPrice: null,
    image: "images/bamboo-plates-b1007.jpg",
    badge: null,
    description: "Durable round plates with a bamboo-look finish. Price shown is per plate.",
  },
  {
    id: 17,
    name: "Manual Fruit & Vegetable Juicer",
    category: "Home & Kitchen",
    price: 12000,
    oldPrice: null,
    image: "images/fruit-veg-juicer.jpg",
    badge: "New",
    description: "Hand-crank juicer for fresh fruit and vegetable juice — no electricity needed.",
  },
  {
    id: 18,
    name: "Rechargeable Neck Fan (SX-5011)",
    category: "Gadgets",
    price: 8300,
    oldPrice: null,
    image: "images/neck-fan-sx5011.jpg",
    badge: "New",
    description: "Portable hands-free neck fan, 2000mAh battery, 3 speeds, bladeless design.",
  },
  {
    id: 19,
    name: "Heating Menstrual Belt",
    category: "Gadgets",
    price: 15000,
    oldPrice: null,
    image: "images/menstrual-heating-belt.jpg",
    badge: "New",
    description: "Adjustable heat therapy belt for period cramp relief, with digital display and adjustable strap. Comes gift-boxed.",
  },
];
