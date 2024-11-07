import React, { useState } from 'react';
import axios from 'axios';
import PaymentPortal from './PaymentPortal'; 
import AdminDashboard from './AdminDashboard'; 

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isAdmin, setIsAdmin] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    try {
      const response = await axios.post(`https://localhost:443/api/${endpoint}`, { email, password });

      if (isLogin) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
       
        if (response.data.userType === 'admin') {
          setIsAdmin(true); 
        } else {
          setIsAuthenticated(true); 
        }
        
        setMessage('Login successful! Token: ' + token);
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

      <div>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Register' : 'Login'}
        </button>
       
      </div>
    </div>
  );
};

export default Auth;
