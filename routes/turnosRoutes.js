const express = require("express");
const router = express.Router();
const TurnosController = require("../controllers/turnosControllers");

// Listar turnos de una agenda
router.get("/:id", TurnosController.get);

// Formulario reservar turno
router.get("/reservar/:id", TurnosController.reservarForm);

// Procesar reserva
router.post("/reservar/:id", TurnosController.reservar);

// Eliminar turno
router.post("/eliminar/:id", TurnosController.delete);

module.exports = router;

