// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers');


// // Listado general
// PacientesRouter.get('/', PacientesControllers.get);

// // Vista crear (formulario)
// PacientesRouter.get('/create', PacientesControllers.getCreateForm);

// // Guardar nuevo paciente
// PacientesRouter.post('/', PacientesControllers.store);

// // Buscador on-demand
// PacientesRouter.get('/search', PacientesControllers.search);
// PacientesRouter.get('/buscar', PacientesControllers.search);

// // Vista editar
// PacientesRouter.get('/edit/:id', PacientesControllers.edit);

// // Actualizar paciente
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// // Activar
// PacientesRouter.post('/activar/:id', PacientesControllers.activar);

// // Inactivar
// PacientesRouter.post('/inactivar/:id', PacientesControllers.inactivar);

// module.exports = PacientesRouter;

// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers');

// // ===========================================
// // RUTAS DE PACIENTES
// // ===========================================

// // Listado general y Buscador integrado (Todo en el método GET)
// PacientesRouter.get('/', PacientesControllers.get);

// // Vista crear (formulario)
// PacientesRouter.get('/create', PacientesControllers.getCreateForm);

// // Guardar nuevo paciente
// PacientesRouter.post('/store', PacientesControllers.store);

// // Vista editar
// PacientesRouter.get('/edit/:id', PacientesControllers.edit);

// // Actualizar paciente
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// // Activar (Cambiado a GET para coincidir con el redirect del controlador)
// PacientesRouter.get('/activar/:id', PacientesControllers.activar);

// // Inactivar (Cambiado a GET para coincidir con el redirect del controlador)
// PacientesRouter.get('/inactivar/:id', PacientesControllers.inactivar);

// module.exports = PacientesRouter;

// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers');

// // Listado y Buscador
// PacientesRouter.get('/', PacientesControllers.get);

// // Formulario de creación
// PacientesRouter.get('/create', PacientesControllers.getCreateForm);

// // Guardar nuevo (Ajustado a '/' para evitar el 404)
// PacientesRouter.post('/', PacientesControllers.store);

// // Editar
// PacientesRouter.get('/edit/:id', PacientesControllers.edit);
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// // Estados (Importante: deben ser GET si usas enlaces <a> en el PUG)
// PacientesRouter.get('/activar/:id', PacientesControllers.activar);
// PacientesRouter.get('/inactivar/:id', PacientesControllers.inactivar);

// module.exports = PacientesRouter;


// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers');

// // Listado y Buscador
// PacientesRouter.get('/', PacientesControllers.get);

// // Formulario de creación (Cambiado de /create a /crear)
// PacientesRouter.get('/crear', PacientesControllers.getCreateForm);

// // Guardar nuevo
// PacientesRouter.post('/', PacientesControllers.store);

// // Editar (Cambiado de /edit a /editar para que coincida con el PUG)
// PacientesRouter.get('/editar/:id', PacientesControllers.edit);
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// // Estados
// PacientesRouter.get('/activar/:id', PacientesControllers.activar);
// PacientesRouter.get('/inactivar/:id', PacientesControllers.inactivar);

// module.exports = PacientesRouter;

const express = require('express');
const PacientesRouter = express.Router();
const PacientesControllers = require('../controllers/pacientesControllers');

// Listado y Buscador
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