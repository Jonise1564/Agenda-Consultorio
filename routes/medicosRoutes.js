const express = require('express');
const MedicosRouter = express.Router()
const MedicosControllers = require('../controllers/medicosControllers');

// Index
MedicosRouter.get('/', MedicosControllers.get);

// Vista crear
MedicosRouter.get('/create', MedicosControllers.getCreateForm);

// Guardar médico
MedicosRouter.post('/', MedicosControllers.store);

// Vista editar
// MedicosRouter.get('/edit/:dni', MedicosControllers.edit);
//MedicosRouter.get('/edit/:id_medico', MedicosController.edit);
MedicosRouter.get('/edit/:id_medico', MedicosControllers.edit);

// Actualizar médico
MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// MedicosRouter.post('/update/:dni', MedicosControllers.update);

// Activar / inactivar médico
// MedicosRouter.post('/activar/:dni', MedicosControllers.activar);
// MedicosRouter.post('/inactivar/:dni', MedicosControllers.inactivar);
MedicosRouter.post('/inactivar/:id_medico', MedicosControllers.inactivar);
MedicosRouter.post('/activar/:id_medico', MedicosControllers.activar);







// Especialidades del médico
// MedicosRouter.get('/editarEsp/:dni', MedicosControllers.editarEspecialidades);

// MedicosRouter.post('/activarEsp/:Id', MedicosControllers.activarEspecialidad);
// MedicosRouter.post('/inactivarEsp/:Id', MedicosControllers.inactivarEspecialidad);

// ==============================
// API - BUSCADOR ON DEMAND
// ==============================

    // // Buscar médicos
    // MedicosRouter.get('/api/buscar', MedicosControllers.buscar);

    // // Especialidades activas del médico
    // MedicosRouter.get('/api/:id_medico/especialidades', MedicosControllers.especialidadesActivas);

module.exports = MedicosRouter;

