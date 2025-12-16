const express = require("express");
const router = express.Router();
const TurnosController = require("../controllers/turnosControllers");

// FORMULARIO reservar turno
router.get("/reservar/:id", TurnosController.reservarForm);
router.post("/reservar/:id", TurnosController.reservar);

// ELIMINAR turno
router.delete("/:id", TurnosController.delete);

// LISTAR turnos (siempre la última porque es la más genérica)
router.get("/:id", TurnosController.get);

module.exports = router;
