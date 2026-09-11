const auth = firebase.auth();

// Hide everything immediately — nothing shows until Firebase tells us
// whether we're signed in and authorized. Prevents a flash of the wrong screen.
document.getElementById("adminGate").hidden = true;
document.getElementById("adminNotAuthorized").hidden = true;
document.getElementById("adminDashboard").hidden = true;
document.getElementById("adminSignOutBtn").hidden = true;

let allProducts = [];
let allOrders = [];
let allCoupons = [];

// ---------- Gate ----------
function showGate() {
  document.getElementById("adminLoading")?.remove();
  document.getElementById("adminGate").hidden = false;
  document.getElementById("adminNotAuthorized").hidden = true;
  document.getElementById("adminDashboard").hidden = true;
  document.getElementById("adminSignOutBtn").hidden = true;
}
function showNotAuthorized() {
  document.getElementById("adminLoading")?.remove();
  document.getElementById("adminGate").hidden = true;
  document.getElementById("adminNotAuthorized").hidden = false;
  document.getElementById("adminDashboard").hidden = true;
  document.getElementById("adminSignOutBtn").hidden = false;
}
function showDashboard() {
  document.getElementById("adminLoading")?.remove();
  document.getElementById("adminGate").hidden = true;
  document.getElementById("adminNotAuthorized").hidden = true;
  document.getElementById("adminDashboard").hidden = false;
  document.getElementById("adminSignOutBtn").hidden = false;
}

auth.onAuthStateChanged((user) => {
  if (!user) {
    showGate();
    return;
  }
  if (!ADMIN_EMAILS.includes(user.email)) {
    showNotAuthorized();
    return;
  }
  showDashboard();
  initFeeds();
});

document.getElementById("adminSignInForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const errEl = document.getElementById("adminAuthError");
  errEl.hidden = true;
  auth.signInWithEmailAndPassword(email, password).catch((err) => {
    errEl.textContent = err.message || "Sign-in failed.";
    errEl.hidden = false;
  });
});
document.getElementById("adminSignOutBtn").addEventListener("click", () => auth.signOut());
document.getElementById("notAuthSignOutBtn").addEventListener("click", () => auth.signOut());

// ---------- Tabs ----------
document.querySelectorAll(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("panelProducts").hidden = tab.dataset.tab !== "products";
    document.getElementById("panelOrders").hidden = tab.dataset.tab !== "orders";
    document.getElementById("panelCoupons").hidden = tab.dataset.tab !== "coupons";
  });
});

// ---------- Data feeds ----------
let feedsStarted = false;
function initFeeds() {
  if (feedsStarted) return;
  feedsStarted = true;

  LG.listenProducts((products) => {
    allProducts = products || [];
    renderProductsTable();
    renderStats();
    document.getElementById("seedProductsBtn").hidden = allProducts.length > 0;
  });

  LG.listenAllOrders((orders) => {
    allOrders = orders;
    renderOrdersTable();
    renderStats();
  });

  LG.listenCoupons((coupons) => {
    allCoupons = coupons || [];
    renderCouponsTable();
  });
}

// ---------- Stats ----------
function renderStats() {
  const revenue = allOrders
    .filter((o) => ["paid", "confirmed", "processing", "shipped", "delivered"].includes(o.status))
    .reduce((s, o) => s + (o.total || 0), 0);
  const pending = allOrders.filter((o) => o.status === "pending").length;
  const lowStock = allProducts.filter((p) => typeof p.stock === "number" && p.stock <= 3).length;

  document.getElementById("adminStats").innerHTML = `
    <div class="admin-stat-card"><div class="stat-value">${allOrders.length}</div><div class="stat-label">Total orders</div></div>
    <div class="admin-stat-card"><div class="stat-value">${CURRENCY_SYMBOL}${revenue.toLocaleString()}</div><div class="stat-label">Revenue</div></div>
    <div class="admin-stat-card"><div class="stat-value">${pending}</div><div class="stat-label">Pending orders</div></div>
    <div class="admin-stat-card"><div class="stat-value">${allProducts.length}</div><div class="stat-label">Products</div></div>
    <div class="admin-stat-card"><div class="stat-value">${lowStock}</div><div class="stat-label">Low stock (≤3)</div></div>
  `;
}

// ---------- Products table ----------
function renderProductsTable() {
  const body = document.getElementById("productsTableBody");
  body.innerHTML = allProducts
    .map((p) => {
      const stockHTML =
        typeof p.stock === "number"
          ? `<span class="${p.stock <= 3 ? "stock-low" : ""}">${p.stock}</span>`
          : "—";
      return `
        <tr>
          <td><img src="${p.image}" alt="" /></td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>${CURRENCY_SYMBOL}${(p.price || 0).toLocaleString()}</td>
          <td>${stockHTML}</td>
          <td>${p.badge || "—"}</td>
          <td class="admin-row-actions">
            <button class="admin-link-btn" data-edit="${p.id}">Edit</button>
            <button class="admin-link-btn danger" data-delete="${p.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");

  body.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => openProductModal(btn.dataset.edit))
  );
  body.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (confirm("Delete this product? This can't be undone.")) {
        LG.deleteProduct(btn.dataset.delete);
      }
    })
  );
}

document.getElementById("seedProductsBtn").addEventListener("click", () => {
  if (confirm("Import the starter catalog (SEED_PRODUCTS) into Firestore?")) {
    LG.seedProducts(SEED_PRODUCTS);
  }
});

// ---------- Product add/edit modal ----------
function populateCategorySelect() {
  const sel = document.getElementById("pfCategory");
  sel.innerHTML = CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("");
}

function openProductModal(id) {
  populateCategorySelect();
  const form = document.getElementById("productForm");
  form.reset();
  document.getElementById("productFormError").hidden = true;

  if (id) {
    const p = allProducts.find((prod) => prod.id === id);
    if (!p) return;
    document.getElementById("productModalTitle").textContent = "Edit product";
    document.getElementById("pfId").value = p.id;
    document.getElementById("pfName").value = p.name || "";
    document.getElementById("pfCategory").value = p.category || CATEGORIES[0];
    document.getElementById("pfPrice").value = p.price || 0;
    document.getElementById("pfOldPrice").value = p.oldPrice || "";
    document.getElementById("pfStock").value = typeof p.stock === "number" ? p.stock : 20;
    document.getElementById("pfImage").value = p.image || "";
    document.getElementById("pfBadge").value = p.badge || "";
    document.getElementById("pfDescription").value = p.description || "";
    document.getElementById("pfFlashSale").checked = !!p.flashSale;
    document.getElementById("pfSaleEndsWrap").hidden = !p.flashSale;
    document.getElementById("pfSaleEnds").value = p.saleEndsAt
      ? new Date(p.saleEndsAt).toISOString().slice(0, 16)
      : "";
  } else {
    document.getElementById("productModalTitle").textContent = "Add product";
    document.getElementById("pfId").value = "";
    document.getElementById("pfStock").value = 20;
    document.getElementById("pfFlashSale").checked = false;
    document.getElementById("pfSaleEndsWrap").hidden = true;
    document.getElementById("pfSaleEnds").value = "";
  }

  document.getElementById("productModalOverlay").classList.add("open");
}
function closeProductModal() {
  document.getElementById("productModalOverlay").classList.remove("open");
}

document.getElementById("pfFlashSale").addEventListener("change", (e) => {
  document.getElementById("pfSaleEndsWrap").hidden = !e.target.checked;
});

document.getElementById("newProductBtn").addEventListener("click", () => openProductModal(null));
document.getElementById("closeProductModal").addEventListener("click", closeProductModal);
document.getElementById("productModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "productModalOverlay") closeProductModal();
});

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("pfId").value;
  const data = {
    name: document.getElementById("pfName").value.trim(),
    category: document.getElementById("pfCategory").value,
    price: Number(document.getElementById("pfPrice").value),
    oldPrice: document.getElementById("pfOldPrice").value
      ? Number(document.getElementById("pfOldPrice").value)
      : null,
    stock: Number(document.getElementById("pfStock").value),
    image: document.getElementById("pfImage").value.trim(),
    badge: document.getElementById("pfBadge").value || null,
    description: document.getElementById("pfDescription").value.trim(),
    flashSale: document.getElementById("pfFlashSale").checked,
    saleEndsAt: document.getElementById("pfFlashSale").checked && document.getElementById("pfSaleEnds").value
      ? new Date(document.getElementById("pfSaleEnds").value).getTime()
      : null,
  };

  const btn = document.getElementById("pfSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";
  try {
    if (id) {
      await LG.updateProduct(id, data);
    } else {
      await LG.addProduct(data);
    }
    closeProductModal();
  } catch (err) {
    document.getElementById("productFormError").textContent = err.message || "Couldn't save product.";
    document.getElementById("productFormError").hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = "Save product";
  }
});

// ---------- Orders table ----------
const ORDER_STATUSES = ["pending", "paid", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function renderOrdersTable() {
  const body = document.getElementById("ordersTableBody");
  body.innerHTML = allOrders
    .map((o) => {
      const date = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString() : "—";
      const itemsSummary = (o.items || []).map((i) => `${i.name} ×${i.qty}`).join(", ");
      const statusOptions = ORDER_STATUSES.map(
        (s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`
      ).join("");
      return `
        <tr>
          <td>#${o.id.slice(-6).toUpperCase()}</td>
          <td>${o.customerName || "—"}<br><small>${o.phone || ""}</small></td>
          <td>${itemsSummary}</td>
          <td>${CURRENCY_SYMBOL}${(o.total || 0).toLocaleString()}</td>
          <td>${o.paymentMethod || "—"}</td>
          <td>${date}</td>
          <td><select data-order-id="${o.id}">${statusOptions}</select></td>
        </tr>
      `;
    })
    .join("");

  body.querySelectorAll("[data-order-id]").forEach((sel) => {
    sel.addEventListener("change", () => {
      LG.updateOrderStatus(sel.dataset.orderId, sel.value);
    });
  });
}

// ---------- Coupons table ----------
function renderCouponsTable() {
  const body = document.getElementById("couponsTableBody");
  const now = Date.now();
  body.innerHTML = allCoupons
    .map((c) => {
      const discountHTML =
        c.type === "percent" ? `${c.value}% off` : `${CURRENCY_SYMBOL}${(c.value || 0).toLocaleString()} off`;
      const minSpendHTML = c.minSpend ? `${CURRENCY_SYMBOL}${c.minSpend.toLocaleString()}` : "—";
      const expiresHTML = c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never";
      const expired = c.expiresAt && c.expiresAt < now;
      const statusHTML = expired
        ? `<span class="stock-low">Expired</span>`
        : `<span style="color:#2E7D32;font-weight:700;">Active</span>`;
      return `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td>${discountHTML}</td>
          <td>${minSpendHTML}</td>
          <td>${expiresHTML}</td>
          <td>${statusHTML}</td>
          <td class="admin-row-actions">
            <button class="admin-link-btn danger" data-delete-coupon="${c.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");

  body.querySelectorAll("[data-delete-coupon]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (confirm(`Delete coupon "${btn.dataset.deleteCoupon}"? This can't be undone.`)) {
        LG.deleteCoupon(btn.dataset.deleteCoupon);
      }
    })
  );
}

function openCouponModal() {
  document.getElementById("couponForm").reset();
  document.getElementById("couponFormError").hidden = true;
  document.getElementById("couponModalOverlay").classList.add("open");
}
function closeCouponModal() {
  document.getElementById("couponModalOverlay").classList.remove("open");
}

document.getElementById("newCouponBtn").addEventListener("click", openCouponModal);
document.getElementById("closeCouponModal").addEventListener("click", closeCouponModal);
document.getElementById("couponModalOverlay").addEventListener("click", (e) => {
  if (e.target.id === "couponModalOverlay") closeCouponModal();
});

document.getElementById("couponForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = document.getElementById("cfCode").value.trim().toUpperCase();
  const errEl = document.getElementById("couponFormError");
  if (!code) {
    errEl.textContent = "Enter a coupon code.";
    errEl.hidden = false;
    return;
  }
  const data = {
    type: document.getElementById("cfType").value,
    value: Number(document.getElementById("cfValue").value),
    minSpend: document.getElementById("cfMinSpend").value ? Number(document.getElementById("cfMinSpend").value) : null,
    expiresAt: document.getElementById("cfExpires").value
      ? new Date(document.getElementById("cfExpires").value + "T23:59:59").getTime()
      : null,
    active: true,
  };

  const btn = document.getElementById("cfSubmitBtn");
  btn.disabled = true;
  btn.textContent = "Saving...";
  try {
    await LG.addCoupon(code, data);
    closeCouponModal();
  } catch (err) {
    errEl.textContent = err.message || "Couldn't save coupon.";
    errEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = "Save coupon";
  }
});
