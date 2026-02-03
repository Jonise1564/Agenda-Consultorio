const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/administracionController');

// DEBUG: Esto te ayudará a ver si las funciones se cargaron correctamente en la consola
if (!adminCtrl.actualizarPerfil) {
    console.error("⚠️ ERROR: La función 'actualizarPerfil' no se encuentra en administracionController.js");
}

// ==========================================
// RUTAS DE BLOQUEOS (AUSENCIAS Y FERIADOS)
// ==========================================
router.get('/bloqueos', adminCtrl.indexBloqueos);
router.post('/ausencias/guardar', adminCtrl.guardarAusencia);
router.post('/feriados/guardar', adminCtrl.guardarFeriado);
router.get('/ausencias/eliminar/:id', adminCtrl.eliminarAusencia);

// ==========================================
// RUTAS DE GESTIÓN DE SECRETARIAS
// ==========================================
router.get('/secretarias', adminCtrl.listaSecretarias); 

// CREAR SECRETARIA
router.get('/secretarias/nuevo', (req, res) => res.render('admin/nuevo_secretaria'));
router.post('/secretarias/nuevo', adminCtrl.guardarSecretaria);

// EDITAR SECRETARIA
router.get('/secretarias/editar/:id', adminCtrl.editarSecretariaForm);
router.post('/secretarias/editar/:id', adminCtrl.actualizarSecretaria);

// ==========================================
// RUTA DE PERFIL (PARA EL ADMIN LOGUEADO)
// ==========================================
// Esta es la ruta que procesa el Modal de la "tuerquita"
router.post('/actualizar-perfil', adminCtrl.actualizarPerfil);

// ELIMINAR SECRETARIA
router.delete('/secretarias/eliminar/:id', async (req, res) => {
    // Aquí puedes implementar adminCtrl.eliminarSecretaria si lo necesitas a futuro
    res.json({ success: true }); 
});

module.exports = router;