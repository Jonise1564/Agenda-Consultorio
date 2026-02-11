const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require('multer');
const TurnosController = require("../controllers/turnosControllers");

// --- CONFIGURACIÓN DE MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/dnis/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'dni-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- DEFINICIÓN DE RUTAS ---

// 1. LISTAR turnos
router.get("/:id", TurnosController.get);

// 2. FORMULARIO para reservar (vista)
// CAMBIO CLAVE: Cambiamos reservarForm por establecerForm
router.get("/reservar/:id", TurnosController.establecerForm);



router.get('/validar-duplicado', TurnosController.validarTurnoDia);

// 3. PROCESAR LA RESERVA
// IMPORTANTE: El nombre en upload.single debe ser 'archivo_dni' 
// para coincidir con tu base de datos y lo que espera el controlador.
router.post("/reservar/:id?", upload.single('archivo_dni'), TurnosController.reservar);

// 4. ELIMINAR turno
router.delete("/:id", TurnosController.delete);

router.get('/verificar-turno-paciente', TurnosController.validarTurnoDia);

module.exports = router;