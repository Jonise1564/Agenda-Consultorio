const express = require('express');
const router = express.Router();
const ListaEsperaController = require('../controllers/listaEsperaController');

// ==========================================
// VISTAS PRINCIPALES
// ==========================================

// LISTAR: Muestra todos los pacientes en espera (Pendientes)
router.get('/', ListaEsperaController.index);

// FORM CREAR: Muestra el formulario con los selectores de Médicos/Especialidades
router.get('/create', ListaEsperaController.create);

// ==========================================
// ACCIONES DE DATOS
// ==========================================

// GUARDAR: Procesa el formulario y captura el id_usuario_creador de la sesión
router.post('/', ListaEsperaController.store);

// ACTUALIZAR ESTADO: (Recomendado para Auditoría) 
// En lugar de eliminar, permite marcar como 'No Responde' o 'Contactado'
router.post('/actualizar-estado/:id', ListaEsperaController.actualizarEstado);

// ELIMINAR: Para limpiezas definitivas (si realmente es necesario borrar el dato)
router.post('/delete/:id', ListaEsperaController.eliminar);

module.exports = router;