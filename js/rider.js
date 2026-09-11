const auth = firebase.auth();
let activeWatchId = null;
let activeOrderId = null;
let riderOrders = [];

function showRiderGate() {
  document.getElementById("riderLoading").remove();
  document.getElementById("riderGate").hidden = false;
  document.getElementById("riderNotAuthorized").hidden = true;
  document.getElementById("riderDashboard").hidden = true;
  document.getElementById("riderSignOutBtn").hidden = true;
}
function showRiderNotAuthorized() {
  document.getElementById("riderLoading").remove();
  document.getElementById("riderGate").hidden = true;
  document.getElementById("riderNotAuthorized").hidden = false;
  document.getElementById("riderDashboard").hidden = true;
  document.getElementById("riderSignOutBtn").hidden = false;
}
function showRiderDashboard() {
  document.getElementById("riderLoading").remove();
  document.getElementById("riderGate").hidden = true;
  document.getElementById("riderNotAuthorized").hidden = true;
  document.getElementById("riderDashboard").hidden = false;
  document.getElementById("riderSignOutBtn").hidden = false;
}

auth.onAuthStateChanged((user) => {
  if (!user) {
    showRiderGate();
    return;
  }
  if (!ADMIN_EMAILS.includes(user.email)) {
    showRiderNotAuthorized();
    return;
  }
  showRiderDashboard();
  loadActiveOrders();
});

document.getElementById("riderSignInForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("riderEmail").value.trim();
  const password = document.getElementById("riderPassword").value;
  auth.signInWithEmailAndPassword(email, password).catch((err) => {
    document.getElementById("riderAuthError").hidden = false;
    document.getElementById("riderAuthError").textContent = err.message;
  });
});

document.getElementById("riderSignOutBtn").addEventListener("click", () => {
  stopSharing();
  auth.signOut();
});
document.getElementById("riderNotAuthSignOutBtn").addEventListener("click", () => auth.signOut());

function loadActiveOrders() {
  db.collection("orders")
    .where("status", "==", "shipped")
    .onSnapshot((snap) => {
      riderOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderRiderOrders();
    });
}

function renderRiderOrders() {
  const wrap = document.getElementById("riderOrdersList");
  if (riderOrders.length === 0) {
    wrap.innerHTML = `<p style="color:var(--text-soft);">No orders currently marked "shipped".</p>`;
    return;
  }
  wrap.innerHTML = riderOrders
    .map((o) => {
      const isLive = activeOrderId === o.id;
      return `
        <div class="rider-order-card">
          <strong>#${o.id.slice(-6).toUpperCase()}</strong> — ${o.customerName || ""}<br>
          <small>${o.address || ""}</small>
          <div style="margin-top:0.6rem;">
            <span class="rider-status-dot ${isLive ? "live" : "off"}"></span>
            ${isLive ? "Sharing location" : "Not sharing"}
          </div>
          <div style="margin-top:0.6rem;display:flex;gap:0.5rem;">
            ${
              isLive
                ? `<button class="btn btn-ghost btn-small" data-stop="${o.id}">Stop sharing</button>`
                : `<button class="btn btn-primary btn-small" data-start="${o.id}">Start sharing for this order</button>`
            }
          </div>
        </div>
      `;
    })
    .join("");

  wrap.querySelectorAll("[data-start]").forEach((btn) =>
    btn.addEventListener("click", () => startSharing(btn.dataset.start))
  );
  wrap.querySelectorAll("[data-stop]").forEach((btn) =>
    btn.addEventListener("click", () => stopSharing())
  );
}

function startSharing(orderId) {
  if (!navigator.geolocation) {
    alert("Your browser doesn't support location sharing.");
    return;
  }
  if (activeWatchId !== null) stopSharing();

  activeOrderId = orderId;
  activeWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      LG.updateRiderLocation(orderId, pos.coords.latitude, pos.coords.longitude).catch((err) =>
        console.error("Location update failed:", err)
      );
    },
    (err) => {
      alert("Location error: " + err.message);
      stopSharing();
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
  renderRiderOrders();
}

function stopSharing() {
  if (activeWatchId !== null) {
    navigator.geolocation.clearWatch(activeWatchId);
    activeWatchId = null;
  }
  if (activeOrderId) {
    LG.clearRiderLocation(activeOrderId).catch(() => {});
    activeOrderId = null;
  }
  renderRiderOrders();
}
