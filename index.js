const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
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

// CONFIGURACIONES BÁSICAS
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MIDDLEWARE DE AUTENTICACIÓN
app.use((req, res, next) => {
    const token = req.cookies.token_acceso;
    res.locals.usuario = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
            res.locals.usuario = decoded;
            req.user = decoded;
        } catch (err) {
            res.clearCookie('token_acceso');
        }
    }
    next();
});

// =====================
// REGISTRO DE RUTAS
// =====================
app.use('/auth', AuthRouter);

app.get('/', (req, res) => {
    const user = res.locals.usuario;
    if (!user) return res.redirect('/auth/login');

    if (user.id_rol === 4) return res.redirect('/pacientes/dashboard');
    if (user.id_rol === 3) return res.redirect('/secretaria');

    res.render('principal/index', { page: 'inicio' });
});

// MONTAR LOS ROUTERS
app.use('/pacientes', PacientesRouter);
app.use('/secretaria', SecretariaRouter);
app.use('/medicos', MedicosRouter);
app.use('/agendas', AgendasRouter);
app.use('/turnos', TurnosRouter);
app.use('/especialidades', EspecialidadesRouter);
app.use('/obrassociales', ObrasSocialesRouter);
app.use('/secretaria/lista-espera', ListaEsperaRouter);
app.use('/admin', AdminRouter);

// MANEJO DE ERRORES (Dejar siempre después de las rutas)
app.use((err, req, res, next) => {
    console.error("ERROR EN EL SERVIDOR:", err.stack);
    res.status(500).send(`Error interno: ${err.message}`);
});

// =====================
// TAREAS PROGRAMADAS (Cron Jobs)
// =====================

    // Notificación de turno 24 hs antes - Se ejecuta a las 09:00 AM todos los días
    cron.schedule('0 9 * * *', async () => {
        console.log('--- [' + new Date().toLocaleString() + '] Iniciando envío de recordatorios diarios ---');
        try {
            await procesarRecordatorios();
        } catch (error) {
            console.error('Error crítico en el Cron Job de recordatorios:', error);
        }
    });

// LANZAMIENTO DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo con éxito`);
    console.log(`🔗 Acceso: http://localhost:${PORT}`);
    console.log(`⏰ Cron Job configurado para las 09:00 AM`);
});