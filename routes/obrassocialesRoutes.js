
// const express = require('express');
// const ObrasSocialesRouter = express.Router();
// const obrasSocialesControllers = require('../controllers/obrassocialesControllers');


// ObrasSocialesRouter.get('/', obrasSocialesControllers.getAll);

// // Crear obra social
// ObrasSocialesRouter.get('/create', obrasSocialesControllers.create);

// // Guardar obra social
// ObrasSocialesRouter.post('/store', obrasSocialesControllers.store);

// // Editar obra social
// ObrasSocialesRouter.get('/editar/:id', obrasSocialesControllers.edit);

// // Actualizar obra social
// ObrasSocialesRouter.post('/update/:id', obrasSocialesControllers.update);

// // Activar obra social
// ObrasSocialesRouter.post('/activar/:id', obrasSocialesControllers.activate);

// // Inactivar obra social
// ObrasSocialesRouter.post('/inactivar/:id', obrasSocialesControllers.inactivate);

// module.exports = ObrasSocialesRouter;

const express = require('express');
const ObrasSocialesRouter = express.Router();
const obrasSocialesControllers = require('../controllers/obrassocialesControllers');

// 1. Importamos el middleware de acceso
const { verificarAcceso } = require('../middlewares/auth');

/**
 * 2. APLICAR RESTRICCIÓN GLOBAL
 * Solo el rol 1 (Administrador) puede entrar a estas rutas.
 */
ObrasSocialesRouter.use(verificarAcceso([1]));

// --- A partir de aquí todas las rutas requieren ser Admin ---

ObrasSocialesRouter.get('/', obrasSocialesControllers.getAll);

// Crear obra social
ObrasSocialesRouter.get('/create', obrasSocialesControllers.create);

// Guardar obra social
ObrasSocialesRouter.post('/store', obrasSocialesControllers.store);

// Editar obra social
ObrasSocialesRouter.get('/editar/:id', obrasSocialesControllers.edit);

// Actualizar obra social
ObrasSocialesRouter.post('/update/:id', obrasSocialesControllers.update);

// Activar obra social
ObrasSocialesRouter.post('/activar/:id', obrasSocialesControllers.activate);

// Inactivar obra social
ObrasSocialesRouter.post('/inactivar/:id', obrasSocialesControllers.inactivate);

module.exports = ObrasSocialesRouter;
