const express = require('express');
const router = express.Router();
const saveUser = require('../saveUser');
const { getUserState, setUserState } = require('../memory');
const axios = require('axios');

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
router.post('/', async (req, res) => {
  console.log('📩 MENSAJE RECIBIDO:');
  console.dir(req.body, { depth: null });

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from; // número del usuario
    const text = message.text?.body?.trim();

    let state = getUserState(from);

    if (state.step === 0) {
      await sendMessage(from, '¡Hola! Bienvenido a la Gran Bicicleteada Familiar. Por favor, escribí tu nombre completo.');
      state.step = 1;
      state.data = {};
      setUserState(from, state);
    } else if (state.step === 1) {
      state.data.nombre = text;
      await sendMessage(from, 'Gracias. Ahora por favor escribí tu DNI.');
      state.step = 2;
      setUserState(from, state);
    } else if (state.step === 2) {
      state.data.dni = text;
      await sendMessage(from, 'Perfecto. Ahora escribí tu correo electrónico.');
      state.step = 3;
      setUserState(from, state);
    } else if (state.step === 3) {
      state.data.correo = text;
      await sendMessage(from, 'Casi listo. Por último, indicá tu género (Masculino/Femenino/Otro).');
      state.step = 4;
      setUserState(from, state);
    } else if (state.step === 4) {
      state.data.genero = text;

      // Guardar en MongoDB
      await saveUser(state.data);

      await sendMessage(from, '¡Gracias por registrarte! Te esperamos en la Gran Bicicleteada Familiar 🎉');

      // Reset
      setUserState(from, { step: 0, data: {} });
    }

  } catch (error) {
    console.error('❌ Error al procesar el mensaje:', error);
  }

  res.sendStatus(200);
});

// Función para enviar mensajes
async function sendMessage(to, message) {
  const url = 'https://graph.facebook.com/v18.0/729200963602734/messages'
  const token = process.env.WHATSAPP_TOKEN;
 // Reemplazá con tus valores reales

  try {
    await axios.post(url, {
      messaging_product: 'whatsapp',
      to,
      text: { body: message }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('❌ Error al enviar mensaje:', err.response?.data || err.message);
  }
}

module.exports = router;
