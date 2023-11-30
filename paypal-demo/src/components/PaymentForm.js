import React, { useEffect, useState, useRef } from 'react';

const PaymentForm = () => {
  const [clientToken, setClientToken] = useState('');
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const dropinRef = useRef(null);
  const dropinInstance = useRef(null); // Ref para la instancia de Braintree

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
        console.error('Error al obtener el token del cliente:', error);
      }
    }

    fetchTokenFromServer();
  }, []);

  useEffect(() => {
    async function setupBraintree() {
      if (!window.braintree) {
        console.error('Braintree no se ha cargado correctamente');
        return;
      }

      if (!clientToken || !isTokenLoaded) {
        console.error('El token del cliente no está definido o no se ha cargado');
        return;
      }

      if (!dropinRef.current) {
        console.error('Contenedor no disponible');
        return;
      }

      try {
        dropinRef.current.innerHTML = ''; // Asegúrate de que el contenedor esté vacío

        dropinInstance.current = await window.braintree.dropin.create({
          authorization: clientToken,
          container: dropinRef.current,
          // Configuración adicional para PayPal y Google Pay
          paypal: {
            flow: 'vault'
          },
          googlePay: {
            environment: 'TEST', // Usa 'PRODUCTION' en entorno de producción
            merchantId: 'your-merchant-id', // Sustituye por tu Merchant ID
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
        console.error('Error al configurar Braintree:', error);
      }
    }

    if (isTokenLoaded) {
      setupBraintree();
    }
  }, [clientToken, isTokenLoaded]);

  const handlePayment = async () => {
    try {
      if (!dropinInstance.current) {
        console.error('Instancia de Braintree no inicializada');
        return;
      }

      const { nonce } = await dropinInstance.current.requestPaymentMethod();

      const response = await fetch('http://localhost:3001/make_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nonceFromTheClient: nonce, amount: '10.00' }), // Establece el monto a pagar
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentResult(result.transactionId); // Establecer el resultado del pago
        console.log('Pago exitoso. ID de transacción:', result.transactionId);
      } else {
        console.error('Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error al enviar el pago:', error);
    }
  };

  return (
    <div className='payment-form-div'>
      <h2>Payment Form</h2>
      <div ref={dropinRef}></div>
      <button onClick={handlePayment}>Enviar Pago</button>
      {paymentResult && <p>Successful payment. Transaction's ID: {paymentResult}</p>}
    </div>
  );
};

export default PaymentForm;
