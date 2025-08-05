// saveUser.js
const User = require('./models/User');

function normalizeNumber(num) {
  return (num || '').replace(/\D/g, ''); // Solo deja números
}

async function saveUser(userData) {
  try {
    if (!userData.whatsapp) {
      console.warn('saveUser: falta campo whatsapp en userData', userData);
      return null;
    }

    // Normalizar número antes de guardar
    const whatsappNormalized = normalizeNumber(userData.whatsapp);

    const filter = { whatsapp: whatsappNormalized };
    const update = {
      nombre: userData.nombre || '',
      dni: userData.dni || '',
      correo: userData.correo || '',
      genero: userData.genero || '',
      whatsapp: whatsappNormalized
    };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    const user = await User.findOneAndUpdate(filter, update, options);
    console.log('✅ Usuario guardado/actualizado en MongoDB:', user.whatsapp);
    return user;
  } catch (err) {
    console.error('❌ Error en saveUser:', err);
    throw err;
  }
}

module.exports = saveUser;
