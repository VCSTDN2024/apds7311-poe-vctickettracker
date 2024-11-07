import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [payments, setPayments] = useState([]); 
  const [paymentId, setPaymentId] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  const fetchPayments = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('https://localhost:443/api/view-payments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && Array.isArray(response.data.payments)) {
        setPayments(response.data.payments);
      } else {
        console.error('Expected an array but received:', response.data);
        setPayments([]); 
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerifyPayment = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`https://localhost:443/api/resolve-payment`, { paymentId }, {
        headers: {
          Authorization: `Bearer ${token}`
        }

      });
     
      setVerificationMessage(response.data.message);
    } catch (error) {
      
      setVerificationMessage('Verification failed: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>Payments</h3>
      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <ul>
          {payments.map(payment => (
            <li key={payment._id}>
              {payment.amount} {payment.currency} (ID: {payment._id})
            </li>
          ))}
        </ul>
      )}
      <h3>Verify Payment</h3>
      <input
        type="text"
        value={paymentId}
        onChange={(e) => setPaymentId(e.target.value)}
        placeholder="Enter Payment ID"
      />
      <button onClick={handleVerifyPayment}>Verify</button>
      {verificationMessage && <p>{verificationMessage}</p>}
    </div>
  );
};

export default AdminDashboard;
