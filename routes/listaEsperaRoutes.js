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