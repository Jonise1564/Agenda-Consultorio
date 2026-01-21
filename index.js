// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');
// const fs = require('fs'); // Necesario para crear la carpeta de subidas

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // =====================
// // CARPETAS Y ESTÁTICOS
// // =====================
// // 1. Servir archivos públicos (CSS, JS, Imágenes)
// // app.use(express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// // 2. Crear carpeta para DNI si no existe (Ruta: public/uploads/dnis)
// const uploadDir = path.join(__dirname, 'public/uploads/dnis');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//     console.log(' Carpeta de fotos DNI verificada/creada');
// }

// // =====================
// // VIEW ENGINE
// // =====================
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// // =====================
// // MIDDLEWARES
// // =====================
// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());
// // extended: true permite recibir datos complejos (como los que envía Multer)
// app.use(express.urlencoded({ extended: true })); 

// // =====================
// // ROUTERS (Importación)
// // =====================
// const MedicosRouter = require('./routes/medicosRoutes');
// const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const AgendasRouter = require('./routes/agendasRoutes');
// const TurnosRouter = require('./routes/turnosRoutes');
// const obrasSocialesRouter = require('./routes/obrassocialesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes');
// const listaEsperaRoutes = require('./routes/listaEsperaRoutes');

// // =====================
// // RUTA HOME
// // =====================
// app.get('/', (req, res) => {
//   res.render('principal/index', { page: 'inicio' });
// });

// // =====================
// // REGISTRO DE RUTAS
// // =====================
// app.use('/medicos', MedicosRouter);
// app.use('/especialidades', EspecialidadesRoutes);
// app.use('/pacientes', PacientesRouter);
// app.use('/agendas', AgendasRouter);
// app.use('/turnos', TurnosRouter);
// app.use('/obrassociales', obrasSocialesRouter);
// app.use('/secretaria', SecretariaRouter);
// app.use('/secretaria/lista-espera', listaEsperaRoutes);

// // =====================
// // MANEJO DE ERRORES
// // =====================
// app.use((err, req, res, next) => {
//   console.error(' Error detectado:', err.message);
//   console.error(err.stack);
//   res.status(500).send('Algo salió mal en el servidor.');
// });


// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// // =====================
// // LANZAR SERVIDOR
// // =====================
// app.listen(PORT, () => {
//   console.log(` Servidor corriendo en: http://localhost:${PORT}`);
// });



// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
// // require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // CONFIGURACIONES BÁSICAS
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));
// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // MIDDLEWARE DE AUTENTICACIÓN (Recupera al usuario para todas las vistas)
// app.use((req, res, next) => {
//     const token = req.cookies.token_acceso;
//     res.locals.usuario = null; 
    
//     if (token) {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
//             res.locals.usuario = decoded; 
//             req.user = decoded; // Esto es vital para los controladores
//         } catch (err) {
//             res.clearCookie('token_acceso');
//         }
//     }
//     next();
// });

// // IMPORTACIÓN DE ROUTERS
// const AuthRouter = require('./routes/authRoutes');
// const MedicosRouter = require('./routes/medicosRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes');
// // ... (agrega los demás que necesites aquí)

// // REGISTRO DE RUTAS
// app.use('/auth', AuthRouter);

// // EL CEREBRO DE REDIRECCIÓN (Corregido para no fallar)
// app.get('/', (req, res) => {
//     const user = res.locals.usuario;
//     if (!user) return res.redirect('/auth/login');

//     console.log("Navegando al inicio. Rol detectado:", user.id_rol);

//     if (user.id_rol === 4) return res.redirect('/pacientes/dashboard');
//     if (user.id_rol === 3) return res.redirect('/secretaria');
    
//     // Si es Admin (1) o cualquier otro, al index principal
//     res.render('principal/index', { page: 'inicio' });
// });

// // MONTAR LOS ROUTERS
// app.use('/pacientes', PacientesRouter);
// app.use('/secretaria', SecretariaRouter);
// app.use('/medicos', MedicosRouter);
// // ... (monta los demás aquí)

// // MANEJO DE ERRORES (Simple para que no oculte el error real)
// app.use((err, req, res, next) => {
//     console.error("ERROR EN EL SERVIDOR:", err.stack);
//     res.status(500).send(`Error interno: ${err.message}`);
// });

// app.listen(PORT, () => {
//     console.log(`Servidor en http://localhost:${PORT}`);
// });

// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
// // require('dotenv').config(); // Descomenta si usas .env

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // CONFIGURACIONES BÁSICAS
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));
// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // MIDDLEWARE DE AUTENTICACIÓN
// app.use((req, res, next) => {
//     const token = req.cookies.token_acceso;
//     res.locals.usuario = null; 
//     if (token) {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
//             res.locals.usuario = decoded; 
//             req.user = decoded; 
//         } catch (err) {
//             res.clearCookie('token_acceso');
//         }
//     }
//     next();
// });

// // =====================
// // IMPORTACIÓN DE ROUTERS
// // =====================
// const AuthRouter = require('./routes/authRoutes');
// const MedicosRouter = require('./routes/medicosRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes');
// const AgendasRouter = require('./routes/agendasRoutes'); 
// const TurnosRouter = require('./routes/turnosRoutes'); 
// const EspecialidadesRouter = require('./routes/especialidadesRoutes'); 

// // =====================
// // REGISTRO DE RUTAS
// // =====================
// app.use('/auth', AuthRouter);

// app.get('/', (req, res) => {
//     const user = res.locals.usuario;
//     if (!user) return res.redirect('/auth/login');

//     if (user.id_rol === 4) return res.redirect('/pacientes/dashboard');
//     if (user.id_rol === 3) return res.redirect('/secretaria');
    
//     res.render('principal/index', { page: 'inicio' });
// });

// // MONTAR LOS ROUTERS
// app.use('/pacientes', PacientesRouter);
// app.use('/secretaria', SecretariaRouter);
// app.use('/medicos', MedicosRouter);
// app.use('/agendas', AgendasRouter); // AGREGADO - Esto quita el 404
// app.use('/turnos', TurnosRouter); // AGREGADO
// app.use('/especialidades', EspecialidadesRouter); // AGREGADO

// // MANEJO DE ERRORES
// app.use((err, req, res, next) => {
//     console.error("ERROR EN EL SERVIDOR:", err.stack);
//     res.status(500).send(`Error interno: ${err.message}`);
// });

// app.listen(PORT, () => {
//     console.log(` Servidor en http://localhost:${PORT}`);
// });


// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
// // require('dotenv').config(); // Descomenta si usas .env

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // CONFIGURACIONES BÁSICAS
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));
// app.use(morgan('dev'));
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // MIDDLEWARE DE AUTENTICACIÓN
// app.use((req, res, next) => {
//     const token = req.cookies.token_acceso;
//     res.locals.usuario = null; 
//     if (token) {
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
//             res.locals.usuario = decoded; 
//             req.user = decoded; 
//         } catch (err) {
//             res.clearCookie('token_acceso');
//         }
//     }
//     next();
// });

// // =====================
// // IMPORTACIÓN DE ROUTERS
// // =====================
// const AuthRouter = require('./routes/authRoutes');
// const MedicosRouter = require('./routes/medicosRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes');
// const AgendasRouter = require('./routes/agendasRoutes');
// const TurnosRouter = require('./routes/turnosRoutes');
// const EspecialidadesRouter = require('./routes/especialidadesRoutes');
// // LÍNEA AGREGADA:
// const ObrasSocialesRouter = require('./routes/obrasSocialesRoutes'); 

// // =====================
// // REGISTRO DE RUTAS
// // =====================
// app.use('/auth', AuthRouter);

// app.get('/', (req, res) => {
//     const user = res.locals.usuario;
//     if (!user) return res.redirect('/auth/login');

//     if (user.id_rol === 4) return res.redirect('/pacientes/dashboard');
//     if (user.id_rol === 3) return res.redirect('/secretaria');
    
//     res.render('principal/index', { page: 'inicio' });
// });

// // MONTAR LOS ROUTERS
// app.use('/pacientes', PacientesRouter);
// app.use('/secretaria', SecretariaRouter);
// app.use('/medicos', MedicosRouter);
// app.use('/agendas', AgendasRouter);
// app.use('/turnos', TurnosRouter);
// app.use('/especialidades', EspecialidadesRouter);
// // LÍNEA AGREGADA:
// app.use('/obrassociales', ObrasSocialesRouter); 

// // MANEJO DE ERRORES
// app.use((err, req, res, next) => {
//     console.error("ERROR EN EL SERVIDOR:", err.stack);
//     res.status(500).send(`Error interno: ${err.message}`);
// });

// app.listen(PORT, () => {
//     console.log(`\n Servidor corriendo con éxito`);
//     console.log(` Acceso: http://localhost:${PORT}`);
    
// });

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
// require('dotenv').config(); // Descomenta si usas .env

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
// IMPORTACIÓN DE ROUTERS
// =====================
const AuthRouter = require('./routes/authRoutes');
const MedicosRouter = require('./routes/medicosRoutes');
const PacientesRouter = require('./routes/pacientesRoutes');
const SecretariaRouter = require('./routes/secretariaRoutes');
const AgendasRouter = require('./routes/agendasRoutes');
const TurnosRouter = require('./routes/turnosRoutes');
const EspecialidadesRouter = require('./routes/especialidadesRoutes');
const ObrasSocialesRouter = require('./routes/obrasSocialesRoutes'); 
// NUEVA IMPORTACIÓN:
const ListaEsperaRouter = require('./routes/listaEsperaRoutes'); 

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

// NUEVO MONTAJE: Conecta el prefijo con el router
app.use('/secretaria/lista-espera', ListaEsperaRouter); 

// MANEJO DE ERRORES
app.use((err, req, res, next) => {
    console.error("ERROR EN EL SERVIDOR:", err.stack);
    res.status(500).send(`Error interno: ${err.message}`);
});

app.listen(PORT, () => {
    console.log(`\n Servidor corriendo con éxito`);
    console.log(` Acceso: http://localhost:${PORT}`);
});