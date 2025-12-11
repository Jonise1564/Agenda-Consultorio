
// const express = require('express');
// const MedicosRouter = express.Router()
// const MedicosControllers = require('../controllers/medicosControllers');

// // Index
// MedicosRouter.get('/', MedicosControllers.get);

// // Vista crear (GET para mostrar el formulario)
// MedicosRouter.get('/create', MedicosControllers.getCreateForm);

// // redirigir a la vista crear
// MedicosRouter.get('/create', MedicosControllers.create);

// // Guardar nuevo médico (POST para la ruta raíz, si es necesario)
// MedicosRouter.post('/', MedicosControllers.store);

// // Vista editar
// MedicosRouter.get('/edit/:dni', MedicosControllers.edit);

// // Actualizar médico
// MedicosRouter.post('/update/:dni', MedicosControllers.update);

// // Eliminar médico
// MedicosRouter.post('/activar/:dni', MedicosControllers.activar)
// //inactivar
// MedicosRouter.post('/inactivar/:dni', MedicosControllers.inactivar);
// //Gestionar Especialidades medicos
// //MedicosRouter.get('/especialidades', MedicosControllers.especialidadesxmedico);

// // Editar obra Especialidades del medico
// MedicosRouter.get('/editarEsp/:dni', MedicosControllers.editarEspecialidades);
// //Activar Especialidad del medico
// MedicosRouter.post('/activarEsp/:Id', MedicosControllers.activarEspecialidad);
// //Inactivar Especialidad del medico
// MedicosRouter.post('/inactivarEsp/:Id', MedicosControllers.inactivarEspecialidad);


// module.exports = MedicosRouter;

// const express = require('express');
// const MedicosRouter = express.Router()
// const MedicosControllers = require('../controllers/medicosControllers');

// // Index
// MedicosRouter.get('/', MedicosControllers.get);

// // Vista crear
// MedicosRouter.get('/create', MedicosControllers.create);

// // Guardar nuevo médico
// MedicosRouter.post('/', MedicosControllers.store);

// // Vista editar
// MedicosRouter.get('/edit/:dni', MedicosControllers.edit);

// // Actualizar médico
// MedicosRouter.post('/update/:dni', MedicosControllers.update);

// // Activar / Inactivar
// MedicosRouter.post('/activar/:dni', MedicosControllers.activar)
// MedicosRouter.post('/inactivar/:dni', MedicosControllers.inactivar);

// // Especialidades
// MedicosRouter.get('/editarEsp/:dni', MedicosControllers.editarEspecialidades);
// MedicosRouter.post('/activarEsp/:Id', MedicosControllers.activarEspecialidad);
// MedicosRouter.post('/inactivarEsp/:Id', MedicosControllers.inactivarEspecialidad);

// module.exports = MedicosRouter;


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

module.exports = MedicosRouter;

