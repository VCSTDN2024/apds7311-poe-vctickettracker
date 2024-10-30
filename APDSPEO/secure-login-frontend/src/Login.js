import React, { useState } from 'react';
import axios from 'axios';
import PaymentPortal from './PaymentPortal'; // Make sure to import the PaymentPortal component

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPaymentPortal, setShowPaymentPortal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const response = await axios.post(`https://localhost:443/api/${endpoint}`, { email, password });

      if (isLogin) {
        setMessage('Login successful! Token: ' + response.data.token);
        setShowPaymentPortal(true); // Show the payment portal after successful login
      } else {
        setMessage('Registration successful! You can now log in.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(`${isLogin ? 'Login' : 'Registration'} failed: ${error.response.data.message}`);
      } else {
        setMessage(`${isLogin ? 'Login' : 'Registration'} failed: ${error.message}`);
      }
    }
  };

  return (
    <div>
      {!showPaymentPortal ? (
        <>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>

          {message && <p>{message}</p>}
        </>
      ) : (
        <PaymentPortal amount="10.00" /> // You can adjust the amount as needed
      )}
    </div>
  );
};

export default Auth;

