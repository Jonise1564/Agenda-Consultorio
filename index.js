const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const helmet = require('helmet'); // Seguridad adicional
require('dotenv').config();

// IMPORTACIÓN DE JOBS Y SERVICIOS
const { procesarRecordatorios } = require('./jobs/notificador');

// IMPORTACIÓN DE ROUTERS
const AuthRouter = require('./routes/authRoutes');
const MedicosRouter = require('./routes/medicosRoutes');
const PacientesRouter = require('./routes/pacientesRoutes');
const SecretariaRouter = require('./routes/secretariaRoutes');
const AgendasRouter = require('./routes/agendasRoutes');
const TurnosRouter = require('./routes/turnosRoutes');
const EspecialidadesRouter = require('./routes/especialidadesRoutes');
const ObrasSocialesRouter = require('./routes/obrasSocialesRoutes');
const ListaEsperaRouter = require('./routes/listaEsperaRoutes');
const AdminRouter = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT ?? 3000;

// =====================
// CONFIGURACIONES BÁSICAS
// =====================
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES
app.use(helmet({ contentSecurityPolicy: false })); // Protege cabeceras (CSP off para CDNs)
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARE DE AUTENTICACIÓN (JWT)
app.use((req, res, next) => {
    const token = req.cookies.token_acceso;
    res.locals.usuario = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
            res.locals.usuario = decoded;
            req.user = decoded; // Para acceso en controladores
        } catch (err) {
            res.clearCookie('token_acceso');
        }
    }
    next();
});

// =====================
// REGISTRO DE RUTAS
// =====================

// Ruta Raíz / Dashboard
app.get('/', (req, res) => {
    const user = res.locals.usuario;
    if (!user) return res.redirect('/auth/login');

    // Redirecciones por Rol
    if (user.id_rol === 4) return res.redirect('/pacientes/dashboard');
    if (user.id_rol === 3) return res.redirect('/secretaria');

    res.render('principal/index', { page: 'inicio' });
});

// Rutas de Autenticación
app.use('/auth', AuthRouter);

// Montar Routers Principales
app.use('/pacientes', PacientesRouter);
app.use('/secretaria', SecretariaRouter);
app.use('/medicos', MedicosRouter);
app.use('/agendas', AgendasRouter);
app.use('/turnos', TurnosRouter);
app.use('/especialidades', EspecialidadesRouter);
app.use('/obrassociales', ObrasSocialesRouter);
app.use('/secretaria/lista-espera', ListaEsperaRouter);
app.use('/admin', AdminRouter);

// MANEJO DE 404 (Página no encontrada)
app.use((req, res) => {
    res.status(404).render('principal/404', { 
        page: 'error',
        mensaje: 'La página que buscas no existe o ha sido movida.' 
    });
});

// MANEJO DE ERRORES 500 (Dejar siempre al final)
app.use((err, req, res, next) => {
    console.error("❌ ERROR EN EL SERVIDOR:", err.stack);
    res.status(500).render('principal/error', { 
        error: err.message,
        page: 'error'
    });
});

// =====================
// TAREAS PROGRAMADAS (Cron Jobs)
// =====================
    // Se ejecuta a las 09:00 AM todos los días
    cron.schedule('0 9 * * *', async () => {
        console.log(`--- [${new Date().toLocaleString()}] Iniciando envío de recordatorios diarios (09:27) ---`);
        try {
            await procesarRecordatorios();
        } catch (error) {
            console.error('Error crítico en el Cron Job de recordatorios:', error);
        }
    });
// =====================
// LANZAMIENTO DEL SERVIDOR
// =====================
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo con éxito`);
    console.log(`🔗 Acceso: http://localhost:${PORT}`);
    console.log(`⏰ Notificaciones automaticas (24hs) antes configuradas para las 09:00 AM`);
});