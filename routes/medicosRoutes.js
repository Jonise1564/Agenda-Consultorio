// const express = require('express');
// const MedicosRouter = express.Router()
// const MedicosControllers = require('../controllers/medicosControllers');

// // Index
// MedicosRouter.get('/', MedicosControllers.get);

// // Vista crear
// MedicosRouter.get('/create', MedicosControllers.getCreateForm);

// // Guardar médico
// MedicosRouter.post('/', MedicosControllers.store);

// // Vista editar
// MedicosRouter.get('/edit/:id_medico', MedicosControllers.edit);

// // Actualizar médico
// MedicosRouter.post('/update/:id_medico', MedicosControllers.update);


// // Activar / inactivar médico
// MedicosRouter.post('/inactivar/:id_medico', MedicosControllers.inactivar);
// MedicosRouter.post('/activar/:id_medico', MedicosControllers.activar);

// // Buscar Medico
// MedicosRouter.get('/buscar', MedicosControllers.buscar);

// // Especialidades activas del médico
// MedicosRouter.get('/:id_medico/especialidades', MedicosControllers.especialidadesActivas);



// module.exports = MedicosRouter;


const express = require('express');
const MedicosRouter = express.Router();
const MedicosControllers = require('../controllers/medicosControllers');

// ===================================================
// LISTAR MÉDICOS
// GET /medicos
// ===================================================
MedicosRouter.get('/', MedicosControllers.get);

// ===================================================
// FORM CREAR MÉDICO
// GET /medicos/create
// ===================================================
MedicosRouter.get('/create', MedicosControllers.getCreateForm);

// ===================================================
// CREAR MÉDICO
// POST /medicos
// ===================================================
MedicosRouter.post('/', MedicosControllers.store);

// ===================================================
// FORM EDITAR MÉDICO
// GET /medicos/edit/:id_medico
// ===================================================
MedicosRouter.get('/edit/:id_medico', MedicosControllers.edit);

// ===================================================
// ACTUALIZAR MÉDICO
// POST /medicos/update/:id_medico
// ===================================================
MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// ===================================================
// INACTIVAR / ACTIVAR
// POST /medicos/inactivar/:id_medico
// POST /medicos/activar/:id_medico
// ===================================================
MedicosRouter.post('/inactivar/:id_medico', MedicosControllers.inactivar);
MedicosRouter.post('/activar/:id_medico', MedicosControllers.activar);

// ===================================================
// BUSCADOR AJAX
// GET /medicos/buscar?q=
// ===================================================
MedicosRouter.get('/buscar', MedicosControllers.buscar);

// ===================================================
// ESPECIALIDADES ACTIVAS DEL MÉDICO
// GET /medicos/:id_medico/especialidades
// ===================================================
MedicosRouter.get('/:id_medico/especialidades', MedicosControllers.especialidadesActivas);

module.exports = MedicosRouter;


