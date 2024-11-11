import React, { useState } from 'react';
import axios from 'axios';
import PaymentPortal from './PaymentPortal'; 
import AdminDashboard from './AdminDashboard'; 

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';

    
    const data = isLogin 
      ? { email, password, accountNumber } 
      : { email, password, fullName, idNumber, accountNumber };

    try {
      const response = await axios.post(`https://localhost:443/api/${endpoint}`, data);

      if (isLogin) {
        const token = response.data.token;
        localStorage.setItem('token', token);

        
        if (response.data.userType === 'admin') {
          setIsAdmin(true); 
        } else {
          setIsAuthenticated(true); 
        }
        
        setMessage('Login successful!');
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

  if (isAuthenticated) {
    return <PaymentPortal />;
  }
  
  if (isAdmin) {
    return <AdminDashboard />; 
  }

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div>
              <label>Full Name:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
              />
            </div>
            <div>
              <label>ID Number:</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required={!isLogin}
              />
            </div>
            <div>
              <label>Account Number:</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required={!isLogin}
              />
            </div>
          </>
        )}
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
        {isLogin && (
          <div>
            <label>Account Number:</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
        )}
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>

      {message && <p>{message}</p>}

      <div>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Register' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
