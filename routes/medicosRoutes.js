const express = require('express');
const MedicosRouter = express.Router();
const MedicosControllers = require('../controllers/medicosControllers');

// Listado con paginación y búsqueda
MedicosRouter.get('/', MedicosControllers.get);

// Creación
MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
MedicosRouter.post('/', MedicosControllers.store);

// Edición (Cambiado de /edit a /editar para coincidir con el PUG)
MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// Estados (Soporta GET para facilitar el redirect y POST para mayor seguridad)
MedicosRouter.route('/inactivar/:id_medico')
    .get(MedicosControllers.inactivar)
    .post(MedicosControllers.inactivar);

MedicosRouter.route('/activar/:id_medico')
    .get(MedicosControllers.activar)
    .post(MedicosControllers.activar);

// Buscadores y Helpers API
MedicosRouter.get('/buscar', MedicosControllers.buscar);
MedicosRouter.get('/:id_medico/especialidades', MedicosControllers.especialidadesActivas);

module.exports = MedicosRouter;