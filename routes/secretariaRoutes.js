// // const express = require('express');
// // const router = express.Router();

// // const SecretariaController = require('../controllers/secretariaController');

// // // Panel principal
// // router.get('/', SecretariaController.index);

// // // Buscar agendas disponibles
// // router.get('/agendas', SecretariaController.buscarAgendas);

// // // Formulario agendar turno
// // router.get('/turnos/agendar/:idTurno', SecretariaController.agendarForm);

// // // Guardar turno
// // router.post('/turnos/agendar/:idTurno', SecretariaController.agendar);

// // // Buscar paciente por DNI (AJAX o GET)
// // router.get('/pacientes/buscar', SecretariaController.buscarPacientePorDNI);

// // module.exports = router;


// // const express = require('express');
// // const router = express.Router();

// // const AgendasController = require('../controllers/agendasControllers');
// // const TurnosController = require('../controllers/turnosControllers');
// // const PacientesController = require('../controllers/pacientesControllers');

// // // ===============================
// // // PANEL PRINCIPAL SECRETARIA
// // // ===============================
// // router.get('/', (req, res) => {
// //     res.render('secretaria/index', { page: 'secretaria' });
// // });

// // // ===============================
// // // BUSCAR AGENDAS DISPONIBLES
// // // ===============================
// // router.get('/buscar-agendas', AgendasController.buscarParaSecretaria);
// // // ↑ este método lo reutilizás o lo creás en agendasControllers

// // // ===============================
// // // FORM AGENDAR TURNO
// // // ===============================
// // router.get('/agendar/:idTurno', TurnosController.reservarForm);

// // // ===============================
// // // GUARDAR TURNO (POST)
// // // ===============================
// // router.post('/agendar/:idTurno', TurnosController.reservar);

// // // ===============================
// // // BUSCAR PACIENTE POR DNI (AJAX)
// // // ===============================
// // router.get('/pacientes/buscar', PacientesController.buscarPorDni);

// // module.exports = router;

// const express = require('express');
// const router = express.Router();

// const SecretariaController = require('../controllers/secretariaController');

// // ===============================
// // PANEL PRINCIPAL SECRETARIA
// // ===============================
// router.get('/', SecretariaController.index);

// // ===============================
// // BUSCAR AGENDAS DISPONIBLES
// // ===============================
// router.get('/buscar-agendas', SecretariaController.buscarAgendas);

// // ===============================
// // FORM AGENDAR TURNO
// // ===============================
// router.get('/agendar/:idTurno', SecretariaController.agendarForm);

// // ===============================
// // GUARDAR TURNO
// // ===============================
// router.post('/agendar/:idTurno', SecretariaController.agendar);

// // ===============================
// // BUSCAR PACIENTE POR DNI (AJAX)
// // ===============================
// router.get('/pacientes/buscar', SecretariaController.buscarPacientePorDNI);

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const AgendasRouter = express.Router()
// const AgendasControllers = require('../controllers/agendasControllers');

// const SecretariaController = require('../controllers/secretariaController');

// // ===============================
// // PANEL PRINCIPAL SECRETARIA
// // ===============================
// router.get('/', SecretariaController.index);

// // ===============================
// // BUSCAR AGENDAS DISPONIBLES
// // ===============================
// router.get('/buscar-agendas', SecretariaController.buscarAgendas);

// router.get('/buscar-agendas',AgendasControllers.get);


// // ===============================
// // FORM AGENDAR TURNO
// // ===============================
// router.get('/agendar/:idTurno', SecretariaController.agendarForm);

// // ===============================
// // GUARDAR TURNO
// // ===============================
// router.post('/agendar/:idTurno', SecretariaController.agendar);

// // ===============================
// // BUSCAR PACIENTE POR DNI (AJAX)
// // ===============================
// router.get('/pacientes/buscar', SecretariaController.buscarPacientePorDNI);

// module.exports = router;


// const express = require('express');
// const router = express.Router();

// const SecretariaController = require('../controllers/secretariaController');

// // ===============================
// // PANEL PRINCIPAL SECRETARIA
// // ===============================
// router.get('/', SecretariaController.index);

// // ===============================
// // BUSCAR AGENDAS DISPONIBLES
// // ===============================
//  router.get('/buscar-agendas', SecretariaController.buscarAgendas);

// // ===============================
// // BUSCAR TURNOS (FORM SECRETARIA)
// // ===============================
//  router.post('/turnos/buscar', SecretariaController.buscarTurnos);

// // ===============================
// // FORM AGENDAR TURNO
// // ===============================
// router.get('/agendar/:idTurno', SecretariaController.agendarForm);

// // ===============================
// // GUARDAR TURNO
// // ===============================
// router.post('/agendar/:idTurno', SecretariaController.agendar);

// // ===============================
// // BUSCAR PACIENTE POR DNI (AJAX)
// // ===============================
// router.get('/pacientes/buscar', SecretariaController.buscarPacientePorDNI);

// module.exports = router;



const express = require('express');
const router = express.Router();

const SecretariaController = require('../controllers/secretariaController');

// PANEL
router.get('/', SecretariaController.index);

// DISPONIBILIDAD DE TURNOS
router.get('/disponibilidad', SecretariaController.disponibilidad);

// BUSCAR AGENDAS (legacy)
router.get('/buscar-agendas', SecretariaController.buscarAgendas);

// FORM AGENDAR
router.get('/agendar/:idTurno', SecretariaController.agendarForm);

// GUARDAR TURNO
router.post('/agendar/:idTurno', SecretariaController.agendar);

// PACIENTE POR DNI (AJAX)
router.get('/pacientes/buscar', SecretariaController.buscarPacientePorDNI);

module.exports = router;
