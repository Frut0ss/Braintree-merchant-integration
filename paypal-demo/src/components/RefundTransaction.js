import React, { useState } from 'react';

const RefundTransaction = () => {
  const [transactionId, setTransactionId] = useState('');
  const [refundId, setRefundId] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar la carga

  const handleRefund = async () => {
    try {
      setIsLoading(true); // Activa la carga al iniciar el reembolso
      const response = await fetch('http://localhost:3001/refund_transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
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
    } finally {
      setIsLoading(false); // Desactiva la carga al finalizar el reembolso (ya sea con éxito o error)
    }
  };

  return (
    <div>
      <h2>Do you want to refund a transaction?</h2>
      <input
        type="text"
        placeholder="Transaction's ID"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
      />
      {isLoading ? (
        <div className="loading-icon"></div>
      ) : (
        <button className='refund-button' onClick={handleRefund} disabled={isLoading}>
          Refund
        </button>
      )}
      {refundId && <p style={{ color: 'green' }}>Refund successfully completed! <b>{refundId}</b></p>}
      {error && <p style={{ color: 'red' }}>Error: <b>{error}</b></p>}
    </div>
  );
};

export default RefundTransaction;
