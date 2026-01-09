// const express = require("express");
// const router = express.Router();
// const TurnosController = require("../controllers/turnosControllers");

// // FORMULARIO reservar turno
// router.get("/reservar/:id", TurnosController.reservarForm);
// router.post("/reservar/:id", TurnosController.reservar);

// // ELIMINAR turno
// router.delete("/:id", TurnosController.delete);

// // LISTAR turnos 
// router.get("/:id", TurnosController.get);

// // routes/turnos.js
// const multer = require('multer');
// const upload = multer({ dest: 'public/uploads/dnis/' }); // Carpeta donde se guardarán
// const turnosController = require('../controllers/turnosController');

// // El nombre 'fotocopia_dni' debe coincidir con el 'name' del input en el PUG
// router.post('/', upload.single('fotocopia_dni'), turnosController.store);

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const path = require('path');
// const multer = require('multer');
// const TurnosController = require("../controllers/turnosControllers");

// // --- CONFIGURACIÓN DE MULTER ---
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/uploads/dnis/');
//     },
//     filename: (req, file, cb) => {
//         // Formato: dni-1704356789.jpg
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'dni-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// // --- DEFINICIÓN DE RUTAS ---

// // 1. LISTAR turnos de una agenda específica
// router.get("/:id", TurnosController.get);

// // 2. FORMULARIO para reservar (vista)
// router.get("/reservar/:id", TurnosController.reservarForm);

// // 3. PROCESAR LA RESERVA (Aquí unificamos todo con Multer)
// // Usamos el ID opcional :id? por si es un turno nuevo o uno existente
// router.post("/reservar/:id?", upload.single('fotocopia_dni'), TurnosController.reservar);

// // 4. ELIMINAR turno
// router.delete("/:id", TurnosController.delete);

// module.exports = router;

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

// 3. PROCESAR LA RESERVA
// IMPORTANTE: El nombre en upload.single debe ser 'archivo_dni' 
// para coincidir con tu base de datos y lo que espera el controlador.
router.post("/reservar/:id?", upload.single('archivo_dni'), TurnosController.reservar);

// 4. ELIMINAR turno
router.delete("/:id", TurnosController.delete);

module.exports = router;