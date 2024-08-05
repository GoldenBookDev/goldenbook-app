const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Configurar dotenv para acceder a las variables de entorno
dotenv.config();

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.DATABASE_URL
});

const db = admin.firestore();

module.exports = { admin, db };
