// ---------- Firebase Auth wiring ----------
const auth = firebase.auth();

let currentUser = null;
let pendingCheckout = false; // true when the user hit "Checkout" while signed out

function showAuthError(message) {
  const el = document.getElementById("authError");
  el.textContent = message;
  el.hidden = false;
}

function clearAuthError() {
  const el = document.getElementById("authError");
  el.hidden = true;
  el.textContent = "";
}

function openAuthModal(gate = false) {
  clearAuthError();
  document.getElementById("authGateNote").hidden = !gate;
  document.getElementById("authModalOverlay").classList.add("open");
}

function closeAuthModal() {
  document.getElementById("authModalOverlay").classList.remove("open");
  pendingCheckout = false;
}

function switchAuthTab(tab) {
  clearAuthError();
  const isSignIn = tab === "signin";
  document.getElementById("tabSignIn").classList.toggle("active", isSignIn);
  document.getElementById("tabSignUp").classList.toggle("active", !isSignIn);
  document.getElementById("signInForm").hidden = !isSignIn;
  document.getElementById("signUpForm").hidden = isSignIn;
}

function friendlyAuthError(err) {
  switch (err.code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with that email — try signing in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    default:
      return err.message || "Something went wrong. Please try again.";
  }
}

function renderAccountUI(user) {
  const signedOut = document.getElementById("authSignedOut");
  const signedIn = document.getElementById("authSignedIn");
  const accountBtn = document.getElementById("accountToggle");
  const adminLink = document.getElementById("adminDashboardLink");

  if (user) {
    signedOut.hidden = true;
    signedIn.hidden = false;
    document.getElementById("accountName").textContent = user.displayName || "there";
    document.getElementById("accountEmail").textContent = user.email || "";
    accountBtn.classList.add("signed-in");
    if (adminLink) {
      adminLink.hidden = !(typeof ADMIN_EMAILS !== "undefined" && ADMIN_EMAILS.includes(user.email));
    }
  } else {
    signedOut.hidden = false;
    signedIn.hidden = true;
    accountBtn.classList.remove("signed-in");
    if (adminLink) adminLink.hidden = true;
  }
}

auth.onAuthStateChanged((user) => {
  currentUser = user;
  renderAccountUI(user);

  // Let app.js pick up account-specific data: saved cart, wishlist, order history.
  if (typeof window.onAuthReady === "function") window.onAuthReady(user);

  if (user && pendingCheckout) {
    pendingCheckout = false;
    closeAuthModal();
    // Give the modal a beat to close, then continue the order they were making.
    setTimeout(() => window.doCheckout && window.doCheckout(), 150);
  }
});

// Called by app.js instead of checking out directly.
// Returns true if already signed in (caller should proceed);
// otherwise opens the sign-in gate and returns false.
function requireAuth() {
  if (currentUser) return true;
  pendingCheckout = true;
  openAuthModal(true);
  return false;
}

function initAuthControls() {
  document.getElementById("accountToggle").addEventListener("click", () => openAuthModal(false));
  document.getElementById("closeAuthModal").addEventListener("click", closeAuthModal);
  document.getElementById("authModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "authModalOverlay") closeAuthModal();
  });

  document.getElementById("tabSignIn").addEventListener("click", () => switchAuthTab("signin"));
  document.getElementById("tabSignUp").addEventListener("click", () => switchAuthTab("signup"));

  document.getElementById("signInForm").addEventListener("submit", (e) => {
    e.preventDefault();
    clearAuthError();
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;
    auth.signInWithEmailAndPassword(email, password).catch((err) => showAuthError(friendlyAuthError(err)));
  });

  document.getElementById("signUpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    clearAuthError();
    const name = document.getElementById("signUpName").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const phone = document.getElementById("signUpPhone").value.trim();
    const password = document.getElementById("signUpPassword").value;

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        // Store name + phone on the user's profile (phone goes in displayName-adjacent
        // storage isn't native to Firebase Auth, so we keep it simple: name goes on
        // the profile, phone gets tucked into localStorage for now).
        return cred.user.updateProfile({ displayName: name }).then(() => {
          localStorage.setItem("lg_phone", phone);
        });
      })
      .catch((err) => showAuthError(friendlyAuthError(err)));
  });

  document.getElementById("googleSignInBtn").addEventListener("click", () => {
    clearAuthError();
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((err) => showAuthError(friendlyAuthError(err)));
  });

  document.getElementById("signOutBtn").addEventListener("click", () => {
    auth.signOut();
  });
}

document.addEventListener("DOMContentLoaded", initAuthControls);
