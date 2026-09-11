require('dotenv').config();
const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'www')));

app.get('/verify-payment', async (req, res) => {
  const transactionId = req.query.transaction_id;
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
    }
  });
  const data = await response.json();
  const verified = data.status === 'success' && data.data.status === 'successful';
  res.json({ status: verified ? 'success' : 'failed', data: data.data });
});

app.post('/send-order-email', async (req, res) => {
  const { toEmail, customerName, orderId, status, deliveryCode } = req.body;
  if (!toEmail) return res.status(400).json({ error: 'Missing toEmail' });

  const statusMessages = {
    pending: 'Your order has been received and is pending confirmation.',
    confirmed: 'Your order has been confirmed and is being prepared.',
    processing: 'Your order is being processed.',
    shipped: `Your package is on the way! Give this delivery code to the courier: ${deliveryCode || ''}`,
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled.',
  };
  const message = statusMessages[status] || `Your order status is now: ${status}`;

  try {
    await resend.emails.send({
      from: 'Lord & Grace <onboarding@resend.dev>',
      to: toEmail,
      subject: `Order #${orderId.slice(-6).toUpperCase()} update — ${status}`,
      html: `
        <p>Hi ${customerName || 'there'},</p>
        <p>${message}</p>
        <p>Order reference: #${orderId.slice(-6).toUpperCase()}</p>
        <p>— Lord & Grace</p>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
