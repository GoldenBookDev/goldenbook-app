const { admin, db } = require('../firebase');

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password
        });
        res.status(201).send(userRecord);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.loginUser = async (req, res) => {
    // Implementa la lógica de autenticación aquí
};

exports.getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const userRecord = await admin.auth().getUser(id);
        res.status(200).send(userRecord);
    } catch (error) {
        res.status(404).send(error.message);
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    try {
        const userRecord = await admin.auth().updateUser(id, {
            email,
            password
        });
        res.status(200).send(userRecord);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await admin.auth().deleteUser(id);
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

exports.createUserData = async (req, res) => {
    const { id } = req.params;
    const userData = req.body;

    try {
        await db.collection('users').doc(id).set(userData);
        res.status(201).send({ message: 'User data created successfully' });
    } catch (error) {
        res.status(400).send(error.message);
    }
};
