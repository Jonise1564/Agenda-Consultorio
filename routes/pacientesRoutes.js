

// // module.exports = PacientesRouter;
// const express = require('express');
// const PacientesRouter = express.Router();
// const PacientesControllers = require('../controllers/pacientesControllers'); 
// const panelPacienteController = require('../controllers/panelPacienteController'); 
// const { verificarAcceso } = require('../middlewares/auth');

// // ============================================================
// // 1. RUTAS PARA EL PACIENTE 
// // ============================================================
// PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);
// PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// // MOVEMOS ESTA RUTA AQUÍ (Antes del bloqueo global de secretaria)
// PacientesRouter.post('/confirmar-reserva', verificarAcceso([1, 4]), panelPacienteController.confirmarReserva);


// // ============================================================
// // 2. RESTRICCIÓN GLOBAL (ADMIN 1 Y SECRETARÍA 3)
// // ============================================================
// PacientesRouter.use(verificarAcceso([1, 3]));

// PacientesRouter.get('/buscar', PacientesControllers.buscar);
// PacientesRouter.get('/', PacientesControllers.get);
// PacientesRouter.get('/crear', PacientesControllers.getCreateForm);
// PacientesRouter.post('/', PacientesControllers.store);
// PacientesRouter.get('/editar/:id', PacientesControllers.edit);
// PacientesRouter.post('/update/:id', PacientesControllers.update);

// // Estas rutas ya no necesitan el post de confirmar-reserva aquí abajo
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
// 1. RUTAS PÚBLICAS PARA EL PACIENTE (ROL 1 Y 4)
// Estas rutas deben ir ARRIBA para que Jazmin pueda entrar
// ============================================================

// Vista principal del dashboard
PacientesRouter.get('/dashboard', verificarAcceso([1, 4]), panelPacienteController.getInicio);

// Vista de perfil (si la usas por separado)
PacientesRouter.get('/perfil', verificarAcceso([1, 4]), panelPacienteController.verPerfil);

// Procesar la reserva de turnos
PacientesRouter.post('/confirmar-reserva', verificarAcceso([1, 4]), panelPacienteController.confirmarReserva);

// PROCESAR EDICIÓN DE PERFIL (Soluciona el error 403)
PacientesRouter.post('/editar-perfil', verificarAcceso([1, 4]), panelPacienteController.postEditarPerfil);


// ============================================================
// 2. RESTRICCIÓN GLOBAL (SOLO ADMIN 1 Y SECRETARÍA 3)
// El Rol 4 (Jazmin) no puede acceder a nada de lo que esté debajo de esta línea
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