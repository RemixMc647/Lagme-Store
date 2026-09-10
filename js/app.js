/*
  App logic. Edit js/config.js for admin emails/Paystack key, and manage
  products from admin.html once Firestore is set up (see FIRESTORE_SETUP.md).
*/

// ---------- State ----------
let activeCategory = "All";
let searchQuery = "";
let sortMode = "default";
let cart = []; // { id, qty }
let PRODUCTS = [];
let reviewsByProduct = {}; // { productId: [review, ...] }
let wishlistIds = new Set();
let openQuickViewId = null;

let unsubWishlist = null;
let unsubMyOrders = null;

// ---------- Helpers ----------
function formatPrice(n) {
  return CURRENCY_SYMBOL + Number(n || 0).toLocaleString();
}

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function reviewStats(productId) {
  const list = reviewsByProduct[productId] || [];
  if (list.length === 0) return { avg: 0, count: 0 };
  const sum = list.reduce((s, r) => s + (r.rating || 0), 0);
  return { avg: sum / list.length, count: list.length };
}

function starsHTML(avg) {
  const full = Math.round(avg);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function filteredProducts() {
  let list = activeCategory === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
    );
  }

  const withStats = list.map((p) => ({ p, stats: reviewStats(p.id) }));

  switch (sortMode) {
    case "price-asc":
      withStats.sort((a, b) => a.p.price - b.p.price);
      break;
    case "price-desc":
      withStats.sort((a, b) => b.p.price - a.p.price);
      break;
    case "rating":
      withStats.sort((a, b) => b.stats.avg - a.stats.avg || b.stats.count - a.stats.count);
      break;
    default:
      break;
  }

  return withStats.map((w) => w.p);
}

// ---------- Loading products + reviews from Firestore ----------
function initDataFeeds() {
  if (typeof LG === "undefined" || typeof db === "undefined") {
    // Firestore not available for some reason — just use the seed catalog.
    PRODUCTS = SEED_PRODUCTS.map((p) => ({ ...p, id: String(p.id) }));
    renderProducts();
    return;
  }

  LG.listenProducts((products) => {
    if (products === null || products.length === 0) {
      PRODUCTS = SEED_PRODUCTS.map((p) => ({ ...p, id: String(p.id) }));
    } else {
      PRODUCTS = products;
    }
    renderProducts();
    renderCart();
    if (openQuickViewId) openQuickView(openQuickViewId);
  });

  LG.listenAllReviews((byProduct) => {
    reviewsByProduct = byProduct;
    renderProducts();
    if (openQuickViewId) renderReviewsSection(openQuickViewId);
  });
}

// ---------- Rendering: category pills ----------
function renderCategoryPills() {
  const wrap = document.getElementById("categoryPills");
  const all = ["All", ...CATEGORIES];
  wrap.innerHTML = all
    .map(
      (cat) =>
        `<button class="pill${cat === activeCategory ? " active" : ""}" data-cat="${cat}">${cat}</button>`
    )
    .join("");

  wrap.querySelectorAll(".pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderCategoryPills();
      renderProducts();
    });
  });
}

// ---------- Rendering: product grid ----------
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  if (!grid) return;
  const list = filteredProducts();

  empty.hidden = list.length !== 0;
  grid.innerHTML = list.map(productCardHTML).join("");

  grid.querySelectorAll("[data-open-id]").forEach((el) => {
    el.addEventListener("click", () => openQuickView(el.dataset.openId));
  });
  grid.querySelectorAll("[data-add-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.addId);
      btn.textContent = "Added";
      btn.classList.add("added");
      setTimeout(() => {
        btn.textContent = "Add to cart";
        btn.classList.remove("added");
      }, 900);
    });
  });
  grid.querySelectorAll("[data-wish-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWishlist(btn.dataset.wishId);
    });
  });
}

function productCardHTML(p) {
  const badgeHTML = p.badge
    ? `<span class="badge${p.badge.toLowerCase() === "sale" ? " sale" : ""}">${p.badge}</span>`
    : "";
  const oldPriceHTML = p.oldPrice
    ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>`
    : "";
  const stats = reviewStats(p.id);
  const ratingHTML =
    stats.count > 0
      ? `<div class="rating-row"><span class="stars">${starsHTML(stats.avg)}</span><span class="rating-count">(${stats.count})</span></div>`
      : "";
  const outOfStock = typeof p.stock === "number" && p.stock <= 0;
  const wished = wishlistIds.has(p.id);

  return `
    <article class="product-card">
      <div class="product-media" data-open-id="${p.id}">
        ${badgeHTML}
        <button class="wish-btn${wished ? " active" : ""}" data-wish-id="${p.id}" aria-label="Toggle wishlist">${wished ? "♥" : "♡"}</button>
        ${outOfStock ? '<span class="badge out-of-stock">Out of stock</span>' : ""}
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <span class="product-name" data-open-id="${p.id}">${p.name}</span>
        ${ratingHTML}
        <div class="price-row">
          <span class="price">${formatPrice(p.price)}</span>
          ${oldPriceHTML}
        </div>
        <button class="add-btn" data-add-id="${p.id}" ${outOfStock ? "disabled" : ""}>${outOfStock ? "Out of stock" : "Add to cart"}</button>
      </div>
    </article>
  `;
}

// ---------- Quick view modal ----------
function openQuickView(id) {
  const p = getProduct(id);
  if (!p) return;
  openQuickViewId = id;
  const content = document.getElementById("quickViewContent");
  const oldPriceHTML = p.oldPrice
    ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>`
    : "";
  const outOfStock = typeof p.stock === "number" && p.stock <= 0;
  const wished = wishlistIds.has(p.id);

  content.innerHTML = `
    <div class="qv-image"><img src="${p.image}" alt="${p.name}" /></div>
    <div class="qv-body">
      <span class="product-cat">${p.category}</span>
      <h3>${p.name}</h3>
      <div id="qvRatingSummary"></div>
      <p>${p.description}</p>
      <div class="price-row">
        <span class="price">${formatPrice(p.price)}</span>
        ${oldPriceHTML}
      </div>
      <div class="qv-actions">
        <button class="btn btn-primary" id="qvAddBtn" ${outOfStock ? "disabled" : ""}>${outOfStock ? "Out of stock" : "Add to cart"}</button>
        <button class="btn btn-ghost wish-toggle${wished ? " active" : ""}" id="qvWishBtn">${wished ? "♥ Wishlisted" : "♡ Add to wishlist"}</button>
      </div>
      <div class="qv-reviews" id="qvReviews"></div>
    </div>
  `;

  if (!outOfStock) {
    document.getElementById("qvAddBtn").addEventListener("click", () => {
      addToCart(p.id);
      closeQuickView();
      openCart();
    });
  }
  document.getElementById("qvWishBtn").addEventListener("click", () => toggleWishlist(p.id));

  renderReviewsSection(id);
  document.getElementById("modalOverlay").classList.add("open");
}

function renderReviewsSection(productId) {
  const summaryEl = document.getElementById("qvRatingSummary");
  const wrap = document.getElementById("qvReviews");
  if (!wrap) return;

  const stats = reviewStats(productId);
  if (summaryEl) {
    summaryEl.innerHTML =
      stats.count > 0
        ? `<div class="rating-row"><span class="stars">${starsHTML(stats.avg)}</span><span class="rating-count">${stats.avg.toFixed(1)} (${stats.count} review${stats.count === 1 ? "" : "s"})</span></div>`
        : `<p class="no-reviews">No reviews yet — be the first.</p>`;
  }

  const list = reviewsByProduct[productId] || [];
  const listHTML = list
    .slice()
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .map(
      (r) => `
        <div class="review-item">
          <div class="review-head">
            <span class="stars">${starsHTML(r.rating)}</span>
            <span class="review-author">${r.userName || "Customer"}</span>
          </div>
          ${r.comment ? `<p class="review-comment">${r.comment}</p>` : ""}
        </div>
      `
    )
    .join("");

  const alreadyReviewed =
    typeof currentUser !== "undefined" && currentUser && list.some((r) => r.userId === currentUser.uid);

  let formHTML = "";
  if (typeof currentUser !== "undefined" && currentUser && !alreadyReviewed) {
    formHTML = `
      <form class="review-form" id="reviewForm">
        <label>Your rating
          <select id="reviewRating">
            <option value="5">★★★★★ — Excellent</option>
            <option value="4">★★★★☆ — Good</option>
            <option value="3">★★★☆☆ — Okay</option>
            <option value="2">★★☆☆☆ — Poor</option>
            <option value="1">★☆☆☆☆ — Bad</option>
          </select>
        </label>
        <label>Comment (optional)
          <textarea id="reviewComment" rows="2" maxlength="300"></textarea>
        </label>
        <button type="submit" class="btn btn-primary btn-block">Submit review</button>
      </form>
    `;
  } else if (alreadyReviewed) {
    formHTML = `<p class="review-thanks">You've already reviewed this product — thank you!</p>`;
  } else {
    formHTML = `<p class="review-signin-note">Sign in to leave a review.</p>`;
  }

  wrap.innerHTML = `
    <h4>Reviews</h4>
    ${listHTML || ""}
    ${formHTML}
  `;

  const form = document.getElementById("reviewForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const rating = Number(document.getElementById("reviewRating").value);
      const comment = document.getElementById("reviewComment").value.trim();
      LG.addReview(productId, {
        rating,
        comment,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Customer",
      });
    });
  }
}

function closeQuickView() {
  document.getElementById("modalOverlay").classList.remove("open");
  openQuickViewId = null;
}

// ---------- Wishlist ----------
function toggleWishlist(id) {
  if (typeof requireAuth === "function" && !requireAuth()) return;
  if (wishlistIds.has(id)) {
    wishlistIds.delete(id);
  } else {
    wishlistIds.add(id);
  }
  LG.setWishlist(currentUser.uid, Array.from(wishlistIds));
  renderProducts();
  if (openQuickViewId === id) openQuickView(id);
  renderWishlistDrawer();
}

function renderWishlistDrawer() {
  const wrap = document.getElementById("wishlistItems");
  if (!wrap) return;
  const items = Array.from(wishlistIds)
    .map((id) => getProduct(id))
    .filter(Boolean);

  if (items.length === 0) {
    wrap.innerHTML = `<p class="cart-empty">Your wishlist is empty.</p>`;
    return;
  }

  wrap.innerHTML = items
    .map(
      (p) => `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${formatPrice(p.price)}</div>
          <div class="qty-row">
            <button class="btn btn-primary btn-small" data-wish-add="${p.id}">Add to cart</button>
            <button class="remove-item" data-wish-remove="${p.id}">Remove</button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  wrap.querySelectorAll("[data-wish-add]").forEach((btn) =>
    btn.addEventListener("click", () => addToCart(btn.dataset.wishAdd))
  );
  wrap.querySelectorAll("[data-wish-remove]").forEach((btn) =>
    btn.addEventListener("click", () => toggleWishlist(btn.dataset.wishRemove))
  );
}

function openWishlistDrawer() {
  renderWishlistDrawer();
  document.getElementById("wishlistDrawer").classList.add("open");
  document.getElementById("wishlistOverlay").classList.add("open");
}
function closeWishlistDrawer() {
  document.getElementById("wishlistDrawer").classList.remove("open");
  document.getElementById("wishlistOverlay").classList.remove("open");
}

// ---------- Cart ----------
function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  renderCart();
  persistCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  renderCart();
  persistCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
  persistCart();
}

function persistCart() {
  if (typeof currentUser !== "undefined" && currentUser && typeof LG !== "undefined") {
    LG.saveCart(currentUser.uid, cart).catch(() => {});
  }
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const p = getProduct(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  const itemsWrap = document.getElementById("cartItems");
  const countBadge = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  if (!itemsWrap) return;

  countBadge.textContent = cartCount();
  totalEl.textContent = formatPrice(cartTotal());

  if (cart.length === 0) {
    itemsWrap.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    return;
  }

  itemsWrap.innerHTML = cart
    .map((item) => {
      const p = getProduct(item.id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}" />
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">${formatPrice(p.price)}</div>
            <div class="qty-row">
              <button class="qty-btn" data-qty-id="${p.id}" data-delta="-1">&minus;</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-qty-id="${p.id}" data-delta="1">+</button>
              <button class="remove-item" data-remove-id="${p.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  itemsWrap.querySelectorAll("[data-qty-id]").forEach((btn) => {
    btn.addEventListener("click", () => changeQty(btn.dataset.qtyId, Number(btn.dataset.delta)));
  });
  itemsWrap.querySelectorAll("[data-remove-id]").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.removeId));
  });
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("drawerOverlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("drawerOverlay").classList.remove("open");
}

// ---------- Checkout ----------
function checkout() {
  if (cart.length === 0) return;
  if (typeof requireAuth === "function" && !requireAuth()) return; // opens sign-in gate if needed
  openCheckoutDetails();
}

function openCheckoutDetails() {
  document.getElementById("checkoutName").value =
    (currentUser && currentUser.displayName) || "";
  document.getElementById("checkoutPhone").value = localStorage.getItem("lg_phone") || "";
  document.getElementById("checkoutAddress").value = localStorage.getItem("lg_address") || "";
  document.getElementById("checkoutSummaryTotal").textContent = formatPrice(cartTotal());
  closeCart();
  document.getElementById("checkoutModalOverlay").classList.add("open");
}

function closeCheckoutDetails() {
  document.getElementById("checkoutModalOverlay").classList.remove("open");
}

function readCheckoutDetails() {
  const name = document.getElementById("checkoutName").value.trim();
  const phone = document.getElementById("checkoutPhone").value.trim();
  const address = document.getElementById("checkoutAddress").value.trim();
  if (!name || !phone || !address) {
    document.getElementById("checkoutError").hidden = false;
    return null;
  }
  document.getElementById("checkoutError").hidden = true;
  localStorage.setItem("lg_phone", phone);
  localStorage.setItem("lg_address", address);
  return { name, phone, address };
}

function buildOrderPayload(details, paymentMethod, extra) {
  return {
    userId: currentUser.uid,
    userEmail: currentUser.email || "",
    customerName: details.name,
    phone: details.phone,
    address: details.address,
    items: cart.map((item) => {
      const p = getProduct(item.id);
      return { id: item.id, name: p.name, price: p.price, qty: item.qty };
    }),
    subtotal: cartTotal(),
    total: cartTotal(),
    currency: "NGN",
    paymentMethod,
    status: paymentMethod === "paystack" ? "paid" : "pending",
    ...extra,
  };
}

async function finishOrder(orderPayload) {
  await LG.createOrder(orderPayload);
  if (typeof LG.decrementStock === "function") {
    LG.decrementStock(orderPayload.items);
  }
  cart = [];
  renderCart();
  persistCart();
  closeCheckoutDetails();
}

function handleWhatsAppCheckout() {
  const details = readCheckoutDetails();
  if (!details) return;

  const lines = cart.map((item) => {
    const p = getProduct(item.id);
    return `- ${p.name} x${item.qty} (${formatPrice(p.price * item.qty)})`;
  });
  const message =
    `Hi! This is ${details.name} (${details.phone}). I'd like to order:\n\n` +
    lines.join("\n") +
    `\n\nTotal: ${formatPrice(cartTotal())}\nDelivery address: ${details.address}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const orderPayload = buildOrderPayload(details, "whatsapp");
  finishOrder(orderPayload).then(() => window.open(url, "_blank"));
}

function handlePayOnline() {
  const details = readCheckoutDetails();
  if (!details) return;

  if (typeof PaystackPop === "undefined" || PAYSTACK_PUBLIC_KEY.startsWith("PASTE_")) {
    document.getElementById("checkoutError").hidden = false;
    document.getElementById("checkoutError").textContent =
      "Online payment isn't set up yet — see PAYSTACK_SETUP.md, or use \"Order via WhatsApp\" below.";
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: currentUser.email || `${details.phone}@guest.lordandgrace`,
    amount: Math.round(cartTotal() * 100), // kobo
    currency: "NGN",
    ref: `LG-${Date.now()}`,
    metadata: { customerName: details.name, phone: details.phone },
    callback: function (response) {
      const orderPayload = buildOrderPayload(details, "paystack", {
        paystackReference: response.reference,
      });
      finishOrder(orderPayload).then(() => {
        alert("Payment received — thank you! Your order is confirmed.");
      });
    },
    onClose: function () {
      /* user closed the payment popup — nothing to do */
    },
  });
  handler.openIframe();
}

// ---------- My Orders ----------
function statusLabel(status) {
  const map = {
    pending: "Pending confirmation",
    paid: "Paid",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}
let myOrdersCache = [];

function renderMyOrders(orders) {
  myOrdersCache = orders || [];
  const wrap = document.getElementById("myOrdersList");
  if (!wrap) return;
  if (!orders || orders.length === 0) {
    wrap.innerHTML = `<p class="cart-empty">No orders yet.</p>`;
    return;
  }
  wrap.innerHTML = orders
    .map((o) => {
      const date = o.createdAt?.seconds
        ? new Date(o.createdAt.seconds * 1000).toLocaleDateString()
        : "";
      const canCancel = o.status === "pending";
      return `
        <div class="order-item" data-order-id="${o.id}">
          <div class="order-item-head">
            <span class="order-id">#${o.id.slice(-6).toUpperCase()}</span>
            <span class="order-status status-${o.status}">${statusLabel(o.status)}</span>
          </div>
          <div class="order-item-meta">${date} · ${(o.items || []).length} item(s) · ${formatPrice(o.total)}</div>
          <div class="order-item-actions">
            <button class="btn btn-ghost btn-small" data-view-order="${o.id}">View details</button>
            <button class="btn btn-ghost btn-small" data-reorder="${o.id}">Reorder</button>
            ${canCancel ? `<button class="btn btn-ghost btn-small cancel-btn" data-cancel-order="${o.id}">Cancel</button>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  wrap.querySelectorAll("[data-view-order]").forEach((btn) =>
    btn.addEventListener("click", () => openOrderDetails(btn.dataset.viewOrder))
  );
  wrap.querySelectorAll("[data-reorder]").forEach((btn) =>
    btn.addEventListener("click", () => reorderFromOrder(btn.dataset.reorder))
  );
  wrap.querySelectorAll("[data-cancel-order]").forEach((btn) =>
    btn.addEventListener("click", () => cancelMyOrder(btn.dataset.cancelOrder))
  );
}


// ---------- Auth-driven data (cart merge, wishlist, orders) ----------
window.onAuthReady = async function (user) {
  if (unsubWishlist) unsubWishlist();
  if (unsubMyOrders) unsubMyOrders();

  if (!user) {
    wishlistIds = new Set();
    renderProducts();
    renderWishlistDrawer();
    const ordersWrap = document.getElementById("myOrdersList");
    if (ordersWrap) ordersWrap.innerHTML = "";
    return;
  }

  // Merge any local (guest) cart with the customer's saved cloud cart.
  try {
    const saved = await LG.loadSavedCart(user.uid);
    saved.forEach((savedItem) => {
      const existing = cart.find((i) => i.id === savedItem.id);
      if (existing) {
        existing.qty = Math.max(existing.qty, savedItem.qty);
      } else {
        cart.push(savedItem);
      }
    });
    renderCart();
    persistCart();
  } catch (e) {
    /* ignore — cloud cart sync is a convenience */
  }

  unsubWishlist = LG.listenWishlist(user.uid, (ids) => {
    wishlistIds = new Set(ids);
    renderProducts();
    renderWishlistDrawer();
    if (openQuickViewId) openQuickView(openQuickViewId);
  });

  unsubMyOrders = LG.listenMyOrders(user.uid, renderMyOrders);
};

// ---------- Mobile nav ----------
function openNav() {
  document.getElementById("mainNav").classList.add("open");
}
function closeNav() {
  document.getElementById("mainNav").classList.remove("open");
}

// ---------- Wire up static controls ----------
function initControls() {
  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("drawerOverlay").addEventListener("click", closeCart);
  document.getElementById("checkoutBtn").addEventListener("click", checkout);

  document.getElementById("closeModal").addEventListener("click", closeQuickView);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeQuickView();
  });

  document.getElementById("menuToggle").addEventListener("click", openNav);
  document.getElementById("closeNav").addEventListener("click", closeNav);

  document.querySelectorAll(".main-nav a").forEach((link) =>
    link.addEventListener("click", closeNav)
  );

  document.getElementById("wishlistToggle").addEventListener("click", openWishlistDrawer);
  document.getElementById("closeWishlist").addEventListener("click", closeWishlistDrawer);
  document.getElementById("wishlistOverlay").addEventListener("click", closeWishlistDrawer);

  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    sortMode = e.target.value;
    renderProducts();
  });

  document.getElementById("closeCheckoutModal").addEventListener("click", closeCheckoutDetails);
  document.getElementById("checkoutModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "checkoutModalOverlay") closeCheckoutDetails();
  });
  document.getElementById("payOnlineBtn").addEventListener("click", handlePayOnline);
  document.getElementById("payWhatsAppBtn").addEventListener("click", handleWhatsAppCheckout);

  document.getElementById("year").textContent = new Date().getFullYear();
}

window.doCheckout = openCheckoutDetails;

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryPills();
  renderCart();
  initControls();
  initDataFeeds();
});
