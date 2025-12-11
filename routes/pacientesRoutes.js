const express = require('express');
const PacientesRouter = express.Router();
const PacientesControllers = require('../controllers/pacientesControllers');


// Listado general
PacientesRouter.get('/', PacientesControllers.get);

// Vista crear (formulario)
PacientesRouter.get('/create', PacientesControllers.getCreateForm);

// Guardar nuevo paciente
PacientesRouter.post('/', PacientesControllers.store);

// Buscador on-demand
PacientesRouter.get('/search', PacientesControllers.search);
PacientesRouter.get('/buscar', PacientesControllers.search);

// Vista editar
PacientesRouter.get('/edit/:id', PacientesControllers.edit);

// Actualizar paciente
PacientesRouter.post('/update/:id', PacientesControllers.update);

// Activar
PacientesRouter.post('/activar/:id', PacientesControllers.activar);

// Inactivar
PacientesRouter.post('/inactivar/:id', PacientesControllers.inactivar);

module.exports = PacientesRouter;

