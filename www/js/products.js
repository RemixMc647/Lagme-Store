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
  },
];
