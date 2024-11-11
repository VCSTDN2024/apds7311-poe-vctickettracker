import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [paymentId, setPaymentId] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchPayments = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:443/api/view-payments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data.payments)) {
        setPayments(response.data.payments);
      } else {
        console.error('Expected an array but received:', response.data);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerifyPayment = async () => {
    if (!paymentId) {
      setVerificationMessage('Please enter a Payment ID.');
      return;
    }

    const token = localStorage.getItem('token');
    setVerifying(true);

    try {
      const response = await axios.put(
        'https://localhost:443/api/resolve-payment',
        { paymentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVerificationMessage(response.data.message);
      fetchPayments();  
    } catch (error) {
      setVerificationMessage(
        'Verification failed: ' + (error.response ? error.response.data.message : error.message)
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Admin Dashboard</h2>

      
      {loading ? <p>Loading payments...</p> : null}

      <h3>Payments</h3>
      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {payments.map((payment) => (
            <li key={payment._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
              <p><strong>Payment ID:</strong> {payment._id}</p>
              <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
              <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
              <p><strong>Status:</strong> {payment.status}</p>
              <p><strong>Created At:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
              <p><strong>SWIFT Code:</strong> {payment.swiftCode || 'N/A'}</p>

              
              {payment.userDetails && payment.userDetails.fullName ? (
                <div>
                  <h4>User Details:</h4>
                  <ul style={{ listStyleType: 'none', paddingLeft: '10px' }}>
                    <li><strong>Full Name:</strong> {payment.userDetails.fullName}</li>
                    <li><strong>Email:</strong> {payment.userDetails.email}</li>
                    <li><strong>Account Number:</strong> {payment.userDetails.accountNumber}</li>
                  </ul>
                </div>
              ) : (
                <p>User details not found.</p>
              )}
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
        style={{ padding: '8px', marginRight: '10px', width: '300px' }}
      />
      <button onClick={handleVerifyPayment} disabled={verifying} style={{ padding: '8px 15px' }}>
        {verifying ? 'Verifying...' : 'Verify Payment'}
      </button>

      
      {verificationMessage && (
        <p style={{ marginTop: '10px', color: verificationMessage.includes('failed') ? 'red' : 'green' }}>
          {verificationMessage}
        </p>
      )}
    </div>
  );
};

export default AdminDashboard;
