import React, { useEffect, useState, useRef } from 'react';

const PaymentForm = () => {
  const [clientToken, setClientToken] = useState('');
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('');
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
          throw new Error('Error getting token from client');
        }
        const { clientToken: fetchedToken } = await response.json();
        setClientToken(fetchedToken);
        setIsTokenLoaded(true);
      } catch (error) {
        setError('Error getting token from client: ' + error.message);
      }
    }

    fetchTokenFromServer();
  }, []);

  useEffect(() => {
    async function setupBraintree() {
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
      } catch (error) {
        console.error('Braintree setup error', error);
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
        console.error('Braintree instance not initialized');
        return;
      }
  
      const { nonce } = await dropinInstance.current.requestPaymentMethod();
  
      const response = await fetch('http://localhost:3001/make_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nonceFromTheClient: nonce, amount }),
      });
  
      if (response.ok) {
        const result = await response.json();
        setPaymentResult(result.transactionId);
        console.log('Successful payment. Transaction ID:', result.transactionId);
      } else if (response.status === 500) {
        const errorResponse = await response.json();
  
        if (errorResponse.error && errorResponse.error.includes('Braintree')) {
          setError('Transaction error: ' + errorResponse.error);
          console.error('Transaction error:', errorResponse.error);
        } else {
          setError('Transaction error occurred. Please try again later.');
          console.error('Transaction error:', errorResponse.error);
        }
      }
    } catch (error) {
      console.error('Payment submission error:', error);
    }
  };  
  
  return (
    <div className='payment-form-div'>
      <h2>Payment Form</h2>
      <div ref={dropinRef}></div>
      <input
        type="text"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handlePayment}>Pay</button>
      {error && <p>{error}</p>}
      {paymentResult && <p>Successful payment. Transaction's ID: {paymentResult}</p>}
    </div>
  );
};

export default PaymentForm;
