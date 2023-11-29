const express = require('express');
const cors = require('cors');
const app = express();
const braintree = require('braintree');

app.use(cors());
app.use(express.json());

const gateway = new braintree.BraintreeGateway({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'hzvcq3bkt38mptyc',
    publicKey:    'ghqqgq5q88f5s46z',
    privateKey:   '48065cdbb72c2499ccb94decfe30c8fa'
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
      },
    });

    console.log('Resultado de Braintree:', result);

    if (result.success) {
      res.json({ success: true, transactionId: result.transaction.id });
    } else {
      console.error('Error en la transacción:', result.message);
      res.status(500).json({ error: 'Error en la transacción', message: result.message });
    }
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
