import React, { useState } from 'react';
import './App.css';
import Login from './Login'; 
import PaymentPortal from './PaymentPortal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  }

  return (
    <div className="App">
      <h1>Payment Portal</h1>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <PaymentPortal amount="10.00" />
      )}
    </div>
  );
}

export default App;
  