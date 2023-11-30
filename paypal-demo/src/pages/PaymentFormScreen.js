// PaymentFormScreen.js
import React from 'react';
import PaymentForm from '../components/PaymentForm';
import '../css/PaymentFormScreen.css'; // Archivo de estilos CSS
import RefundTransaction from '../components/RefundTransaction';

const PaymentFormScreen = () => {
  return (
    <div className="payment-form-screen">
      <h2>¡Bienvenido! Ingresa tu información de pago</h2>
      <PaymentForm />
      <RefundTransaction />
    </div>
  );
};

export default PaymentFormScreen;
