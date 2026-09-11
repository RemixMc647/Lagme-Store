/*
  ================================================
  DATA LAYER — all Firestore reads/writes live here
  ================================================
  app.js and admin.js call these functions instead of talking to
  Firestore directly. You shouldn't need to edit this file.
*/

const LG = {}; // namespace so nothing here collides with other scripts

// ---------- Products ----------
// Live-updates `callback` with the full product list any time it changes
// (including admin edits from another tab/device). Returns an unsubscribe fn.
LG.listenProducts = function (callback) {
  return db
    .collection("products")
    .orderBy("name")
    .onSnapshot(
      (snap) => {
        const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(products);
      },
      (err) => {
        console.warn("Product listener failed, falling back to seed data:", err.message);
        callback(null); // signal caller to use SEED_PRODUCTS instead
      }
    );
};

LG.isProductsEmpty = async function () {
  const snap = await db.collection("products").limit(1).get();
  return snap.empty;
};

// One-time import of the starter catalog from products.js into Firestore.
// Used by the "Import starter catalog" button in admin.html.
LG.seedProducts = async function (seedList) {
  const batch = db.batch();
  seedList.forEach((p) => {
    const ref = db.collection("products").doc(String(p.id));
    const { id, ...rest } = p;
    batch.set(ref, { ...rest, stock: 20, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  });
  await batch.commit();
};

LG.addProduct = function (data) {
  return db.collection("products").add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
};

LG.updateProduct = function (id, data) {
  return db.collection("products").doc(id).set(data, { merge: true });
};

LG.deleteProduct = function (id) {
  return db.collection("products").doc(id).delete();
};

// Best-effort stock decrement after a purchase. Firestore rules only allow
// signed-in users to touch the `stock` field (nothing else), so this can't
// be used to tamper with prices or names — worst case is an inaccurate count.
LG.decrementStock = async function (items) {
  const batch = db.batch();
  for (const item of items) {
    const ref = db.collection("products").doc(String(item.id));
    try {
      const snap = await ref.get();
      if (!snap.exists) continue;
      const current = snap.data().stock;
      if (typeof current !== "number") continue;
      batch.update(ref, { stock: Math.max(0, current - item.qty) });
    } catch (e) {
      /* ignore — stock tracking is a convenience, not critical */
    }
  }
  await batch.commit().catch(() => {});
};

// ---------- Reviews ----------
// One query for the whole catalog's reviews (cheap at small-store scale) so
// product cards can show a star average without one read per product.
LG.listenAllReviews = function (callback) {
  return db.collectionGroup("reviews").onSnapshot(
    (snap) => {
      const byProduct = {};
      snap.forEach((doc) => {
        const productId = doc.ref.parent.parent.id;
        if (!byProduct[productId]) byProduct[productId] = [];
        byProduct[productId].push({ id: doc.id, ...doc.data() });
      });
      callback(byProduct);
    },
    (err) => {
      console.warn("Review listener failed:", err.message);
      callback({});
    }
  );
};

LG.addReview = function (productId, review) {
  return db
    .collection("products")
    .doc(String(productId))
    .collection("reviews")
    .add({
      ...review,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

// ---------- Orders ----------
LG.createOrder = async function (order) {
  const ref = await db.collection("orders").add({
    ...order,
    status: order.status || "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
};

LG.listenMyOrders = function (uid, callback) {
  return db
    .collection("orders")
    .where("userId", "==", uid)
    .onSnapshot(
      (snap) => {
        const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(orders);
      },
      (err) => console.warn("My-orders listener failed:", err.message)
    );
};

LG.listenAllOrders = function (callback) {
  return db.collection("orders").onSnapshot(
    (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(orders);
    },
    (err) => console.warn("All-orders listener failed:", err.message)
  );
};

LG.updateOrderStatus = function (orderId, status) {
  return db.collection("orders").doc(orderId).update({ status });
};

// ---------- Wishlist ----------
LG.listenWishlist = function (uid, callback) {
  return db
    .collection("wishlists")
    .doc(uid)
    .onSnapshot(
      (doc) => callback(doc.exists ? doc.data().productIds || [] : []),
      (err) => console.warn("Wishlist listener failed:", err.message)
    );
};

LG.setWishlist = function (uid, productIds) {
  return db.collection("wishlists").doc(uid).set({ productIds }, { merge: true });
};

// ---------- Saved cart (so the cart follows the customer across devices) ----------
LG.loadSavedCart = async function (uid) {
  const doc = await db.collection("carts").doc(uid).get();
  return doc.exists ? doc.data().items || [] : [];
};

LG.saveCart = function (uid, items) {
  return db.collection("carts").doc(uid).set({ items }, { merge: true });
};

// ---------- Order cancellation (customer, while still pending) ----------
LG.cancelOrder = function (orderId) {
  return db.collection("orders").doc(orderId).update({ status: "cancelled" });
};

// ---------- Coupons ----------
// Coupon codes are stored uppercase as the document ID itself, e.g. "WELCOME10".
LG.listenCoupons = function (callback) {
  return db.collection("coupons").onSnapshot(
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.warn("Coupon listener failed:", err.message);
      callback([]);
    }
  );
};

LG.addCoupon = function (code, data) {
  return db
    .collection("coupons")
    .doc(code)
    .set({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
};

LG.deleteCoupon = function (code) {
  return db.collection("coupons").doc(code).delete();
};

// One-time lookup used at checkout time to validate a code a customer typed in.
LG.getCoupon = async function (code) {
  const doc = await db.collection("coupons").doc(code.toUpperCase()).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// ---------- Rider live location (for delivery tracking map) ----------
LG.updateRiderLocation = function (orderId, lat, lng) {
  return db.collection("orders").doc(orderId).update({
    riderLocation: {
      lat,
      lng,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    },
  });
};

LG.clearRiderLocation = function (orderId) {
  return db.collection("orders").doc(orderId).update({
    riderLocation: firebase.firestore.FieldValue.delete(),
  });
};
