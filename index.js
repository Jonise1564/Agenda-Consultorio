// // const express = require('express')
// // const bodyParser = require('body-parser')
// // const pug = require('pug')
// // const app = express()
// // const path = require('path');
// // const morgan = require('morgan')
// // const cors = require('cors');

// // const PORT = process.env.PORT ?? 3000

// // app.use(express.static(path.join(__dirname, 'public')));

// // const MedicosRouter = require('./routes/medicosRoutes');
// // const EspecialidadesRoutes = require('./routes/especialidadesRoutes');

// // const PacientesRouter = require('./routes/pacientesRoutes')
// // const AgendasRouter = require('./routes/agendasRoutes')
// // const TurnosRouter = require('./routes/turnosRoutes');
// // const obrasSocialesRouter = require('./routes/obrassocialesRoutes');
// // const SecretariaRouter = require('./routes/secretariaRoutes'); 
// // // const listaEsperaRoutes = require('./routes/listaEsperaRoutes');




// // const Especialidad = require('./models/especialidadesModels');



// // app.set('view engine', 'pug')
// // app.set('views', 'views')

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: false }));


// // // Configurar Morgan para registrar solicitudes en la consola

// // app.use(morgan('dev'));
// // app.use(bodyParser.json())
// // app.use(bodyParser.urlencoded({ extended: true }))
// // app.use(cors());
// // // Manejo de errores
// // app.use((err, req, res, next) => {
// //     console.error('Error status:', res.statusCode);
// //     console.error('Error message:', err.message);
// //     console.error('Stack trace:', err.stack);
// //     res.status(500).send('Something broke!');
// // });
// // // Ruta para la página de inicio
// // app.get('/', (req, res) => {
// //     res.render('principal/index'); 
// //   });

// // app.use('/medicos', MedicosRouter);
// // //Gestion especialidades
// // app.use('/especialidades', EspecialidadesRoutes);
// // //Gestion Pacientes
// // app.use('/pacientes', PacientesRouter)
// // //Gestion Agendas
// // app.use('/agendas', AgendasRouter)
// // //Gestion Turnos
// // app.use('/turnos', TurnosRouter)
// // //Gestion obras sociales
// // app.use('/obrassociales', obrasSocialesRouter)
// // //Panel secretaria
// //  app.use('/secretaria', SecretariaRouter);
// // app.use('/secretaria/lista-espera', listaEsperaRoutes);
  
// // app.listen(PORT, () => {
// //     console.log(`Server listening on port http://localhost:${PORT}`)
// // })


// const express = require('express');
// const bodyParser = require('body-parser');
// const pug = require('pug');
// const app = express();
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');

// const PORT = process.env.PORT ?? 3000;

// app.use(express.static(path.join(__dirname, 'public')));

// // =====================
// // ROUTERS
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
// // VIEW ENGINE
// // =====================
// app.set('view engine', 'pug');
// app.set('views', 'views');

// // =====================
// // MIDDLEWARES
// // =====================
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
// app.use(morgan('dev'));

// // =====================
// // HOME
// // =====================
// app.get('/', (req, res) => {
//   res.render('principal/index');
// });

// // =====================
// // ROUTES
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
// // ERROR HANDLER (AL FINAL)
// // =====================
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });


const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs'); // Necesario para crear la carpeta de subidas

const app = express();
const PORT = process.env.PORT ?? 3000;

// =====================
// CARPETAS Y ESTÁTICOS
// =====================
// 1. Servir archivos públicos (CSS, JS, Imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// 2. Crear carpeta para DNI si no existe (Ruta: public/uploads/dnis)
const uploadDir = path.join(__dirname, 'public/uploads/dnis');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(' Carpeta de fotos DNI verificada/creada');
}

// =====================
// VIEW ENGINE
// =====================
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// =====================
// MIDDLEWARES
// =====================
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
// extended: true permite recibir datos complejos (como los que envía Multer)
app.use(express.urlencoded({ extended: true })); 

// =====================
// ROUTERS (Importación)
// =====================
const MedicosRouter = require('./routes/medicosRoutes');
const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
const PacientesRouter = require('./routes/pacientesRoutes');
const AgendasRouter = require('./routes/agendasRoutes');
const TurnosRouter = require('./routes/turnosRoutes');
const obrasSocialesRouter = require('./routes/obrassocialesRoutes');
const SecretariaRouter = require('./routes/secretariaRoutes');
const listaEsperaRoutes = require('./routes/listaEsperaRoutes');

// =====================
// RUTA HOME
// =====================
app.get('/', (req, res) => {
  res.render('principal/index', { page: 'inicio' });
});

// =====================
// REGISTRO DE RUTAS
// =====================
app.use('/medicos', MedicosRouter);
app.use('/especialidades', EspecialidadesRoutes);
app.use('/pacientes', PacientesRouter);
app.use('/agendas', AgendasRouter);
app.use('/turnos', TurnosRouter);
app.use('/obrassociales', obrasSocialesRouter);
app.use('/secretaria', SecretariaRouter);
app.use('/secretaria/lista-espera', listaEsperaRoutes);

// =====================
// MANEJO DE ERRORES
// =====================
app.use((err, req, res, next) => {
  console.error(' Error detectado:', err.message);
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor.');
});

// =====================
// LANZAR SERVIDOR
// =====================
app.listen(PORT, () => {
  console.log(` Servidor corriendo en: http://localhost:${PORT}`);
});