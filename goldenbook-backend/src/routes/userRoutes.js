const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para la gestión de usuarios
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/data', userController.createUserData);

module.exports = router;
