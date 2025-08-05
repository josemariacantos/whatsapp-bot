const connectDB = require('./db');

async function saveUser(userData) {
  const db = await connectDB();
  const collection = db.collection('usuarios');

  const existingUser = await collection.findOne({ dni: userData.dni });
  if (existingUser) {
    console.log('👤 Usuario ya registrado');
    return;
  }

  await collection.insertOne(userData);
  console.log('✅ Usuario guardado en MongoDB');
}

module.exports = saveUser;

