const express = require('express');
const dotenv = require('dotenv');

// Configurar dotenv para acceder a las variables de entorno
dotenv.config();

const { admin, db } = require('./firebase');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
