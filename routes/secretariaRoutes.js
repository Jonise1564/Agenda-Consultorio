const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const SecretariaController = require('../controllers/secretariaController');

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

// 1. VISTA PRINCIPAL
router.get('/', (req, res, next) => SecretariaController.index(req, res, next));

// 2. DISPONIBILIDAD (AJAX)
router.get('/disponibilidad', (req, res, next) => SecretariaController.disponibilidad(req, res, next));

// 3. BUSCADORES (Autocomplete)
router.get('/pacientes/buscar', (req, res, next) => SecretariaController.buscarPacientePorDNI(req, res, next));
router.get('/medicos/buscar', (req, res, next) => SecretariaController.buscarMedicos(req, res, next));

// 4. GUARDAR EL TURNO
// CAMBIO CLAVE: Quitamos el ':idTurno' porque ahora el turno puede no existir aún en la DB
router.post('/agendar', upload.single('archivo_dni'), (req, res, next) => SecretariaController.agendar(req, res, next));

module.exports = router;