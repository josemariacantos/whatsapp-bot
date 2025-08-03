const express = require('express');
const router = express.Router();

// Verificación de Webhook (GET)
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFICADO');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recepción de mensajes (POST)
router.post('/', (req, res) => {
  console.log('📩 MENSAJE RECIBIDO:');
  console.dir(req.body, { depth: null });

  res.sendStatus(200); // Importante: responder 200 para que Meta no lo reintente
});

module.exports = router;
