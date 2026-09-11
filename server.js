require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
