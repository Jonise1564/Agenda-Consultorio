const express = require('express');
const PacientesRouter = express.Router();
const PacientesControllers = require('../controllers/pacientesControllers');

// ============================================================
// BUSCADOR AJAX (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
// ============================================================
PacientesRouter.get('/buscar', PacientesControllers.buscar);

// Listado y Buscador general de la vista pacientes
PacientesRouter.get('/', PacientesControllers.get);

// Formulario de creación
PacientesRouter.get('/crear', PacientesControllers.getCreateForm);

// Guardar nuevo
PacientesRouter.post('/', PacientesControllers.store);

// Editar
PacientesRouter.get('/editar/:id', PacientesControllers.edit);
PacientesRouter.post('/update/:id', PacientesControllers.update);

// ============================================================
// ESTADOS (Soporta GET desde la tabla y POST desde la edición)
// ============================================================
PacientesRouter.route('/activar/:id')
    .get(PacientesControllers.activar)
    .post(PacientesControllers.activar);

PacientesRouter.route('/inactivar/:id')
    .get(PacientesControllers.inactivar)
    .post(PacientesControllers.inactivar);

module.exports = PacientesRouter;