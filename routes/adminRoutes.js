const adminCtrl = require('./controllers/administracionController');

// Rutas de Bloqueos y Ausencias
router.get('/admin/bloqueos', adminCtrl.indexBloqueos);
router.post('/admin/ausencias/guardar', adminCtrl.guardarAusencia);
router.post('/admin/feriados/guardar', adminCtrl.guardarFeriado);
router.get('/admin/ausencias/eliminar/:id', adminCtrl.eliminarAusencia);