const express = require('express');
const cors = require('cors');
const app = express();
const braintree = require('braintree');

app.use(cors());
app.use(express.json());

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: 'hzvcq3bkt38mptyc',
    publicKey: 'ghqqgq5q88f5s46z',
    privateKey: '48065cdbb72c2499ccb94decfe30c8fa'
});

app.get('/get_client_token', async (req, res) => {
    try {
        const response = await gateway.clientToken.generate({});
        res.json({ clientToken: response.clientToken });
    } catch (error) {
        console.error('Error al generar token del cliente:', error);
        res.status(500).json({ error: 'Error al generar el token del cliente' });
    }
});

app.post('/make_payment', async (req, res) => {
    try {
      const { nonceFromTheClient, amount } = req.body;
      console.log('Nonce recibido:', nonceFromTheClient, 'Monto:', amount);
  
      const result = await gateway.transaction.sale({
        amount,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true,
          storeInVaultOnSuccess: true
        },
      });
  
      console.log('Resultado de Braintree:', result);
  
      if (result.success) {
        const settledTransaction = await gateway.testing.settle(result.transaction.id);
        console.log('Transacción establecida:', settledTransaction);
        
        res.json({ success: true, transactionId: result.transaction.id });
      } else {
        console.error('Transaction error:', result.message);
        if (result.transaction && result.transaction.processorResponseText) {
          res.status(500).json({
            error: 'Transaction error',
            message: result.transaction.processorResponseText
          });
        } else {
          res.status(500).json({ error: 'Transaction error', message: result.message });
        }
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      res.status(500).json({ error: 'Error al procesar el pago' });
    }
  });

app.post('/refund_transaction', async (req, res) => {
    try {
        const { transactionId } = req.body;
        const result = await gateway.transaction.refund(transactionId);

        if (result.success) {
            // Cambiar el estado de la transacción a "settled" después del reembolso
            const settledTransaction = await gateway.testing.settle(result.transaction.id);
            console.log('Transacción reembolsada y establecida:', settledTransaction);

            res.json({ success: true, refundId: result.transaction.id });
        } else {
            console.error('Error al realizar el reembolso:', result.message);
            res.status(500).json({ error: 'Error al realizar el reembolso', message: result.message });
        }
    } catch (error) {
        console.error('Error al procesar el reembolso:', error);
        res.status(500).json({ error: 'Error al procesar el reembolso' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
