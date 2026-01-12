const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs'); // 👈 Importamos File System

const app = express();
const PORT = process.env.PORT ?? 3000;

// ======================
// CREACIÓN AUTOMÁTICA DE CARPETAS (PATH)
// ======================
const uploadPath = path.join(__dirname, 'public/uploads/dnis');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('📁 Carpeta creada: public/uploads/dnis');
}

// ======================
// ARCHIVOS ESTÁTICOS
// ======================
// Esta línea es la que permite que el navegador vea las fotos
app.use(express.static(path.join(__dirname, 'public')));

// ... (Resto de tu configuración de View Engine y Body Parsers)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// ======================
// USO DE RUTAS
// ======================
const MedicosRouter = require('./routes/medicosRoutes');
const EspecialidadesRoutes = require('./routes/especialidadesRoutes');
const PacientesRouter = require('./routes/pacientesRoutes');
const AgendasRouter = require('./routes/agendasRoutes');
const TurnosRouter = require('./routes/turnosRoutes');
const ObrasSocialesRouter = require('./routes/obrassocialesRoutes');
const SecretariaRouter = require('./routes/secretariaRoutes'); 
const listaEsperaRoutes = require('./routes/listaEsperaRoutes');

app.get('/', (req, res) => {
    res.render('principal/index', { page: 'inicio' });
});

app.use('/medicos', MedicosRouter);
app.use('/especialidades', EspecialidadesRoutes);
app.use('/pacientes', PacientesRouter);
app.use('/agendas', AgendasRouter);
app.use('/turnos', TurnosRouter); // 👈 Aquí Multer hará su magia
app.use('/obrassociales', ObrasSocialesRouter);
app.use('/secretaria', SecretariaRouter);
app.use('/secretaria/lista-espera', listaEsperaRoutes);

// ... (Manejo de errores y Listen)
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send('Algo Salio MAL!');
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});