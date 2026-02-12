// const express = require('express');
// const AgendasRouter = express.Router();
// const AgendasController = require('../controllers/agendasControllers'); // singular

// // Listar todas las agendas
// AgendasRouter.get('/', AgendasController.get);

// // Mostrar formulario para crear una nueva agenda
// AgendasRouter.get('/create', AgendasController.create);

// // Guardar nueva agenda
// AgendasRouter.post('/', AgendasController.store);

// // Para editar una agenda
// AgendasRouter.get('/edit/:id', AgendasController.edit);

// // Actualizar agenda
// AgendasRouter.post('/update/:id', AgendasController.update);

// // Eliminar agenda (usar POST si es desde formulario HTML)
// AgendasRouter.delete('/:id', AgendasController.eliminarAgenda);
// //AgendasRouter.post('/delete/:id', AgendasController.eliminarAgenda);



// module.exports = AgendasRouter;





const express = require('express');
const AgendasRouter = express.Router();
const AgendasController = require('../controllers/agendasControllers'); // singular

// --- IMPORTACIÓN DEL MIDDLEWARE DE ACCESO ---
const { verificarAcceso } = require('../middlewares/auth'); 

// =========================================================================
// PROTECCIÓN DE RUTA: Admin (1), Profesional (2) y Secretaria (3)
// El Paciente (4) NO tiene acceso a estas rutas.
// =========================================================================
AgendasRouter.use(verificarAcceso([1, 2, 3]));

// Listar todas las agendas
AgendasRouter.get('/', AgendasController.get);

// Mostrar formulario para crear una nueva agenda
AgendasRouter.get('/create', AgendasController.create);

// Guardar nueva agenda
AgendasRouter.post('/', AgendasController.store);

// Para editar una agenda
AgendasRouter.get('/edit/:id', AgendasController.edit);

// Actualizar agenda
AgendasRouter.post('/update/:id', AgendasController.update);

// Eliminar agenda (usar POST si es desde formulario HTML)
AgendasRouter.delete('/:id', AgendasController.eliminarAgenda);
//AgendasRouter.post('/delete/:id', AgendasController.eliminarAgenda);

module.exports = AgendasRouter;