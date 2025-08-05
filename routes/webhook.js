const express = require('express');
const router = express.Router();
const saveUser = require('../saveUser');
const { getUserState, setUserState } = require('../memory');
const axios = require('axios');
const User = require('../models/User');
const openai = require('../openaiClient');  // Cliente OpenAI

// Normalizar número (solo dígitos)
function normalizeNumber(num) {
  return (num || '').replace(/\D/g, '');
}

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

    const fromRaw = message.from; 
    const from = normalizeNumber(fromRaw); 
    const text = message.text?.body?.trim();

    let state = getUserState(from);

    // Verificar usuario en BD
    const existingUser = await User.findOne({ whatsapp: from });

    if (existingUser && state.step === 0) {
      if (['hola', 'hola!'].includes(text.toLowerCase())) {
        await sendMessage(fromRaw, `Hola ${existingUser.nombre || ''}, ya estás registrado en la Gran Bicicleteada Familiar 🎉`);
      } else {
        // Preguntar a ChatGPT y responder
        const respuesta = await preguntarChatGPT(text);
        await sendMessage(fromRaw, respuesta);
      }
      return res.sendStatus(200);
    }

    // Flujo de registro
    if (state.step === 0) {
      await sendMessage(fromRaw, '¡Hola! Bienvenido a la Gran Bicicleteada Familiar. Por favor, escribí tu nombre completo.');
      state.step = 1;
      state.data = {};
      setUserState(from, state);
    } else if (state.step === 1) {
      state.data.nombre = text;
      await sendMessage(fromRaw, 'Gracias. Ahora por favor escribí tu DNI.');
      state.step = 2;
      setUserState(from, state);
    } else if (state.step === 2) {
      state.data.dni = text;
      await sendMessage(fromRaw, 'Perfecto. Ahora escribí tu correo electrónico.');
      state.step = 3;
      setUserState(from, state);
    } else if (state.step === 3) {
      state.data.correo = text;
      await sendMessage(fromRaw, 'Casi listo. Por último, indicá tu género (Masculino/Femenino/Otro).');
      state.step = 4;
      setUserState(from, state);
    } else if (state.step === 4) {
      state.data.genero = text;
      state.data.whatsapp = from;
      await saveUser(state.data);
      await sendMessage(fromRaw, '¡Gracias por registrarte! Te esperamos en la Gran Bicicleteada Familiar 🎉');
      setUserState(from, { step: 0, data: {} });
    }

  } catch (error) {
    console.error('❌ Error al procesar el mensaje:', error);
  }

  res.sendStatus(200);
});

// Enviar mensaje WhatsApp
async function sendMessage(to, message) {
  const url = 'https://graph.facebook.com/v18.0/729200963602734/messages';
  const token = process.env.WHATSAPP_TOKEN;

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

// Preguntar a ChatGPT
async function preguntarChatGPT(pregunta) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente amable que responde preguntas relacionadas con la Gran Bicicleteada Familiar.' },
        { role: 'user', content: pregunta }
      ],
      max_tokens: 150,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Error en ChatGPT:', error);
    return 'Disculpa, tuve un problema para responder tu pregunta. Por favor intenta de nuevo más tarde.';
  }
}

module.exports = router;
