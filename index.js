require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');  // Importar la función de conexión

const webhook = require('./routes/webhook');

const app = express();
app.use(bodyParser.json());

// Conectar a MongoDB antes de levantar el servidor
connectDB();

app.use('/webhook', webhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
