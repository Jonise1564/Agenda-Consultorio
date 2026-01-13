// const express = require("express");
// const router = express.Router();

// const { showLogin, login, logout } = require("../controllers/authController");

// // Vista login
// router.get("/login", showLogin);

// // Procesar login
// router.post("/login", login);

// // Logout
// router.get("/logout", logout);

// module.exports = router;


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', (req, res) => res.render('auth/login'));
router.post('/login', authController.login);
router.post('/registro-paciente', authController.registroPaciente);

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    res.clearCookie('token_acceso');
    res.redirect('/auth/login');
});

module.exports = router;