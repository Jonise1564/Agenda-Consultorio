// // const express = require('express');
// // const PacientesRouter = express.Router();
// // const PacientesControllers = require('../controllers/pacientesControllers');

// // // ============================================================
// // // BUSCADOR AJAX (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
// // // ============================================================
// // PacientesRouter.get('/buscar', PacientesControllers.buscar);

// // // Listado y Buscador general de la vista pacientes
// // PacientesRouter.get('/', PacientesControllers.get);

// // // Formulario de creación
// // PacientesRouter.get('/crear', PacientesControllers.getCreateForm);

// // // Guardar nuevo
// // PacientesRouter.post('/', PacientesControllers.store);

// // // Editar
// // PacientesRouter.get('/editar/:id', PacientesControllers.edit);
// // PacientesRouter.post('/update/:id', PacientesControllers.update);

// // // ============================================================
// // // ESTADOS (Soporta GET desde la tabla y POST desde la edición)
// // // ============================================================
// // PacientesRouter.route('/activar/:id')
// //     .get(PacientesControllers.activar)
// //     .post(PacientesControllers.activar);

// // PacientesRouter.route('/inactivar/:id')
// //     .get(PacientesControllers.inactivar)
// //     .post(PacientesControllers.inactivar);

// // module.exports = PacientesRouter;


// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers');
// // Importamos el middleware
// const { verificarAcceso } = require('../middlewares/auth');

// /**
//  * RESTRICCIÓN PARA PACIENTES
//  * Tanto el Administrador (1) como la Secretaría (3) pueden gestionar pacientes.
//  */
// PacientesRouter.use(verificarAcceso([1, 3]));

// // ============================================================
// // BUSCADOR AJAX (Para el panel de turnos de la secretaria)
// // ============================================================
// PacientesRouter.get('/buscar', PacientesControllers.buscar);

// // Listado y Buscador general de la vista pacientes
// PacientesRouter.get('/', PacientesControllers.get);

// // Formulario de creación
// PacientesRouter.get('/crear', PacientesControllers.getCreateForm);

// // Guardar nuevo
// PacientesRouter.post('/', PacientesControllers.store);

// // Editar
// PacientesRouter.get('/editar/:id', PacientesControllers.edit);
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// // ============================================================
// // ESTADOS
// // ============================================================
// PacientesRouter.route('/activar/:id')
//     .get(PacientesControllers.activar)
//     .post(PacientesControllers.activar);

// PacientesRouter.route('/inactivar/:id')
//     .get(PacientesControllers.inactivar)
//     .post(PacientesControllers.inactivar);

// module.exports = PacientesRouter;


// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers'); // Gestión Administrativa
// const panelPacienteController = require('../controllers/panelPacienteController'); // El dashboard de Marisol
// const { verificarAcceso } = require('../middlewares/auth');

// // ============================================================
// // 1. RUTAS EXCLUSIVAS PARA EL PACIENTE (ROL 4)
// // ============================================================
// // Aquí permitimos el rol 4 (paciente) y también al admin (1) por si quiere testear
// PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), (req, res, next) => panelPacienteController.getInicio(req, res, next));
// PacientesRouter.get('/perfil', verificarAcceso([1, 4]), (req, res, next) => panelPacienteController.verPerfil(req, res, next));

// // ============================================================
// // 2. RUTAS DE GESTIÓN (ADMIN 1 Y SECRETARÍA 3)
// // ============================================================

// PacientesRouter.use(verificarAcceso([1, 3]));

// PacientesRouter.get('/buscar', PacientesControllers.buscar);
// PacientesRouter.get('/', PacientesControllers.get);
// PacientesRouter.get('/crear', PacientesControllers.getCreateForm);
// PacientesRouter.post('/', PacientesControllers.store);
// PacientesRouter.get('/editar/:id', PacientesControllers.edit);
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// PacientesRouter.route('/activar/:id')
//     .get(PacientesControllers.activar)
//     .post(PacientesControllers.activar);

// PacientesRouter.route('/inactivar/:id')
//     .get(PacientesControllers.inactivar)
//     .post(PacientesControllers.inactivar);

// module.exports = PacientesRouter;


// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers'); // Gestión (Secretaría/Admin)
// const panelPacienteController = require('../controllers/panelPacienteController'); // El de Marisol
// const { verificarAcceso } = require('../middlewares/auth');

// // ============================================================
// // 1. RUTAS PARA EL PACIENTE (ROL 4)
// // Estas rutas son relativas a "/pacientes"
// // ============================================================

// // El 404 suele ocurrir si el método en el controller no se llama exactamente 'getInicio'
// PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);
// PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// // ============================================================
// // 2. RUTAS DE GESTIÓN (ADMIN 1 Y SECRETARÍA 3)
// // ============================================================

// PacientesRouter.use(verificarAcceso([1, 3]));

// PacientesRouter.get('/buscar', PacientesControllers.buscar);
// PacientesRouter.get('/', PacientesControllers.get);
// PacientesRouter.get('/crear', PacientesControllers.getCreateForm);
// PacientesRouter.post('/', PacientesControllers.store);
// PacientesRouter.get('/editar/:id', PacientesControllers.edit);
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// PacientesRouter.route('/activar/:id')
//     .get(PacientesControllers.activar)
//     .post(PacientesControllers.activar);

// PacientesRouter.route('/inactivar/:id')
//     .get(PacientesControllers.inactivar)
//     .post(PacientesControllers.inactivar);

// module.exports = PacientesRouter;


// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers'); 
// const panelPacienteController = require('../controllers/panelPacienteController'); 
// const { verificarAcceso } = require('../middlewares/auth');

// // ============================================================
// // 1. RUTAS PARA EL PACIENTE (ROL 4)
// // URL final: /pacientes/dashboard
// // ============================================================
// PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);
// PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// // ============================================================
// // 2. RUTAS DE GESTIÓN (ADMIN 1 Y SECRETARÍA 3)
// // ============================================================
// PacientesRouter.use(verificarAcceso([1, 3]));

// PacientesRouter.get('/buscar', PacientesControllers.buscar);
// PacientesRouter.get('/', PacientesControllers.get);
// PacientesRouter.get('/crear', PacientesControllers.getCreateForm);
// PacientesRouter.post('/', PacientesControllers.store);
// PacientesRouter.get('/editar/:id', PacientesControllers.edit);
// PacientesRouter.post('/update/:id', PacientesControllers.update);
// PacientesRouter.post('/confirmar-reserva', verificarAcceso([1, 4]), panelPacienteController.confirmarReserva);

// PacientesRouter.route('/activar/:id')
//     .get(PacientesControllers.activar)
//     .post(PacientesControllers.activar);

// PacientesRouter.route('/inactivar/:id')
//     .get(PacientesControllers.inactivar)
//     .post(PacientesControllers.inactivar);

// module.exports = PacientesRouter;
const express = require('express');
const PacientesRouter = express.Router();
const PacientesControllers = require('../controllers/pacientesControllers'); 
const panelPacienteController = require('../controllers/panelPacienteController'); 
const { verificarAcceso } = require('../middlewares/auth');

// ============================================================
// 1. RUTAS PARA EL PACIENTE (ROL 1 Y 4)
// Estas rutas son accesibles para Marisol
// ============================================================
PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);
PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// MOVEMOS ESTA RUTA AQUÍ (Antes del bloqueo global de secretaria)
PacientesRouter.post('/confirmar-reserva', verificarAcceso([1, 4]), panelPacienteController.confirmarReserva);


// ============================================================
// 2. RESTRICCIÓN GLOBAL (ADMIN 1 Y SECRETARÍA 3)
// El "use" actúa como una pared. El Rol 4 no puede bajar de aquí.
// ============================================================
PacientesRouter.use(verificarAcceso([1, 3]));

PacientesRouter.get('/buscar', PacientesControllers.buscar);
PacientesRouter.get('/', PacientesControllers.get);
PacientesRouter.get('/crear', PacientesControllers.getCreateForm);
PacientesRouter.post('/', PacientesControllers.store);
PacientesRouter.get('/editar/:id', PacientesControllers.edit);
PacientesRouter.post('/update/:id', PacientesControllers.update);

// Estas rutas ya no necesitan el post de confirmar-reserva aquí abajo
PacientesRouter.route('/activar/:id')
    .get(PacientesControllers.activar)
    .post(PacientesControllers.activar);

PacientesRouter.route('/inactivar/:id')
    .get(PacientesControllers.inactivar)
    .post(PacientesControllers.inactivar);

module.exports = PacientesRouter;