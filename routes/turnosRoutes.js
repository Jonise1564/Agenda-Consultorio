
// const express = require('express');
// const TurnosRouter = express.Router()
// const TurnosControllers = require('../controllers/turnosControllers');

// // Index turnos desde agenda por el idagenda
// TurnosRouter.get('/:id', TurnosControllers.get);
// /*
// // Vista crear (GET para mostrar el formulario)
// TurnosRouter.get('/create', TurnosControllers.getCreateForm);

// // redirigir a la vista crear
// TurnosRouter.get('/create', TurnosControllers.create);

// // Guardar nuevo médico (POST para la ruta raíz, si es necesario)
// TurnosRouter.post('/', TurnosControllers.store);

// // Vista editar
// TurnosRouter.get('/edit/:dni', TurnosControllers.edit);

// // Actualizar médico
// TurnosRouter.post('/update/:dni', TurnosControllers.update);

// // Eliminar médico
// TurnosRouter.post('/activar/:dni', TurnosControllers.activar)
// //inactivar
// TurnosRouter.post('/inactivar/:dni', TurnosControllers.inactivar);

// */
// module.exports = TurnosRouter;
// const express = require('express');
// const TurnosRouter = express.Router();
// const TurnosControllers = require('../controllers/turnosControllers');

// // Mostrar todos los turnos de una agenda
// TurnosRouter.get('/:id', TurnosControllers.get);

// // Mostrar formulario para crear un turno
// TurnosRouter.get('/:id/create', TurnosControllers.createForm);

// // Guardar un turno nuevo
// TurnosRouter.post('/:id', TurnosControllers.store);

// module.exports = TurnosRouter;




const express = require('express');
const TurnosRouter = express.Router();
const TurnosControllers = require('../controllers/turnosControllers');

// -------------------------------------------
// MOSTRAR FORMULARIO PARA RESERVAR / CREAR TURNO
// -------------------------------------------
//TurnosRouter.get('/reservar/:id', TurnosControllers.createForm);

// -------------------------------------------
// GUARDAR TURNO (POST)
// -------------------------------------------
TurnosRouter.post('/', TurnosControllers.store);

// -------------------------------------------
// LISTAR TURNOS DE UNA AGENDA
// -------------------------------------------
TurnosRouter.get('/:id', TurnosControllers.get);
//RESERVAR TURNOS
TurnosRouter.get('/reservar/:id', TurnosControllers.reservarForm);


module.exports = TurnosRouter;

