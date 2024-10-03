import React, { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register'; 
    try {
        const response = await axios.post(`https://localhost:443/api/${endpoint}`, { email, password });

        if (isLogin) {
            setMessage('Login successful! Token: ' + response.data.token);
        } else {
            setMessage('Registration successful! You can now log in.');
        }
    } catch (error) {
        
        if (error.response && error.response.data) {
           
        } else {
            setMessage(`${isLogin ? 'Login' : 'Registration'} failed: ${error.message}`);
        }
    }
};

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
          {isLogin ? ' Register' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
