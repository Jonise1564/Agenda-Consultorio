// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');
// const fs = require('fs'); // 👈 Importamos File System

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // ======================
// // CREACIÓN AUTOMÁTICA DE CARPETAS (PATH)
// // ======================
// const uploadPath = path.join(__dirname, 'public/uploads/dnis');
// if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
//     console.log('📁 Carpeta creada: public/uploads/dnis');
// }

// // ======================
// // ARCHIVOS ESTÁTICOS
// // ======================
// // Esta línea es la que permite que el navegador vea las fotos
// app.use(express.static(path.join(__dirname, 'public')));

// // ... (Resto de tu configuración de View Engine y Body Parsers)
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
// app.use(cors());

// // ======================
// // USO DE RUTAS
// // ======================
// const MedicosRouter = require('./routes/medicosRoutes');
// const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const AgendasRouter = require('./routes/agendasRoutes');
// const TurnosRouter = require('./routes/turnosRoutes');
// const ObrasSocialesRouter = require('./routes/obrassocialesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes'); 
// const listaEsperaRoutes = require('./routes/listaEsperaRoutes');

// app.get('/', (req, res) => {
//     res.render('principal/index', { page: 'inicio' });
// });

// app.use('/medicos', MedicosRouter);
// app.use('/especialidades', EspecialidadesRoutes);
// app.use('/pacientes', PacientesRouter);
// app.use('/agendas', AgendasRouter);
// app.use('/turnos', TurnosRouter); // 👈 Aquí Multer hará su magia
// app.use('/obrassociales', ObrasSocialesRouter);
// app.use('/secretaria', SecretariaRouter);
// app.use('/secretaria/lista-espera', listaEsperaRoutes);

// // ... (Manejo de errores y Listen)
// app.use((err, req, res, next) => {
//     console.error('Error:', err.message);
//     res.status(500).send('Algo Salio MAL!');
// });
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// app.listen(PORT, () => {
//     console.log(`Server listening on http://localhost:${PORT}`);
// });

// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');
// const fs = require('fs');
// const cookieParser = require('cookie-parser'); // 👈 Movido arriba
// const jwt = require('jsonwebtoken'); // 👈 Necesario para el middleware global

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // ======================
// // CONFIGURACIONES BÁSICAS
// // ======================
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser()); // 👈 IMPORTANTE: Antes de las rutas
// app.use(express.static(path.join(__dirname, 'public')));

// // ======================
// // CREACIÓN DE CARPETAS
// // ======================
// const uploadPath = path.join(__dirname, 'public/uploads/dnis');
// if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
// }

// // ======================
// // MIDDLEWARE GLOBAL PARA PUG
// // ======================
// // Este bloque hace que la variable 'usuario' esté disponible en todos tus .pug
// app.use((req, res, next) => {
//     const token = req.cookies.token_acceso;
//     res.locals.usuario = null; // Valor por defecto
    
//     if (token) {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
//             res.locals.usuario = decoded; // Datos del token disponibles en layout.pug
//         } catch (err) {
//             res.clearCookie('token_acceso');
//         }
//     }
//     next();
// });

// // ======================
// // IMPORTACIÓN DE RUTAS
// // ======================
// const AuthRouter = require('./routes/authRoutes'); // 👈 Nueva ruta de Auth
// const MedicosRouter = require('./routes/medicosRoutes');
// const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const AgendasRouter = require('./routes/agendasRoutes');
// const TurnosRouter = require('./routes/turnosRoutes');
// const ObrasSocialesRouter = require('./routes/obrassocialesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes'); 
// const listaEsperaRoutes = require('./routes/listaEsperaRoutes');

// // ======================
// // USO DE RUTAS
// // ======================

// // 1. Rutas Públicas (Login y Registro)
// app.use('/auth', AuthRouter);

// // 2. Ruta Raíz (Redirigir a login si no hay usuario o a dashboard)
// app.get('/', (req, res) => {
//     if (res.locals.usuario) {
//         res.render('principal/index', { page: 'inicio' });
//     } else {
//         res.redirect('/auth/login');
//     }
// });

// // 3. Rutas Protegidas (El middleware de protección se pone dentro de cada archivo de ruta)
// app.use('/medicos', MedicosRouter);
// app.use('/especialidades', EspecialidadesRoutes);
// app.use('/pacientes', PacientesRouter);
// app.use('/agendas', AgendasRouter);
// app.use('/turnos', TurnosRouter);
// app.use('/obrassociales', ObrasSocialesRouter);
// app.use('/secretaria', SecretariaRouter);
// app.use('/secretaria/lista-espera', listaEsperaRoutes);

// // ======================
// // MANEJO DE ERRORES
// // ======================
// app.use((err, req, res, next) => {
//     console.error('Error:', err.message);
//     res.status(500).send('Algo Salio MAL!');
// });

// app.listen(PORT, () => {
//     console.log(`Server listening on http://localhost:${PORT}`);
// });