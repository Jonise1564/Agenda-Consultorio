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
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'dni-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });

// // --- DEFINICIÓN DE RUTAS ---

// // 1. LISTAR turnos
// router.get("/:id", TurnosController.get);

// // 2. FORMULARIO para reservar (vista)
// // CAMBIO CLAVE: Cambiamos reservarForm por establecerForm
// router.get("/reservar/:id", TurnosController.establecerForm);



// router.get('/validar-duplicado', TurnosController.validarTurnoDia);

// // 3. PROCESAR LA RESERVA
// // IMPORTANTE: El nombre en upload.single debe ser 'archivo_dni' 
// // para coincidir con tu base de datos y lo que espera el controlador.
// router.post("/reservar/:id?", upload.single('archivo_dni'), TurnosController.reservar);

// // 4. ELIMINAR turno
// router.delete("/:id", TurnosController.delete);

// router.get('/verificar-turno-paciente', TurnosController.validarTurnoDia);

// module.exports = router;




const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require('multer');
const TurnosController = require("../controllers/turnosControllers");

// --- IMPORTACIÓN DEL MIDDLEWARE DE ACCESO ---
const { verificarAcceso } = require('../middlewares/auth'); 

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

// 1. LISTAR turnos (Acceso para todos los roles logueados)
router.get("/:id", verificarAcceso([1, 2, 3]), TurnosController.get);

// 2. FORMULARIO para reservar (Acceso para todos los roles logueados)
router.get("/reservar/:id", verificarAcceso([1, 2, 3, 4]), TurnosController.establecerForm);

router.get('/validar-duplicado', verificarAcceso([1, 2, 3, 4]), TurnosController.validarTurnoDia);

// 3. PROCESAR LA RESERVA
router.post("/reservar/:id?", verificarAcceso([1, 2, 3, 4]), upload.single('archivo_dni'), TurnosController.reservar);

// 4. ELIMINAR turno (¡PROTEGIDO!)
// Solo Admin (1) y Secretaria (3) pueden eliminar turnos. 
// El Paciente (4) y el Profesional (2) no deberían poder borrar turnos así.
router.delete("/:id", verificarAcceso([1, 3]), TurnosController.delete);

router.get('/verificar-turno-paciente', verificarAcceso([1, 2, 3, 4]), TurnosController.validarTurnoDia);

module.exports = router;