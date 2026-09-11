/*
  ORDER DETAILS / REORDER / CANCEL
  Builds its own modal at runtime — no index.html changes needed beyond
  the <script> tag that loads this file after app.js.
*/

(function () {
  function ensureOrderModal() {
    if (document.getElementById("orderModalOverlay")) return;
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="modal-overlay" id="orderModalOverlay">
        <div class="modal" id="orderModalBox">
          <button class="close-modal" id="closeOrderModal" aria-label="Close">&times;</button>
          <div id="orderModalContent"></div>
        </div>
      </div>
    `;
    document.body.appendChild(div.firstElementChild);
    document.getElementById("closeOrderModal").addEventListener("click", closeOrderDetails);
    document.getElementById("orderModalOverlay").addEventListener("click", (e) => {
      if (e.target.id === "orderModalOverlay") closeOrderDetails();
    });
  }

  window.openOrderDetails = function (orderId) {
    const order = (window.myOrdersCache || []).find((o) => o.id === orderId);
    if (!order) return;
    ensureOrderModal();

    const date = order.createdAt?.seconds
      ? new Date(order.createdAt.seconds * 1000).toLocaleString()
      : "";

    const itemsHTML = (order.items || [])
      .map(
        (item) => `
        <div class="order-detail-item">
          <span>${item.name} x${item.qty}</span>
          <span>${formatPrice(item.price * item.qty)}</span>
        </div>
      `
      )
      .join("");

    const timeline = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIdx = timeline.indexOf(order.status);
    const timelineHTML =
      order.status === "cancelled"
        ? `<p class="order-status status-cancelled">This order was cancelled.</p>`
        : `<div class="order-timeline">${timeline
            .map((step, i) => {
              const done = currentIdx >= 0 && i <= currentIdx;
              return `<span class="timeline-step${done ? " done" : ""}">${statusLabel(step)}</span>`;
            })
            .join("")}</div>`;

    const codeHTML =
      order.deliveryCode && !["delivered", "cancelled"].includes(order.status)
        ? `<div class="delivery-code-box" style="margin:14px 0;padding:12px;border:1.5px dashed #E4C158;border-radius:8px;text-align:center;background:#FFFBF0;">
            <div style="font-size:12px;color:#777;">Delivery code — give this to the courier when your package arrives</div>
            <div style="font-size:24px;font-weight:700;letter-spacing:3px;color:#1A1811;">${order.deliveryCode}</div>
          </div>`
        : "";

    document.getElementById("orderModalContent").innerHTML = `
      <h3>Order #${order.id.slice(-6).toUpperCase()}</h3>
      <p class="order-detail-date">${date}</p>
      ${timelineHTML}
      ${codeHTML}
      <div class="order-detail-items">${itemsHTML}</div>
      <div class="order-detail-total">
        <strong>Total: ${formatPrice(order.total)}</strong>
      </div>
      <div class="order-detail-meta">
        <p><strong>Delivery to:</strong> ${order.customerName || ""}, ${order.phone || ""}</p>
        <p>${order.address || ""}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod === "flutterwave" ? "Paid online" : "WhatsApp order"}</p>
      </div>
    `;

    document.getElementById("orderModalOverlay").classList.add("open");
  };

  window.closeOrderDetails = function () {
    const overlay = document.getElementById("orderModalOverlay");
    if (overlay) overlay.classList.remove("open");
  };

  // Add every item from a past order back into the current cart.
  window.reorderFromOrder = function (orderId) {
    const order = (window.myOrdersCache || []).find((o) => o.id === orderId);
    if (!order) return;
    (order.items || []).forEach((item) => {
      const existing = cart.find((i) => i.id === item.id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        cart.push({ id: item.id, qty: item.qty });
      }
    });
    renderCart();
    persistCart();
    openCart();
  };

  window.cancelMyOrder = function (orderId) {
    if (!confirm("Cancel this order?")) return;
    LG.cancelOrder(orderId).catch((err) => {
      alert("Couldn't cancel this order: " + err.message);
    });
  };
})();
