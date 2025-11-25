const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosControllers');

// Listar usuarios
router.get('/', UsuariosController.getAll);

// Formulario login
router.get('/login', UsuariosController.showLogin);

// Procesar login
router.post('/login', UsuariosController.login);

module.exports = router;

