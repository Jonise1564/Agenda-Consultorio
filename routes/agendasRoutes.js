// // const express = require('express');
// // const AgendasRouter = express.Router()
// // const AgendasControllers = require('../controllers/agendasControllers');

// // // Index
// // AgendasRouter.get('/', AgendasControllers.get);

// // // redirigir a la vista crear
// // AgendasRouter.get('/create', AgendasControllers.create);

// // // Guardar nuevo agendas (POST para la ruta raíz, si es necesario)
// // AgendasRouter.post('/', AgendasControllers.store);

// // // Vista editar
// // AgendasRouter.get('/edit/:id', AgendasControllers.edit);

// // // Actualizar agendas
// // AgendasRouter.post('/update/:id', AgendasControllers.update);

// // // Eliminar agendas delete('/agendas/:id'
// // AgendasRouter.delete('/:id', AgendasControllers.eliminarAgenda)



// // module.exports = AgendasRouter


// const express = require('express');
// const AgendasRouter = express.Router();
// const AgendasController = require('../controllers/agendasControllers'); // CORRECTO: nombre singular

// // Listar todas las agendas
// AgendasRouter.get('/', AgendasControllers.get);

// // Mostrar formulario para crear una nueva agenda
// AgendasRouter.get('/create', AgendasController.create);

// // Guardar nueva agenda
// AgendasRouter.post('/', AgendasController.store);

// // Para editar una agenda
// AgendasRouter.get('/edit/:id', AgendasController.edit);

// // Actualizar agenda
// AgendasRouter.post('/update/:id', AgendasController.update);

// // Eliminar agenda (usar POST si es desde formulario HTML)
// AgendasRouter.post('/delete/:id', AgendasController.eliminarAgenda);

// module.exports = AgendasRouter;



const express = require('express');
const AgendasRouter = express.Router();
const AgendasController = require('../controllers/agendasControllers'); // singular

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
AgendasRouter.post('/delete/:id', AgendasController.eliminarAgenda);

module.exports = AgendasRouter;
