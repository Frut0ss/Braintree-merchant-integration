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
    <div className="password-screen braintree">
      <img
      src={process.env.PUBLIC_URL + '/assets/avatar.png'}
      alt="Avatar"
      className="avatar"
      />
      <h2 className='title-demo'>Welcome to my Demo</h2>
      <p className='subtitle-demo'>by: Alejandro Frutos</p>
      <p>Enter the password provided to continue</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PasswordScreen;
