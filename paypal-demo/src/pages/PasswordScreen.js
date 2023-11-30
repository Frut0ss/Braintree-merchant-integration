// PasswordScreen.js
import React, { useState } from 'react';
import '../css/PasswordScreen.css'; // Archivo de estilos CSS

const PasswordScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="password-screen">
      <h2>Ingresa tu contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default PasswordScreen;
