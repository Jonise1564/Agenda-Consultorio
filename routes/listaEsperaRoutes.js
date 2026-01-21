// const express = require('express');
// const router = express.Router();
// const ListaEsperaController = require('../controllers/listaEsperaController');

// // ==========================================
// // VISTAS PRINCIPALES
// // ==========================================

// // LISTAR: Muestra todos los pacientes en espera (Pendientes)
// router.get('/', ListaEsperaController.index);

// // FORM CREAR: Muestra el formulario con los selectores de Médicos/Especialidades
// router.get('/create', ListaEsperaController.create);

// // ==========================================
// // ACCIONES DE DATOS
// // ==========================================

// // GUARDAR: Procesa el formulario y captura el id_usuario_creador de la sesión
// router.post('/', ListaEsperaController.store);

// // ACTUALIZAR ESTADO: (Recomendado para Auditoría) 
// // En lugar de eliminar, permite marcar como 'No Responde' o 'Contactado'
// router.post('/actualizar-estado/:id', ListaEsperaController.actualizarEstado);

// // ELIMINAR: Para limpiezas definitivas (si realmente es necesario borrar el dato)
// router.post('/delete/:id', ListaEsperaController.eliminar);


// router.get('/secretaria/lista-espera', ListaEsperaController.index);
// router.get('/secretaria/lista-espera/asignar-turno', ListaEsperaController.asignarTurnoRapido);

// //Asignar turno desde lista de espera
// router.get('/asignar-turno', listaEsperaController.asignarTurnoRapido);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const ListaEsperaController = require('../controllers/listaEsperaController');

// // LISTAR: /secretaria/lista-espera/
// router.get('/', ListaEsperaController.index);

// // FORM CREAR: /secretaria/lista-espera/create
// router.get('/create', ListaEsperaController.create);

// // ASIGNAR TURNO: /secretaria/lista-espera/asignar-turno  <-- ESTA ES LA QUE FALLABA
// // Nota: Quitamos el prefijo /secretaria/lista-espera porque el router ya lo tiene
// router.get('/asignar-turno', ListaEsperaController.asignarTurnoRapido);

// // ACCIONES POST
// router.post('/', ListaEsperaController.store);
// router.post('/actualizar-estado/:id', ListaEsperaController.actualizarEstado);
// router.post('/delete/:id', ListaEsperaController.eliminar);

// module.exports = router;

const express = require('express');
const router = express.Router();
const ListaEsperaController = require('../controllers/listaEsperaController');

// 1. Ruta principal 
router.get('/', ListaEsperaController.index);

// 2. Ruta para asignar (La que da 404)
// IMPORTANTE: El nombre debe ser EXACTO al que usas en el href del botón PUG
router.get('/asignar-turno', ListaEsperaController.asignarTurnoRapido);

// 3. Otras rutas
router.get('/create', ListaEsperaController.create);
router.post('/', ListaEsperaController.store);
router.post('/actualizar-estado/:id', ListaEsperaController.actualizarEstado);
router.post('/delete/:id', ListaEsperaController.eliminar);

module.exports = router;