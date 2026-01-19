// const express = require('express');
// const MedicosRouter = express.Router();
// const MedicosControllers = require('../controllers/medicosControllers');

// // Listado con paginación y búsqueda
// MedicosRouter.get('/', MedicosControllers.get);

// // Creación
// MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
// MedicosRouter.post('/', MedicosControllers.store);

// // Edición (Cambiado de /edit a /editar para coincidir con el PUG)
// MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
// MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// // Estados (Soporta GET para facilitar el redirect y POST para mayor seguridad)
// MedicosRouter.route('/inactivar/:id_medico')
//     .get(MedicosControllers.inactivar)
//     .post(MedicosControllers.inactivar);

// MedicosRouter.route('/activar/:id_medico')
//     .get(MedicosControllers.activar)
//     .post(MedicosControllers.activar);

// // Buscadores y Helpers API
// MedicosRouter.get('/buscar', MedicosControllers.buscar);
// MedicosRouter.get('/:id_medico/especialidades', MedicosControllers.especialidadesActivas);

// module.exports = MedicosRouter;


// const express = require('express');
// const MedicosRouter = express.Router();
// const MedicosControllers = require('../controllers/medicosControllers');
// // Importamos el middleware
// const { verificarAcceso } = require('../middlewares/auth');

// /**
//  * APLICAR RESTRICCIÓN GLOBAL PARA ESTE ARCHIVO
//  * Solo el rol 1 (Admin) puede pasar de aquí. 
//  * Si entra la secretaria (3), el middleware enviará el error 403.
//  */
// MedicosRouter.use(verificarAcceso([1]));

// // --- A partir de aquí, todas las rutas están protegidas ---

// // Listado con paginación y búsqueda
// MedicosRouter.get('/', MedicosControllers.get);

// // Creación
// MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
// MedicosRouter.post('/', MedicosControllers.store);

// // Edición
// MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
// MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// // Estados
// MedicosRouter.route('/inactivar/:id_medico')
//     .get(MedicosControllers.inactivar)
//     .post(MedicosControllers.inactivar);

// MedicosRouter.route('/activar/:id_medico')
//     .get(MedicosControllers.activar)
//     .post(MedicosControllers.activar);

// // Buscadores y Helpers API
// MedicosRouter.get('/buscar', MedicosControllers.buscar);
// MedicosRouter.get('/:id_medico/especialidades', MedicosControllers.especialidadesActivas);

// module.exports = MedicosRouter;

const express = require('express');
const MedicosRouter = express.Router();
const MedicosControllers = require('../controllers/medicosControllers');
const { verificarAcceso } = require('../middlewares/auth');

// =========================================================
// 1. RUTAS DE ACCESO COMPARTIDO (ADMIN Y SECRETARÍA)
// Estas rutas alimentan los buscadores del panel
// =========================================================

// Ruta para el buscador de médicos (Autocomplete)
// MedicosRouter.get('/buscar', verificarAcceso([1, 3]), MedicosControllers.buscar);
MedicosRouter.get('/buscar', verificarAcceso([1, 3, 4]), MedicosControllers.buscar);

// Ruta para cargar especialidades según el médico seleccionado
// MedicosRouter.get('/:id_medico/especialidades', verificarAcceso([1, 3]), MedicosControllers.especialidadesActivas);
MedicosRouter.get('/:id_medico/especialidades', verificarAcceso([1, 3, 4]), MedicosControllers.especialidadesActivas);


// =========================================================
// 2. RESTRICCIÓN GLOBAL (SOLO ADMIN)
// A partir de aquí, el rol 3 (Secretaria) será bloqueado (403)
// =========================================================
MedicosRouter.use(verificarAcceso([1]));


// --- Rutas de gestión protegidas ---

// Listado principal de médicos
MedicosRouter.get('/', MedicosControllers.get);

// Creación
MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
MedicosRouter.post('/', MedicosControllers.store);

// Edición
MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// Estados (Activar/Inactivar)
MedicosRouter.route('/inactivar/:id_medico')
    .get(MedicosControllers.inactivar)
    .post(MedicosControllers.inactivar);

MedicosRouter.route('/activar/:id_medico')
    .get(MedicosControllers.activar)
    .post(MedicosControllers.activar);

module.exports = MedicosRouter;