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
