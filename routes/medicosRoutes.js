// const express = require('express');
// const MedicosRouter = express.Router();
// const MedicosControllers = require('../controllers/medicosControllers');
// const PersonasControllers = require('../controllers/personasControllers'); // Importamos el controlador universal
// const { verificarAcceso } = require('../middlewares/auth');
// const medicosControllers = require('../controllers/medicosControllers');

// // =========================================================
// // 1. RUTAS DE ACCESO COMPARTIDO Y VALIDACIONES (ADMIN, SEC, PAC)
// // =========================================================

// // VERIFICACIÓN UNIVERSAL DE PERSONA (DNI) 
// MedicosRouter.get('/verificar-persona/:dni', PersonasControllers.verificarDni);

// //VERIFICACION DE CORREO
// MedicosRouter.get('/verificar-email/:email', medicosControllers.verificarEmail);

// // Ruta para el buscador de médicos (Autocomplete)
// MedicosRouter.get('/buscar', verificarAcceso([1, 3, 4]), MedicosControllers.buscar);

// // Ruta para cargar especialidades según el médico seleccionado
// MedicosRouter.get('/:id_medico/especialidades', verificarAcceso([1, 3, 4]), MedicosControllers.especialidadesActivas);


// // =========================================================
// // 2. RESTRICCIÓN GLOBAL (SOLO ADMIN)
// // =========================================================
// MedicosRouter.use(verificarAcceso([1]));


// // --- Rutas de gestión protegidas ---

// // Listado principal de médicos
// MedicosRouter.get('/', MedicosControllers.get);

// // Creación
// MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
// MedicosRouter.post('/', MedicosControllers.store);

// // Edición
// MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
// MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// // Estados (Activar/Inactivar)
// MedicosRouter.route('/inactivar/:id_medico')
//     .get(MedicosControllers.inactivar)
//     .post(MedicosControllers.inactivar);

// MedicosRouter.route('/activar/:id_medico')
//     .get(MedicosControllers.activar)
//     .post(MedicosControllers.activar);

// module.exports = MedicosRouter;




// const express = require('express');
// const MedicosRouter = express.Router();
// const MedicosControllers = require('../controllers/medicosControllers');
// const PersonasControllers = require('../controllers/personasControllers'); 
// const { verificarAcceso } = require('../middlewares/auth');

// // =========================================================
// // 1. RUTAS DE ACCESO COMPARTIDO Y VALIDACIONES (ADMIN, SEC, PAC, MED)
// // =========================================================

// // Dashboard del Médico (Acceso para Admin [1] y Médicos [2])
// // Se coloca aquí para que el filtro de "Solo Admin" de abajo no lo bloquee
// MedicosRouter.get('/dashboard', verificarAcceso([1, 2]), MedicosControllers.getDashboard);

// // VERIFICACIÓN UNIVERSAL DE PERSONA (DNI) 
// MedicosRouter.get('/verificar-persona/:dni', PersonasControllers.verificarDni);

// // VERIFICACIÓN DE CORREO
// MedicosRouter.get('/verificar-email/:email', MedicosControllers.verificarEmail);

// // Ruta para el buscador de médicos (Autocomplete)
// MedicosRouter.get('/buscar', verificarAcceso([1, 3, 4]), MedicosControllers.buscar);

// // Ruta para cargar especialidades según el médico seleccionado
// MedicosRouter.get('/:id_medico/especialidades', verificarAcceso([1, 3, 4]), MedicosControllers.especialidadesActivas);


// // =========================================================
// // 2. RESTRICCIÓN GLOBAL (SOLO ADMIN)
// // =========================================================

// // A partir de aquí, todas las rutas requieren Rol 1 (Administrador)
// MedicosRouter.use(verificarAcceso([1]));

// // --- Rutas de gestión de médicos (CRUD) ---

// // Listado principal de médicos
// MedicosRouter.get('/', MedicosControllers.get);

// // Creación
// MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
// MedicosRouter.post('/', MedicosControllers.store);

// // Edición
// MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
// MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// // Estados (Activar/Inactivar)
// MedicosRouter.route('/inactivar/:id_medico')
//     .get(MedicosControllers.inactivar)
//     .post(MedicosControllers.inactivar);

// MedicosRouter.route('/activar/:id_medico')
//     .get(MedicosControllers.activar)
//     .post(MedicosControllers.activar);

// module.exports = MedicosRouter;






const express = require('express');
const MedicosRouter = express.Router();
const MedicosControllers = require('../controllers/medicosControllers');
const PersonasControllers = require('../controllers/personasControllers'); 
const { verificarAcceso } = require('../middlewares/auth');

// =========================================================
// 1. RUTAS DE ACCESO PARA MÉDICOS (Rol 2) Y OTROS
// =========================================================

// Dashboard del Médico
MedicosRouter.get('/dashboard', verificarAcceso([1, 2]), MedicosControllers.getDashboard);

// --- NUEVA RUTA: Actualizar Perfil (DEBE ESTAR ANTES DEL .use([1])) ---
// Permitimos Rol 1 y Rol 2
MedicosRouter.post('/update-perfil', verificarAcceso([1, 2]), MedicosControllers.updatePerfil);

// Verificaciones y buscadores
MedicosRouter.get('/verificar-persona/:dni', PersonasControllers.verificarDni);
MedicosRouter.get('/verificar-email/:email', MedicosControllers.verificarEmail);
MedicosRouter.get('/buscar', verificarAcceso([1, 3, 4]), MedicosControllers.buscar);
MedicosRouter.get('/:id_medico/especialidades', verificarAcceso([1, 3, 4]), MedicosControllers.especialidadesActivas);


// =========================================================
// 2. RESTRICCIÓN GLOBAL (SOLO ADMIN)
// =========================================================

// A partir de aquí, solo entra el Admin
MedicosRouter.use(verificarAcceso([1]));

// --- Rutas de gestión de médicos (CRUD para Admin) ---
MedicosRouter.get('/', MedicosControllers.get);
MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
MedicosRouter.post('/', MedicosControllers.store);
MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
MedicosRouter.post('/update/:id_medico', MedicosControllers.update);
MedicosRouter.get('/verificar-matricula/:matricula', MedicosControllers.verificarMatricula);

// ... resto de las rutas (inactivar/activar) ...

module.exports = MedicosRouter;