// const express = require('express');
// const router = express.Router();
// const path = require('path');
// const multer = require('multer');

// // --- IMPORTACIÓN DE CONTROLADORES ---
// const SecretariaController = require('../controllers/secretariaController');
// const ListaEsperaController = require('../controllers/listaEsperaController');

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

// // --- RUTAS DE SECRETARÍA GENERAL (Panel y Agendamiento) ---

// // Panel principal de secretaría
// router.get('/', (req, res, next) => SecretariaController.index(req, res, next));

// // Consulta de disponibilidad de horarios (AJAX)
// router.get('/disponibilidad', (req, res, next) => SecretariaController.disponibilidad(req, res, next));

// // Vista de gestión de todos los turnos (La tabla celeste con filtros)
// router.get('/turnos', (req, res, next) => SecretariaController.verListaTurnos(req, res, next));

// // --- RUTAS DE TRASLADOS Y TRANSFERENCIAS ---

// // NUEVA: Traslado individual de un turno (Desde el modal de la tabla)
// router.post('/trasladar-turno', (req, res, next) => SecretariaController.trasladarTurnoIndividual(req, res, next));

// // Acción de transferir/mover pacientes masivamente entre agendas
// router.post('/transferir-agenda', (req, res, next) => SecretariaController.transferirAgenda(req, res, next));

// // --- BÚSQUEDAS Y ACCIONES ---

// // Búsquedas dinámicas para el formulario
// router.get('/pacientes/buscar', (req, res, next) => SecretariaController.buscarPacientePorDNI(req, res, next));
// router.get('/medicos/buscar', (req, res, next) => SecretariaController.buscarMedicos(req, res, next));

// // Confirmación de turno y subida de archivo
// router.post('/agendar', upload.single('archivo_dni'), (req, res, next) => SecretariaController.agendar(req, res, next));

// // --- RUTAS DE LISTA DE ESPERA ---

// // Listado principal
// router.get('/lista-espera', (req, res, next) => ListaEsperaController.index(req, res, next));

// // Formulario de creación
// router.get('/lista-espera/create', (req, res, next) => ListaEsperaController.create(req, res, next));

// // Verificación de duplicados (AJAX)
// router.get('/lista-espera/verificar', (req, res, next) => ListaEsperaController.verificarDuplicado(req, res, next));

// // Guardar registro (POST)
// router.post('/lista-espera/store', (req, res, next) => ListaEsperaController.store(req, res, next));

// // Actualizar estado (ej: de Pendiente a Atendido)
// router.post('/lista-espera/actualizar-estado/:id', (req, res, next) => ListaEsperaController.actualizarEstado(req, res, next));

// // Eliminar de la lista
// router.post('/lista-espera/delete/:id', (req, res, next) => ListaEsperaController.eliminar(req, res, next));
// // --- RUTAS DE AUSENCIAS ---
// // Registrar la ausencia y bloquear agenda
// router.post('/ausencias/registrar', (req, res, next) => SecretariaController.registrarAusencia(req, res, next));

// // --- RUTAS DE AUSENCIAS ---
// // Registrar la ausencia y bloquear agenda
// router.post('/ausencias/registrar', (req, res, next) => SecretariaController.registrarAusencia(req, res, next));

// // NUEVA: Ruta para eliminar/habilitar la agenda (Esta es la que falta)
// router.post('/ausencias/eliminar/:id', (req, res, next) => SecretariaController.eliminarAusencia(req, res, next));


// module.exports = router;


    // const express = require('express');
    // const router = express.Router();
    // const path = require('path');
    // const multer = require('multer');

    // // --- IMPORTACIÓN DE CONTROLADORES ---
    // const SecretariaController = require('../controllers/secretariaController');
    // const ListaEsperaController = require('../controllers/listaEsperaController');

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

    // // --- RUTAS DE SECRETARÍA GENERAL (Panel y Agendamiento) ---
    // router.get('/', (req, res, next) => SecretariaController.index(req, res, next));
    // router.get('/disponibilidad', (req, res, next) => SecretariaController.disponibilidad(req, res, next));
    // router.get('/turnos', (req, res, next) => SecretariaController.verListaTurnos(req, res, next));

    // // --- RUTAS DE TRASLADOS Y TRANSFERENCIAS masivas ---
    // router.post('/trasladar-turno', (req, res, next) => SecretariaController.trasladarTurnoIndividual(req, res, next));
    // router.post('/transferir-agenda', (req, res, next) => SecretariaController.transferirAgenda(req, res, next));

    // // --- BÚSQUEDAS Y ACCIONES ---
    // router.get('/pacientes/buscar', (req, res, next) => SecretariaController.buscarPacientePorDNI(req, res, next));
    // router.get('/medicos/buscar', (req, res, next) => SecretariaController.buscarMedicos(req, res, next));
    // router.post('/agendar', upload.single('archivo_dni'), (req, res, next) => SecretariaController.agendar(req, res, next));

    // // --- RUTAS DE LISTA DE ESPERA ---
    // router.get('/lista-espera', (req, res, next) => ListaEsperaController.index(req, res, next));
    // router.get('/lista-espera/create', (req, res, next) => ListaEsperaController.create(req, res, next));
    // router.get('/lista-espera/verificar', (req, res, next) => ListaEsperaController.verificarDuplicado(req, res, next));
    // router.post('/lista-espera/store', (req, res, next) => ListaEsperaController.store(req, res, next));
    // router.post('/lista-espera/actualizar-estado/:id', (req, res, next) => ListaEsperaController.actualizarEstado(req, res, next));
    // router.post('/lista-espera/delete/:id', (req, res, next) => ListaEsperaController.eliminar(req, res, next));

    // // --- RUTAS DE AUSENCIAS (Módulo Independiente) ---

    // // 1. Ver el listado principal de ausencias 
    // router.get('/ausencias', (req, res, next) => SecretariaController.verAusencias(req, res, next));

    // // 2. Registrar nueva ausencia (Desde el modal)
    // router.post('/ausencias/registrar', (req, res, next) => SecretariaController.registrarAusencia(req, res, next));

    // // 3. Eliminar / Habilitar agenda (Botón basura)
    // router.post('/ausencias/eliminar/:id', (req, res, next) => SecretariaController.eliminarAusencia(req, res, next));


    // module.exports = router;

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// --- IMPORTACIÓN DE CONTROLADORES ---
const SecretariaController = require('../controllers/secretariaController');
const ListaEsperaController = require('../controllers/listaEsperaController');

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

// --- RUTAS DE SECRETARÍA GENERAL (Panel y Agendamiento) ---
router.get('/', (req, res, next) => SecretariaController.index(req, res, next));
router.get('/disponibilidad', (req, res, next) => SecretariaController.disponibilidad(req, res, next));
router.get('/turnos', (req, res, next) => SecretariaController.verListaTurnos(req, res, next));

// --- RUTAS DE TRASLADOS Y TRANSFERENCIAS masivas ---
router.post('/trasladar-turno', (req, res, next) => SecretariaController.trasladarTurnoIndividual(req, res, next));
router.post('/transferir-agenda', (req, res, next) => SecretariaController.transferirAgenda(req, res, next));

// --- BÚSQUEDAS Y ACCIONES ---
router.get('/pacientes/buscar', (req, res, next) => SecretariaController.buscarPacientePorDNI(req, res, next));
router.get('/medicos/buscar', (req, res, next) => SecretariaController.buscarMedicos(req, res, next));
router.post('/agendar', upload.single('archivo_dni'), (req, res, next) => SecretariaController.agendar(req, res, next));

// --- RUTAS DE LISTA DE ESPERA ---
router.get('/lista-espera', (req, res, next) => ListaEsperaController.index(req, res, next));
router.get('/lista-espera/create', (req, res, next) => ListaEsperaController.create(req, res, next));
router.get('/lista-espera/verificar', (req, res, next) => ListaEsperaController.verificarDuplicado(req, res, next));
router.post('/lista-espera/store', (req, res, next) => ListaEsperaController.store(req, res, next));
router.post('/lista-espera/actualizar-estado/:id', (req, res, next) => ListaEsperaController.actualizarEstado(req, res, next));
router.post('/lista-espera/delete/:id', (req, res, next) => ListaEsperaController.eliminar(req, res, next));

// --- RUTAS DE AUSENCIAS (Módulo Independiente) ---

// 1. Ver el listado principal de ausencias 
router.get('/ausencias', (req, res, next) => SecretariaController.verAusencias(req, res, next));

// 2. Registrar nueva ausencia (Desde el modal de creación)
router.post('/ausencias/registrar', (req, res, next) => SecretariaController.registrarAusencia(req, res, next));

// 3. Actualizar ausencia existente (Desde el modal de edición)
router.post('/ausencias/update/:id', (req, res, next) => SecretariaController.actualizarAusencia(req, res, next));

// 4. Eliminar / Habilitar agenda (Botón basura)
router.post('/ausencias/eliminar/:id', (req, res, next) => SecretariaController.eliminarAusencia(req, res, next));

//router.post('/actualizar-estado-turno', secretariaController.actualizarEstadoTurno);
router.post('/actualizar-estado-turno', (req, res, next) => SecretariaController.actualizarEstadoTurno(req, res, next));


module.exports = router;