const mongoose = require('mongoose');

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  dni: { type: String, required: true },
  correo: { type: String, required: true },
  genero: { type: String, required: true },
}, {
  timestamps: true // agrega automáticamente createdAt y updatedAt
});

// Crear el modelo
const User = mongoose.model('User', userSchema);

module.exports = User;
