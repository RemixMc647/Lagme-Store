function payWithPaystack(email, amountInKobo) {
  const handler = PaystackPop.setup({
    key: 'pk_test_81076a7205a315c859955fc9931f816d895f8e87',
    email: email,
    amount: amountInKobo, // amount in kobo, e.g. ₦5000 = 500000
    callback: function(response) {
      // Payment succeeded on client side — now verify on server
      fetch('/verify-payment?reference=' + response.reference)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            alert('Payment verified! Order confirmed.');
          } else {
            alert('Payment could not be verified.');
          }
        });
    },
    onClose: function() {
      alert('Payment window closed.');
    }
  });
  handler.openIframe();
}
