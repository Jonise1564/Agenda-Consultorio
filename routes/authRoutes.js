const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// Configuración básica de Multer para recibir el archivo
const upload = multer({ dest: 'public/uploads/dnis/' });

router.get('/login', (req, res) => res.render('auth/login'));
router.post('/login', authController.login);

// AQUÍ EL CAMBIO: Agregamos upload.single('archivo_dni')
// Esto procesa el formulario y "llena" el req.body con el nombre, apellido, etc.
router.post('/registro-paciente', upload.single('archivo_dni'), authController.registroPaciente);

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    res.clearCookie('token_acceso');
    res.redirect('/auth/login');
});

module.exports = router;