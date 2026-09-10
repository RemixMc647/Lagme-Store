/*
  NOTIFICATIONS — floating bell, order status + back-in-stock alerts.
  Self-contained: injects its own UI, stores history in localStorage per
  signed-in user. Load this AFTER app.js and orders-ui.js.
*/

(function () {
  let notifications = [];
  let uid = null;
  let prevOrderStatus = {};
  let prevStock = {};
  let ordersBaselineSet = false;
  let stockBaselineSet = false;
  let unsubNotifOrders = null;
  let unsubNotifProducts = null;

  function storageKey() {
    return `lg_notifications_${uid}`;
  }

  function loadStored() {
    try {
      notifications = JSON.parse(localStorage.getItem(storageKey())) || [];
    } catch (e) {
      notifications = [];
    }
  }

  function saveStored() {
    notifications = notifications.slice(0, 30);
    localStorage.setItem(storageKey(), JSON.stringify(notifications));
  }

  function pushNotification(message) {
    notifications.unshift({
      id: Date.now() + Math.random().toString(16).slice(2),
      message,
      time: Date.now(),
      read: false,
    });
    saveStored();
    renderBadge();
  }

  function ensureUI() {
    if (document.getElementById("notifBell")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="notifBell" class="notif-bell" style="position:fixed;bottom:90px;right:16px;z-index:999;width:48px;height:48px;border-radius:50%;background:#1A1811;color:#E4C158;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
        🔔
        <span id="notifBadge" style="display:none;position:absolute;top:-4px;right:-4px;background:#c0392b;color:#fff;font-size:11px;line-height:18px;min-width:18px;text-align:center;border-radius:9px;padding:0 4px;"></span>
      </div>
      <div id="notifPanel" style="display:none;position:fixed;bottom:145px;right:16px;z-index:999;width:280px;max-height:360px;overflow-y:auto;background:#fff;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.25);padding:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:14px;">Notifications</strong>
          <button id="notifClearAll" style="background:none;border:none;color:#999;font-size:12px;cursor:pointer;">Clear all</button>
        </div>
        <div id="notifList"></div>
      </div>
    `;
    document.body.appendChild(wrap);

    document.getElementById("notifBell").addEventListener("click", toggleNotifPanel);
    document.getElementById("notifClearAll").addEventListener("click", () => {
      notifications = [];
      saveStored();
      renderList();
      renderBadge();
    });
  }

  function toggleNotifPanel() {
    const panel = document.getElementById("notifPanel");
    const open = panel.style.display === "block";
    panel.style.display = open ? "none" : "block";
    if (!open) {
      notifications.forEach((n) => (n.read = true));
      saveStored();
      renderBadge();
      renderList();
    }
  }

  function renderBadge() {
    const badge = document.getElementById("notifBadge");
    if (!badge) return;
    const unread = notifications.filter((n) => !n.read).length;
    badge.style.display = unread > 0 ? "block" : "none";
    badge.textContent = unread > 9 ? "9+" : String(unread);
  }

  function renderList() {
    const list = document.getElementById("notifList");
    if (!list) return;
    if (notifications.length === 0) {
      list.innerHTML = `<p style="font-size:13px;color:#999;">No notifications yet.</p>`;
      return;
    }
    list.innerHTML = notifications
      .map(
        (n) => `
        <div style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px;">
          <div>${n.message}</div>
          <div style="font-size:11px;color:#999;margin-top:2px;">${new Date(n.time).toLocaleString()}</div>
        </div>
      `
      )
      .join("");
  }

  function handleOrdersForNotifications(orders) {
    if (!ordersBaselineSet) {
      orders.forEach((o) => (prevOrderStatus[o.id] = o.status));
      ordersBaselineSet = true;
      return;
    }
    orders.forEach((o) => {
      const prev = prevOrderStatus[o.id];
      if (prev !== undefined && prev !== o.status) {
        pushNotification(
          `Order #${o.id.slice(-6).toUpperCase()} is now "${o.status}"`
        );
      }
      prevOrderStatus[o.id] = o.status;
    });
  }

  function handleProductsForNotifications(products) {
    if (!products) return;
    if (!stockBaselineSet) {
      products.forEach((p) => (prevStock[p.id] = p.stock));
      stockBaselineSet = true;
      return;
    }
    const wishSet = window.wishlistIds || new Set();
    products.forEach((p) => {
      const prev = prevStock[p.id];
      const wasOut = typeof prev === "number" && prev <= 0;
      const nowIn = typeof p.stock === "number" && p.stock > 0;
      if (wasOut && nowIn && wishSet.has(p.id)) {
        pushNotification(`"${p.name}" is back in stock!`);
      }
      prevStock[p.id] = p.stock;
    });
  }

  function notifInit(user) {
    if (unsubNotifOrders) unsubNotifOrders();
    if (unsubNotifProducts) unsubNotifProducts();
    ordersBaselineSet = false;
    stockBaselineSet = false;
    prevOrderStatus = {};

    if (!user || typeof LG === "undefined") {
      const bell = document.getElementById("notifBell");
      if (bell) bell.style.display = "none";
      return;
    }

    uid = user.uid;
    loadStored();
    ensureUI();
    document.getElementById("notifBell").style.display = "flex";
    renderBadge();
    renderList();

    unsubNotifOrders = LG.listenMyOrders(uid, handleOrdersForNotifications);
    unsubNotifProducts = LG.listenProducts(handleProductsForNotifications);
  }

  // Chain onto whatever app.js already assigned, so both run.
  const prevOnAuthReady = window.onAuthReady;
  window.onAuthReady = function (user) {
    if (typeof prevOnAuthReady === "function") prevOnAuthReady(user);
    notifInit(user);
  };
})();
