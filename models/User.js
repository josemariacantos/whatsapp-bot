// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, default: '' },
  dni: { type: String, default: '' },
  correo: { type: String, default: '' },
  genero: { type: String, default: '' },
  whatsapp: { type: String, required: true, unique: true } // clave única para identificar
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
