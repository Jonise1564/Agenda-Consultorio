// const express = require('express');
// const EspecialidadesRouter = express.Router();
// const especialidadesControllers = require('../controllers/EspecialidadesControllers');
// const router = express.Router();
// const { verificarAcceso } = require('../middlewares/auth');

// // Solo Admin
// router.use(verificarAcceso([1]));

// EspecialidadesRouter.get('/', especialidadesControllers.getAll);

// //Crear especialidad
// EspecialidadesRouter.get('/create', especialidadesControllers.create);

// //Guardar especialidad
// EspecialidadesRouter.post('/store', especialidadesControllers.store);


// //Vista editar
// EspecialidadesRouter.get('/editar/:id', especialidadesControllers.edit);
// //Actualizar especialidad
// EspecialidadesRouter.post('/update/:id', especialidadesControllers.update);
// //EspecialidadesRouter.post('/editar/:id', especialidadesControllers.update);

// //Activar especialidad
// EspecialidadesRouter.post('/activar/:id', especialidadesControllers.activate);

// //Inactivar especialidad
// EspecialidadesRouter.post('/inactivar/:id', especialidadesControllers.inactivate);


// module.exports = EspecialidadesRouter;

const express = require('express');
const EspecialidadesRouter = express.Router();
const especialidadesControllers = require('../controllers/EspecialidadesControllers');
// Ya no necesitas 'const router = express.Router();' -> Borra esa línea

const { verificarAcceso } = require('../middlewares/auth');

// APLICAR RESTRICCIÓN: Usamos EspecialidadesRouter, que es el que tiene las rutas
EspecialidadesRouter.use(verificarAcceso([1]));

// A partir de aquí, todo queda protegido para el Admin
EspecialidadesRouter.get('/', especialidadesControllers.getAll);

// Crear especialidad
EspecialidadesRouter.get('/create', especialidadesControllers.create);

// Guardar especialidad
EspecialidadesRouter.post('/store', especialidadesControllers.store);

// Vista editar
EspecialidadesRouter.get('/editar/:id', especialidadesControllers.edit);

// Actualizar especialidad
EspecialidadesRouter.post('/update/:id', especialidadesControllers.update);

// Activar especialidad
EspecialidadesRouter.post('/activar/:id', especialidadesControllers.activate);

// Inactivar especialidad
EspecialidadesRouter.post('/inactivar/:id', especialidadesControllers.inactivate);

module.exports = EspecialidadesRouter;