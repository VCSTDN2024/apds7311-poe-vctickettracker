import React, { useState } from 'react';
import axios from 'axios';

const PaymentPortal = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('monero');
  const [message, setMessage] = useState('');

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      setMessage('Please enter a amount');
      return;
    }

    const token = localStorage.getItem('token'); 

    try {
      const response = await axios.post(
        'https://localhost:443/api/submit-payment',
        {
          amount: parseFloat(amount),
          currency,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Payment failed: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  return (
    <div>
      <h2>Payment Portal</h2>
      <form onSubmit={handlePaymentSubmit}>
        <div>
          <label>Currency Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
          />
        </div>
        <div>
          <label>Currency Type:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="R">R</option>
          </select>
        </div>
        <div>
          <label>Payment Method:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="monero">Monero</option>
            <option value="paypal">PayPal</option>
            <option value="swift">Swift</option>
          </select>
        </div>
        <button type="submit">Submit Payment</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PaymentPortal;
