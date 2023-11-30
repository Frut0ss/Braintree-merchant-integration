import React, { useState } from 'react';

const RefundTransaction = () => {
  const [transactionId, setTransactionId] = useState('');
  const [refundId, setRefundId] = useState('');
  const [error, setError] = useState(null);

  const handleRefund = async () => {
    try {
      const response = await fetch('http://localhost:3001/refund_transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }), // Pasar el ID de la transacción que deseas reembolsar
      });

      if (response.ok) {
        const result = await response.json();
        setRefundId(result.refundId);
        console.log('Reembolso exitoso. ID de reembolso:', result.refundId);
      } else {
        const errorMessage = await response.json();
        setError(errorMessage.message || 'Error al procesar el reembolso');
      }
    } catch (error) {
      console.error('Error al realizar el reembolso:', error);
      setError('Error al realizar el reembolso');
    }
  };

  return (
    <div>
      <h2>Reembolso de Transacción</h2>
      <input
        type="text"
        placeholder="ID de transacción"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
      />
      <button onClick={handleRefund}>Reembolsar</button>
      {refundId && <p>ID de reembolso: {refundId}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default RefundTransaction;
