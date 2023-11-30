import React, { useState } from 'react';
import PasswordScreen from './pages/PasswordScreen';
import PaymentFormScreen from './pages/PaymentFormScreen';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (password) => {
    if (password === '1') {
      setIsLoggedIn(true);
    } else {
      alert('Wrong password. Try again.');
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <PasswordScreen onLogin={handleLogin} />
      ) : (
        <PaymentFormScreen />
      )}
    </div>
  );
};

export default App;
