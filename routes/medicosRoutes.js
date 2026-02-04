const express = require('express');
const MedicosRouter = express.Router();
const MedicosControllers = require('../controllers/medicosControllers');
const PersonasControllers = require('../controllers/personasControllers'); // Importamos el controlador universal
const { verificarAcceso } = require('../middlewares/auth');

// =========================================================
// 1. RUTAS DE ACCESO COMPARTIDO Y VALIDACIONES (ADMIN, SEC, PAC)
// =========================================================

// VERIFICACIÓN UNIVERSAL DE PERSONA (DNI) 
// Se coloca aquí para que cualquier formulario de registro pueda consultarlo
MedicosRouter.get('/verificar-persona/:dni', PersonasControllers.verificarDni);

// Ruta para el buscador de médicos (Autocomplete)
MedicosRouter.get('/buscar', verificarAcceso([1, 3, 4]), MedicosControllers.buscar);

// Ruta para cargar especialidades según el médico seleccionado
MedicosRouter.get('/:id_medico/especialidades', verificarAcceso([1, 3, 4]), MedicosControllers.especialidadesActivas);


// =========================================================
// 2. RESTRICCIÓN GLOBAL (SOLO ADMIN)
// =========================================================
MedicosRouter.use(verificarAcceso([1]));


// --- Rutas de gestión protegidas ---

// Listado principal de médicos
MedicosRouter.get('/', MedicosControllers.get);

// Creación
MedicosRouter.get('/crear', MedicosControllers.getCreateForm);
MedicosRouter.post('/', MedicosControllers.store);

// Edición
MedicosRouter.get('/editar/:id_medico', MedicosControllers.edit);
MedicosRouter.post('/update/:id_medico', MedicosControllers.update);

// Estados (Activar/Inactivar)
MedicosRouter.route('/inactivar/:id_medico')
    .get(MedicosControllers.inactivar)
    .post(MedicosControllers.inactivar);

MedicosRouter.route('/activar/:id_medico')
    .get(MedicosControllers.activar)
    .post(MedicosControllers.activar);

module.exports = MedicosRouter;