const admin = require('../firebase');

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRecord = await admin.auth().createUser({
            email,
            password
        });
        await admin.auth().generateEmailVerificationLink(email);
        res.status(201).send(userRecord);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await admin.auth().getUserByEmail(email);
        // Aquí podrías agregar lógica para validar la contraseña, si estás almacenando hashes de contraseñas en Firestore, por ejemplo.
        res.status(200).send(user);
    } catch (error) {
        res.status(401).send(error.message);
    }
};

exports.verifyEmail = async (req, res) => {
    const { email } = req.body;
    try {
        await admin.auth().generateEmailVerificationLink(email);
        res.status(200).send('Verification email sent.');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.signout = async (req, res) => {
    try {
        // Puedes implementar lógica para manejar la sesión en el backend si es necesario
        res.status(200).send('Signed out successfully.');
    } catch (error) {
        res.status(400).send(error.message);
    }
};
