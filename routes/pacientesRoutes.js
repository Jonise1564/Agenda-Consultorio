// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers'); 
// const panelPacienteController = require('../controllers/panelPacienteController'); 
// const { verificarAcceso } = require('../middlewares/auth');

// // ============================================================
// // 1. RUTAS PÚBLICAS PARA EL PACIENTE (ROL 1 Y 4)
// // Estas rutas deben ir ARRIBA para que Jazmin pueda entrar
// // ============================================================

// // Vista principal del dashboard
// PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);

// // Vista de perfil (si la usas por separado)
// PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// // Procesar la reserva de turnos
// PacientesRouter.post('/confirmar-reserva', verificarAcceso([1, 4]), panelPacienteController.confirmarReserva);

// // PROCESAR EDICIÓN DE PERFIL (Soluciona el error 403)
// PacientesRouter.post('/editar-perfil', verificarAcceso([1, 4]), panelPacienteController.postEditarPerfil);
// //Verificar DNI paciente
// PacientesRouter.get('/verificar-dni/:dni', PacientesControllers.verificarDni);


// // ============================================================
// // 2. RESTRICCIÓN GLOBAL (SOLO ADMIN 1 Y SECRETARÍA 3)
// // El Rol 4 (Jazmin) no puede acceder a nada de lo que esté debajo de esta línea
// // ============================================================
// PacientesRouter.use(verificarAcceso([1, 3]));

// // Gestión administrativa de pacientes
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
// // 1. RUTAS PARA EL PACIENTE Y VERIFICACIONES ASINCRÓNICAS
// // ============================================================

// // Vista principal del dashboard
// PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);

// // Vista de perfil
// PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// // Procesar la reserva de turnos
// PacientesRouter.post('/confirmar-reserva', verificarAcceso([1, 4]), panelPacienteController.confirmarReserva);

// // Procesar edición de perfil
// PacientesRouter.post('/editar-perfil', verificarAcceso([1, 4]), panelPacienteController.postEditarPerfil);

// // VERIFICACIÓN DE DNI (Se coloca aquí para que sea accesible antes de las restricciones de Admin)
// PacientesRouter.get('/verificar-dni/:dni', PacientesControllers.verificarDni);


// // ============================================================
// // 2. RESTRICCIÓN GLOBAL (SOLO ADMIN 1 Y SECRETARÍA 3)
// // ============================================================
// PacientesRouter.use(verificarAcceso([1, 3]));

// // Gestión administrativa de pacientes
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




const express = require('express');
const PacientesRouter = express.Router();
const PacientesControllers = require('../controllers/pacientesControllers'); 
const PersonasControllers = require('../controllers/personasControllers'); // <--- Importamos el controlador de personas
const panelPacienteController = require('../controllers/panelPacienteController'); 
const { verificarAcceso } = require('../middlewares/auth');

// ============================================================
// 1. RUTAS PARA EL PACIENTE Y VERIFICACIONES ASINCRÓNICAS
// ============================================================

// Vista principal del dashboard
PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);

// Vista de perfil
PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// Procesar la reserva de turnos
PacientesRouter.post('/confirmar-reserva', verificarAcceso([1, 4]), panelPacienteController.confirmarReserva);

// Procesar edición de perfil
PacientesRouter.post('/editar-perfil', verificarAcceso([1, 4]), panelPacienteController.postEditarPerfil);

// VERIFICACIÓN UNIVERSAL DE PERSONA (DNI)
// Usamos el método centralizado en PersonasControllers
PacientesRouter.get('/verificar-persona/:dni', PersonasControllers.verificarDni);


// ============================================================
// 2. RESTRICCIÓN GLOBAL (SOLO ADMIN 1 Y SECRETARÍA 3)
// ============================================================
PacientesRouter.use(verificarAcceso([1, 3]));

// Gestión administrativa de pacientes
PacientesRouter.get('/buscar', PacientesControllers.buscar);
PacientesRouter.get('/', PacientesControllers.get);
PacientesRouter.get('/crear', PacientesControllers.getCreateForm);
PacientesRouter.post('/', PacientesControllers.store);
PacientesRouter.get('/editar/:id', PacientesControllers.edit);
PacientesRouter.post('/update/:id', PacientesControllers.update);

PacientesRouter.route('/activar/:id')
    .get(PacientesControllers.activar)
    .post(PacientesControllers.activar);

PacientesRouter.route('/inactivar/:id')
    .get(PacientesControllers.inactivar)
    .post(PacientesControllers.inactivar);

module.exports = PacientesRouter;