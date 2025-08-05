const User = require('./models/User');

// Función para guardar un usuario en la base de datos
async function saveUser(userData) {
  try {
    const user = new User(userData);
    await user.save();
    console.log('✅ Usuario guardado en MongoDB:', user);
  } catch (error) {
    console.error('❌ Error al guardar el usuario en MongoDB:', error);
  }
}

module.exports = saveUser;
