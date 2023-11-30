import React, { useState } from 'react';
import PasswordScreen from './pages/PasswordScreen';
import PaymentFormScreen from './pages/PaymentFormScreen';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (password) => {
    // Validación de la contraseña: aquí podrías realizar la autenticación, por ejemplo, con una contraseña específica
    if (password === '1') {
      setIsLoggedIn(true);
    } else {
      alert('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
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
