const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/administracionController');
const multer = require('multer');

// Configuración de Multer
const upload = multer({ dest: 'public/uploads/' });

// ==========================================
// MIDDLEWARE DE AUTORIZACIÓN
// ==========================================
const isAdmin = (req, res, next) => {
    // Verificamos si existe el usuario y si es Admin (Rol ID 1)
    if (req.user && req.user.id_rol === 1) {
        return next();
    }
    // Si no es admin, redirigimos o mostramos error
    console.warn(`⚠️ Intento de acceso no autorizado de usuario ID: ${req.user?.id || 'Anónimo'}`);
    res.status(403).render('principal/error', { 
        error: 'Acceso denegado: Se requieren permisos de administrador para realizar esta acción.',
        page: 'error'
    });
};

// DEBUG: Verificación de controladores
if (!adminCtrl.actualizarPerfil) {
    console.error("⚠️ ERROR: La función 'actualizarPerfil' no se encuentra en administracionController.js");
}

// Todas las rutas de este archivo ahora pasan por el filtro isAdmin
// Si quieres que ALGUNAS sean públicas, quítales el 'isAdmin'

// ==========================================
// RUTAS DE BLOQUEOS (AUSENCIAS Y FERIADOS)
// ==========================================
router.get('/bloqueos', isAdmin, adminCtrl.indexBloqueos);
router.post('/ausencias/guardar', isAdmin, adminCtrl.guardarAusencia);
router.post('/feriados/guardar', isAdmin, adminCtrl.guardarFeriado);
router.get('/ausencias/eliminar/:id', isAdmin, adminCtrl.eliminarAusencia);
router.get('/feriados/eliminar/:id', isAdmin, adminCtrl.eliminarFeriado);

// IMPORTACIÓN MASIVA
router.post('/feriados/importar', isAdmin, upload.single('archivoExcel'), adminCtrl.importarFeriadosExcel);

// ==========================================
// RUTAS DE GESTIÓN DE SECRETARIAS
// ==========================================
router.get('/secretarias', isAdmin, adminCtrl.listaSecretarias); 

// CREAR SECRETARIA
router.get('/secretarias/nuevo', isAdmin, (req, res) => res.render('admin/nuevo_secretaria'));
router.post('/secretarias/nuevo', isAdmin, adminCtrl.guardarSecretaria);

// EDITAR SECRETARIA
router.get('/secretarias/editar/:id', isAdmin, adminCtrl.editarSecretariaForm);
router.post('/secretarias/editar/:id', isAdmin, adminCtrl.actualizarSecretaria);

// ==========================================
// RUTA DE PERFIL (PARA EL ADMIN LOGUEADO)
// ==========================================
router.post('/actualizar-perfil', isAdmin, adminCtrl.actualizarPerfil);

// ELIMINAR SECRETARIA
router.delete('/secretarias/eliminar/:id', isAdmin, async (req, res) => {
    // Nota: Aquí lo ideal sería llamar a adminCtrl.eliminarSecretaria
    res.json({ success: true }); 
});

module.exports = router;