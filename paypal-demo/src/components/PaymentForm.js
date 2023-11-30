import React, { useEffect, useState, useRef } from 'react';

const PaymentForm = () => {
  const [clientToken, setClientToken] = useState('');
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const dropinRef = useRef(null);
  const dropinInstance = useRef(null);

  useEffect(() => {
    async function fetchTokenFromServer() {
      try {
        const serverURL =
          process.env.NODE_ENV === 'production'
            ? '/get_client_token'
            : 'http://localhost:3001/get_client_token';

        const response = await fetch(serverURL);
        if (!response.ok) {
          throw new Error('Error al obtener el token del cliente');
        }
        const { clientToken: fetchedToken } = await response.json();
        setClientToken(fetchedToken);
        setIsTokenLoaded(true);
      } catch (error) {
        setError('Error al obtener el token del cliente: ' + error.message);
        console.error('Error al obtener el token del cliente:', error);
      }
    }

    fetchTokenFromServer();
  }, []);

  useEffect(() => {
    async function setupBraintree() {
      if (!window.braintree) {
        setError('Braintree no se ha cargado correctamente');
        console.error('Braintree no se ha cargado correctamente');
        return;
      }

      if (!clientToken || !isTokenLoaded) {
        setError('El token del cliente no está definido o no se ha cargado');
        console.error('El token del cliente no está definido o no se ha cargado');
        return;
      }

      if (!dropinRef.current) {
        setError('Contenedor no disponible');
        console.error('Contenedor no disponible');
        return;
      }

      try {
        dropinRef.current.innerHTML = '';

        dropinInstance.current = await window.braintree.dropin.create({
          authorization: clientToken,
          container: dropinRef.current,
          paypal: {
            flow: 'vault'
          },
          googlePay: {
            environment: 'TEST',
            merchantId: 'your-merchant-id',
            buttonColor: 'black',
            buttonType: 'long'
          },
          card: {
            cardholderName: {
              required: true
            }
          }
        });

        console.log('Braintree configurado correctamente');
      } catch (error) {
        setError('Error al configurar Braintree: ' + error.message);
        console.error('Error al configurar Braintree:', error);
      }
    }

    if (isTokenLoaded) {
      setupBraintree();
    }
  }, [clientToken, isTokenLoaded]);

  const handlePayment = async () => {
    try {
      setError(null);

      if (!dropinInstance.current) {
        setError('Instancia de Braintree no inicializada');
        console.error('Instancia de Braintree no inicializada');
        return;
      }

      const { nonce } = await dropinInstance.current.requestPaymentMethod();

      const response = await fetch('http://localhost:3001/make_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nonceFromTheClient: nonce, amount: '5001.00' }),
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentResult(result.transactionId);
        console.log('Pago exitoso. ID de transacción:', result.transactionId);
      } else {
        const errorResponse = await response.json();
        setError('Error en la transacción: ' + errorResponse.error);
        console.error('Error al procesar el pago:', errorResponse.error);
      }
    } catch (error) {
      setError('Error al enviar el pago: ' + error.message);
      console.error('Error al enviar el pago:', error);
    }
  };

  return (
    <div className='payment-form-div'>
      <h2>Payment Form</h2>
      <div ref={dropinRef}></div>
      <button onClick={handlePayment}>Pay</button>
      {error && <p>{error}</p>}
      {paymentResult && <p>Successful payment. Transaction's ID: {paymentResult}</p>}
    </div>
  );
};

export default PaymentForm;
