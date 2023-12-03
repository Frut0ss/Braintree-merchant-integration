import React, { useEffect, useState, useRef } from 'react';

const PaymentForm = () => {
  const [clientToken, setClientToken] = useState('');
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    const amountFloat = parseFloat(amount);
    if (!isNaN(amountFloat) && amountFloat > 0) {
      setError(null);
    } else {
      //setError('Please introduce the amount you want to pay');
    }
  }, [amount, isTokenLoaded]); 

  useEffect(() => {
    async function setupBraintree() {
      if (!isTokenLoaded) return;

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        return;
      }

      try {
        dropinRef.current.innerHTML = '';
        dropinInstance.current = await window.braintree.dropin.create({
          authorization: clientToken,
          container: dropinRef.current,
          paypal: {
            flow: 'checkout',
            amount: amountFloat,
            currency: 'EUR'
          },
          googlePay: {
            googlePayVersion: 2,
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: amountFloat.toFixed(2),
              currencyCode: 'EUR'
            }
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

    setupBraintree(); // Ejecutar setupBraintree en cada cambio de isTokenLoaded o amount
  }, [clientToken, isTokenLoaded, amount]);

  const isAmountValid = () => {
    const amountFloat = parseFloat(amount);
    return !isNaN(amountFloat) && amountFloat > 0;
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
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
    
        if (errorResponse.message) {
          setError('Transaction error: ' + errorResponse.message);
          console.error('Transaction error:', errorResponse.message);
        } else {
          setError('Transaction error occurred. Please try again later.');
          console.error('Transaction error:', errorResponse.error);
        }
      } else {
        setError('Payment declined. Please check your payment details and try again.');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      setError('Payment submission error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }; 

  return (
    <div className='payment-form-div'>
      <h2>Payment Form</h2>
      <div ref={dropinRef}></div>
      <input
        style={{ marginTop: '20px' }}
        type="text"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {!isAmountValid() && (
        <p>Please introduce a valid amount to proceed with the payment.</p>
      )}
      {isLoading ? (
        <div className="loading-icon"></div>
      ) : (
        isAmountValid() && (
          <div className='block-button'>
            <button onClick={handlePayment} disabled={isLoading}>
              Pay
            </button>
          </div>
        )
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {paymentResult && (
        <p style={{ color: 'green' }}>Successful payment! Transaction's ID: <b>{paymentResult}</b></p>
      )}
    </div>
  );
};

export default PaymentForm;
