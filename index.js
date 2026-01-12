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
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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