
// const express = require('express');
// const pug = require('pug');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // ======================
// // ARCHIVOS ESTÁTICOS
// // ======================
// app.use(express.static(path.join(__dirname, 'public')));

// // ======================
// // VIEW ENGINE
// // ======================
// app.set('view engine', 'pug');
// app.set('views', 'views');

// // ======================
// // BODY PARSERS (CORRECTOS)
// // ======================
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // NECESARIO PARA telefonos
// // ======================
// // MIDDLEWARES
// // ======================
// app.use(morgan('dev'));
// app.use(cors());

// // ======================
// // RUTAS
// // ======================
// const MedicosRouter = require('./routes/medicosRoutes');
// const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const AgendasRouter = require('./routes/agendasRoutes');
// const TurnosRouter = require('./routes/turnosRoutes');
// const obrasSocialesRouter = require('./routes/obrassocialesRoutes');

// app.get('/', (req, res) => {
//   res.render('principal/index');
// });

// app.use('/medicos', MedicosRouter);
// app.use('/especialidades', EspecialidadesRoutes);
// app.use('/pacientes', PacientesRouter);
// app.use('/agendas', AgendasRouter);
// app.use('/turnos', TurnosRouter);
// app.use('/obrassociales', obrasSocialesRouter);
// app.use('/secretaria', secretariaRoutes);

// // ======================
// // MANEJO DE ERRORES
// // ======================
// app.use((err, req, res, next) => {
//   console.error('Error status:', res.statusCode);
//   console.error('Error message:', err.message);
//   console.error('Stack trace:', err.stack);
//   res.status(500).send('Something broke!');
// });

// // ======================
// // SERVER
// // ======================
// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });
// app.use(express.urlencoded({ extended: true }));





// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // ======================
// // ARCHIVOS ESTÁTICOS
// // ======================
// app.use(express.static(path.join(__dirname, 'public')));

// // ======================
// // VIEW ENGINE
// // ======================
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// // ======================
// // BODY PARSERS
// // ======================
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ======================
// // MIDDLEWARES
// // ======================
// app.use(morgan('dev'));
// app.use(cors());

// // ======================
// // RUTAS
// // ======================
// const MedicosRouter = require('./routes/medicosRoutes');
// const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const AgendasRouter = require('./routes/agendasRoutes');
// const TurnosRouter = require('./routes/turnosRoutes');
// const ObrasSocialesRouter = require('./routes/obrassocialesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes'); // 👈 FALTABA

// // ======================
// // HOME
// // ======================
// app.get('/', (req, res) => {
//   res.render('principal/index', { page: 'inicio' });
// });

// // ======================
// // REGISTRO DE RUTAS
// // ======================
// app.use('/medicos', MedicosRouter);
// app.use('/especialidades', EspecialidadesRoutes);
// app.use('/pacientes', PacientesRouter);
// app.use('/agendas', AgendasRouter);
// app.use('/turnos', TurnosRouter);
// app.use('/obrassociales', ObrasSocialesRouter);
// app.use('/secretaria', SecretariaRouter); // 👈 CLAVE

// // ======================
// // MANEJO DE ERRORES
// // ======================
// app.use((err, req, res, next) => {
//   console.error('Error:', err.message);
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// // ======================
// // SERVER
// // ======================
// app.listen(PORT, () => {
//   console.log(`✅ Server listening on http://localhost:${PORT}`);
// });






// const express = require('express');
// const path = require('path');
// const morgan = require('morgan');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT ?? 3000;

// // ======================
// // ARCHIVOS ESTÁTICOS
// // ======================
// app.use(express.static(path.join(__dirname, 'public')));

// // ======================
// // VIEW ENGINE
// // ======================
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// // ======================
// // BODY PARSERS
// // ======================
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ======================
// // MIDDLEWARES
// // ======================
// app.use(morgan('dev'));
// app.use(cors());

// // ======================
// // RUTAS
// // ======================
// const MedicosRouter = require('./routes/medicosRoutes');
// const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
// const PacientesRouter = require('./routes/pacientesRoutes');
// const AgendasRouter = require('./routes/agendasRoutes');
// const TurnosRouter = require('./routes/turnosRoutes');
// const ObrasSocialesRouter = require('./routes/obrassocialesRoutes');
// const SecretariaRouter = require('./routes/secretariaRoutes'); // ✅ ESTA FALTABA

// // ======================
// // RUTA HOME
// // ======================
// app.get('/', (req, res) => {
//     res.render('principal/index', { page: 'inicio' });
// });

// // ======================
// // USO DE RUTAS
// // ======================
// app.use('/medicos', MedicosRouter);
// app.use('/especialidades', EspecialidadesRoutes);
// app.use('/pacientes', PacientesRouter);
// app.use('/agendas', AgendasRouter);
// app.use('/turnos', TurnosRouter);
// app.use('/obrassociales', ObrasSocialesRouter);
// app.use('/secretaria', SecretariaRouter); // ✅ AHORA FUNCIONA

// // ======================
// // MANEJO DE ERRORES
// // ======================
// app.use((err, req, res, next) => {
//     console.error('Error status:', res.statusCode);
//     console.error('Error message:', err.message);
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });

// // ======================
// // SERVER
// // ======================
// app.listen(PORT, () => {
//     console.log(`Server listening on http://localhost:${PORT}`);
// });



  const express = require('express');
  const path = require('path');
  const morgan = require('morgan');
  const cors = require('cors');

  const app = express();
  const PORT = process.env.PORT ?? 3000;

  // ======================
  // ARCHIVOS ESTÁTICOS
  // ======================
  app.use(express.static(path.join(__dirname, 'public')));

  // ======================
  // VIEW ENGINE
  // ======================
  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, 'views'));

  // ======================
  // BODY PARSERS
  // ======================
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ======================
  // MIDDLEWARES
  // ======================
  app.use(morgan('dev'));
  app.use(cors());

  // ======================
  // RUTAS
  // ======================
  const MedicosRouter = require('./routes/medicosRoutes');
  const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
  const PacientesRouter = require('./routes/pacientesRoutes');
  const AgendasRouter = require('./routes/agendasRoutes');
  const TurnosRouter = require('./routes/turnosRoutes');
  const ObrasSocialesRouter = require('./routes/obrassocialesRoutes');
  console.log('➡️ Voy a cargar secretariaRoutes');
  const SecretariaRouter = require('./routes/secretariaRoutes'); 
  console.log('✅ secretariaRoutes importado');

  // ======================
  // RUTA HOME
  // ======================
  app.get('/', (req, res) => {
      res.render('principal/index', { page: 'inicio' });
  });

  // ======================
  // USO DE RUTAS
  // ======================
  app.use('/medicos', MedicosRouter);
  app.use('/especialidades', EspecialidadesRoutes);
  app.use('/pacientes', PacientesRouter);
  app.use('/agendas', AgendasRouter);
  app.use('/turnos', TurnosRouter);
  app.use('/obrassociales', ObrasSocialesRouter);
  app.use('/secretaria', SecretariaRouter);

  // ======================
  // MANEJO DE ERRORES
  // ======================
  app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      console.error(err.stack);
      res.status(500).send('Something broke!');
  });

  // ======================
  // SERVER
  // ======================
  app.listen(PORT, () => {
      console.log(` Server listening on http://localhost:${PORT}`);
  });
