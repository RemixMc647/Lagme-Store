# Setting up online payment (Paystack)

Customers can now pay by card/bank transfer at checkout instead of only
ordering through WhatsApp. This uses Paystack, which is built for Nigerian
businesses and settles in Naira.

## 1. Create a Paystack account
1. Go to https://dashboard.paystack.com/#/signup and register the business.
2. You can start testing immediately in **Test Mode** (toggle top-left of
   the dashboard) before your account is fully verified for live payments.

## 2. Get your public key
1. Dashboard → **Settings → API Keys & Webhooks**.
2. Copy the **Public Key** (starts with `pk_test_...` in test mode, later
   `pk_live_...` once you switch on).
3. Paste it into `js/config.js`:
   ```js
   const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx";
   ```
   **Never** paste the *Secret Key* (`sk_...`) anywhere in this project —
   it must never appear in browser code.

## 3. Test it
With the test public key in place, open the site, add something to cart,
checkout, and choose **Pay Online**. Use one of Paystack's test cards
(listed at https://paystack.com/docs/payments/test-payments/) — no real
money moves in test mode.

## 4. Go live
1. Finish Paystack's business verification (Settings → Preferences).
2. Switch the dashboard to **Live Mode**, copy the live public key
   (`pk_live_...`), and replace it in `js/config.js`.

## Important limitation — please read
This site has no backend server, so payment confirmation happens entirely
in the customer's browser: Paystack tells the browser "payment succeeded,"
and the browser then records the order. For a small store this is a
reasonable trade-off, but it means a technically determined person could
theoretically fake a "success" message without actually paying (this is
not possible with the WhatsApp checkout path, since a human confirms
payment directly).

To catch this:
- Check **Paystack Dashboard → Transactions** against **admin.html →
  Orders** before dispatching a "paid" order, especially for higher-value
  ones — the transaction reference is stored on each order
  (`paystackReference`), so you can look it up.
- If this becomes a real concern as the store grows, the fix is a small
  backend (e.g. a Firebase Cloud Function) that verifies the transaction
  with your *secret* key server-side before marking an order paid. That's
  a separate project — ask if you'd like it built.
