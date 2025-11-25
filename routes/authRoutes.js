const express = require("express");
const router = express.Router();

const { showLogin, login, logout } = require("../controllers/authController");

// Vista login
router.get("/login", showLogin);

// Procesar login
router.post("/login", login);

// Logout
router.get("/logout", logout);

module.exports = router;
