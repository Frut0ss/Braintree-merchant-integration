// PaymentFormScreen.js
import React from 'react';
import PaymentForm from '../components/PaymentForm';
import '../css/PaymentFormScreen.css'; // Archivo de estilos CSS
import RefundTransaction from '../components/RefundTransaction';

const PaymentFormScreen = () => {
  return (
    <div className="payment-form-screen">
      <span>Back-end: Node.JS (v16.16.0)</span>
      <span>Front-end: React</span>
      <PaymentForm />
      <RefundTransaction />
    </div>
  );
};

export default PaymentFormScreen;
