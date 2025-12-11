// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');

// class PacientesController {

//     // ===========================================
//     // LISTAR PACIENTES
//     // ===========================================
//     async get(req, res, next) {
//         console.log('Controller: Get All pacientes');

//         try {
//             const pacientes = await Paciente.getAll();

//             const pacientesConFechaFormateada = pacientes.map(p => ({
//                 ...p,
//                 nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
//             }));

//             const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;

//             let mensaje = null;
//             if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
//             else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
//             else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
//             else if (nombreStore) mensaje = 'Paciente Creado correctamente';

//             res.render('pacientes/index', { pacientes: pacientesConFechaFormateada, mensaje });

//         } catch (error) {
//             console.error('Error al obtener pacientes:', error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM CREAR PACIENTE
//     // ===========================================
//     async getCreateForm(req, res, next) {
//         try {
//             const obrasSociales = await Paciente.getAllOS();
//             res.render('pacientes/crear', { obrasSociales });
//         } catch (error) {
//             console.error('Error al cargar obras sociales:', error);
//             next(error);
//         }
//     }

//     // Vista create (innecesaria pero la dejamos si la usabas)
//     create(req, res) {
//         res.render('pacientes/crear');
//     }

//     // ===========================================
//     // CREAR PACIENTE
//     // ===========================================
//     async store(req, res, next) {
//         console.log('Controller: Create paciente');

//         try {
//             const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
//             const { nombreStore } = req.query;

//             if (password !== repeatPassword)
//                 return res.status(400).json({ error: 'Las contraseñas no coinciden' });

//             const result = validatePacientes({
//                 dni,
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 id_rol,
//                 estado,
//                 telefonos,
//                 obra_sociales
//             });

//             if (!result.success)
//                 return res.status(422).json({ error: result.error.issues });

//             const data = result.data;

//             // Persona
//             const existePersona = await Persona.getById({ dni: data.dni });
//             if (existePersona)
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });

//             const persona = await Persona.create({
//                 dni: data.dni,
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             if (!persona) throw new Error('Error al crear Persona');

//             // Usuario
//             const usuario = await Usuario.create({
//                 dni: data.dni,
//                 email,
//                 password,
//                 id_rol: data.id_rol
//             });

//             if (!usuario) throw new Error('Error al crear Usuario');

//             // Paciente
//             const paciente = await Paciente.create({
//                 dni: data.dni,
//                 id_usuario: usuario.id,
//                 estado: data.estado,
//                 telefonos: data.telefonos,
//                 obra_sociales: data.obra_sociales
//             });

//             if (!paciente) throw new Error('Error al crear Paciente');

//             res.redirect(`/pacientes?nombreStore=${nombreStore}`);

//         } catch (error) {
//             console.error('Error al crear paciente:', error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // EDITAR PACIENTE (VISTA)
//     // ===========================================
//     // async edit(req, res, next) {
//     //     try {
//     //         const { id } = req.params;

//     //         const obraSocialActual = await Paciente.getObraSocialByDni(dni);
//     //         const todasObras = await Paciente.getAllOS();
//     //         const persona = await Persona.getByDni(dni);
//     //         const { usuario, telefonos } = await Usuario.getByDni(dni);
//     //         const paciente = await Paciente.getPacienteByDni(id);

//     //         if (!persona || !usuario || !paciente)
//     //             return res.status(404).send('Paciente no encontrado');

//     //         res.render('pacientes/editar', {
//     //             persona,
//     //             usuario,
//     //             paciente,
//     //             obra_social: obraSocialActual,
//     //             obrasSociales: todasObras,
//     //             telefonos
//     //         });

//     //     } catch (error) {
//     //         console.error('Error cargando edición:', error);
//     //         next(error);
//     //     }
//     // }

//     async edit(req, res, next) {
//     try {
//         const { id } = req.params;  // ID del paciente (pa.id)

//         // 1) Obtener paciente completo por ID
//         const paciente = await Paciente.getPacienteById(id);

//         if (!paciente)
//             return res.status(404).send('Paciente no encontrado');

//         const dni = paciente.dni;            // tomamos el DNI real
//         const id_usuario = paciente.id_usuario;

//         // 2) Datos relacionados
//         const persona = await Persona.getByDni(dni);
//         const { usuario, telefonos } = await Usuario.getByDni(dni);
//         const obraSocialActual = await Paciente.getObraSocialByDni(dni);
//         const todasObras = await Paciente.getAllOS();

//         res.render('pacientes/editar', {
//             persona,
//             usuario,
//             paciente,
//             obra_social: obraSocialActual,
//             obrasSociales: todasObras,
//             telefonos
//         });

//     } catch (error) {
//         console.error('Error cargando edición:', error);
//         next(error);
//     }
// }


//     // ===========================================
//     // ACTUALIZAR PACIENTE
//     // ===========================================
//     async update(req, res, next) {
//         console.log('Controller: Update paciente');

//         try {
//             const { dni } = req.params;
//             const { nombre, apellido, nacimiento, email, password, telefonoAlternativo, obras_sociales } = req.body;

//             const result = validatePartialPacientes({
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 telefonoAlternativo: telefonoAlternativo ? parseInt(telefonoAlternativo) : null,
//                 obras_sociales
//             });

//             if (!result.success)
//                 return res.status(400).json({ error: JSON.parse(result.error.message) });

//             const data = result.data;

//             await Persona.updatePersona(dni, {
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             await Usuario.updateUsuario(dni, {
//                 email,
//                 password
//             });

//             if (data.obras_sociales) {
//                 await Paciente.updatePaciente(dni, {
//                     id_obra_social: data.obras_sociales
//                 });
//             }

//             const { usuario } = await Usuario.getByDni(dni);
//             if (telefonoAlternativo) {
//                 await Usuario.addTelefonoAlternativo(usuario.id, parseInt(telefonoAlternativo));
//             }

//             res.redirect(`/pacientes?nombreUpdate=${nombre}`);

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // INACTIVAR / ACTIVAR PACIENTE
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             const { dni } = req.params;
//             await Paciente.inactivarPaciente(dni);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             const { dni } = req.params;
//             await Paciente.activarPaciente(dni);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR PACIENTES ON-DEMAND (AJAX)
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const { query } = req.query;

//             if (!query || query.trim() === "") {
//                 return res.json([]);
//             }

//             const resultados = await Paciente.searchByNombreODni(query);

//             res.json(resultados);

//         } catch (error) {
//             console.error("Error buscando pacientes:", error);
//             res.status(500).json({ error: "Error buscando pacientes" });
//         }
//     }
// }

// module.exports = new PacientesController();


// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');

// class PacientesController {

//     // ===========================================
//     // LISTAR PACIENTES
//     // ===========================================
//     async get(req, res, next) {
//         try {
//             const pacientes = await Paciente.getAll();

//             const pacientesConFechaFormateada = pacientes.map(p => ({
//                 ...p,
//                 nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
//             }));

//             const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;

//             let mensaje = null;
//             if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
//             else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
//             else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
//             else if (nombreStore) mensaje = 'Paciente Creado correctamente';

//             res.render('pacientes/index', { pacientes: pacientesConFechaFormateada, mensaje });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM CREAR PACIENTE
//     // ===========================================
//     async getCreateForm(req, res, next) {
//         try {
//             const obrasSociales = await Paciente.getAllOS();
//             res.render('pacientes/crear', { obrasSociales });
//         } catch (error) {
//             next(error);
//         }
//     }

//     create(req, res) { res.render('pacientes/crear'); }

//     // ===========================================
//     // CREAR PACIENTE
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
//             const { nombreStore } = req.query;

//             if (password !== repeatPassword)
//                 return res.status(400).json({ error: 'Las contraseñas no coinciden' });

//             const result = validatePacientes({
//                 dni,
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 id_rol,
//                 estado,
//                 telefonos,
//                 obra_sociales
//             });

//             if (!result.success)
//                 return res.status(422).json({ error: result.error.issues });

//             const data = result.data;

//             // Persona
//             const existePersona = await Persona.getById({ dni: data.dni });
//             if (existePersona)
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });

//             const persona = await Persona.create({
//                 dni: data.dni,
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             if (!persona) throw new Error('Error al crear Persona');

//             // Usuario
//             const usuario = await Usuario.create({
//                 dni: data.dni,
//                 email,
//                 password,
//                 id_rol: data.id_rol
//             });

//             if (!usuario) throw new Error('Error al crear Usuario');

//             // Paciente
//             const paciente = await Paciente.create({
//                 id_persona: persona.id,
//                 id_usuario: usuario.id,
//                 id_obra_social: data.obra_sociales,
//                 estado: data.estado,
//                 telefono: telefonos
//             });

//             if (!paciente) throw new Error('Error al crear Paciente');

//             res.redirect(`/pacientes?nombreStore=${nombreStore}`);

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;  // ID del paciente (pa.id)

//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             const dni = paciente.dni;

//             const persona = await Persona.getByDni(dni);
//             const { usuario, telefonos } = await Usuario.getByDni(dni);
//             const obra_social = await Paciente.getObraSocialByDni(dni);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 persona,
//                 usuario,
//                 paciente,
//                 obra_social,
//                 obrasSociales,
//                 telefonos
//             });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ACTUALIZAR PACIENTE
//     // ===========================================
//     async update(req, res, next) {
//         try {
//             const { id } = req.params;  // ID DEL PACIENTE
//             const { nombre, apellido, nacimiento, email, password, telefonoAlternativo, obras_sociales } = req.body;

//             const result = validatePartialPacientes({
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 telefonoAlternativo: telefonoAlternativo ? parseInt(telefonoAlternativo) : null,
//                 obras_sociales
//             });

//             if (!result.success)
//                 return res.status(400).json({ error: JSON.parse(result.error.message) });

//             const data = result.data;

//             await Paciente.updatePaciente(id, {
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0],
//                 email,
//                 password,
//                 id_obra_social: data.obras_sociales
//             });

//             // Teléfono alternativo
//             if (telefonoAlternativo) {
//                 const paciente = await Paciente.getPacienteById(id);
//                 await Usuario.addTelefonoAlternativo(paciente.id_usuario, parseInt(telefonoAlternativo));
//             }

//             res.redirect(`/pacientes?nombreUpdate=${nombre}`);

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // INACTIVAR / ACTIVAR
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             const { id } = req.params; // ID paciente
//             await Paciente.inactivarPaciente(id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             const { id } = req.params; // ID paciente
//             await Paciente.activarPaciente(id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR PACIENTES (AJAX)
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const { query } = req.query;
//             if (!query || query.trim() === "") return res.json([]);

//             const resultados = await Paciente.searchByNombreODni(query);
//             res.json(resultados);

//         } catch (error) {
//             next(error);
//         }
//     }
// }

// module.exports = new PacientesController();


// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');

// class PacientesController {

//     // ===========================================
//     // LISTAR PACIENTES
//     // ===========================================
//     async get(req, res, next) {
//         try {
//             const pacientes = await Paciente.getAll();

//             const pacientesConFechaFormateada = pacientes.map(p => ({
//                 ...p,
//                 nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
//             }));

//             const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;

//             let mensaje = null;
//             if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
//             else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
//             else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
//             else if (nombreStore) mensaje = 'Paciente Creado correctamente';

//             res.render('pacientes/index', { pacientes: pacientesConFechaFormateada, mensaje });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM CREAR PACIENTE
//     // ===========================================
//     async getCreateForm(req, res, next) {
//         try {
//             const obrasSociales = await Paciente.getAllOS();
//             res.render('pacientes/crear', { obrasSociales });
//         } catch (error) {
//             next(error);
//         }
//     }

//     create(req, res) {
//         res.render('pacientes/crear');
//     }

//     // ===========================================
//     // CREAR PACIENTE
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
//             const { nombreStore } = req.query;

//             if (password !== repeatPassword)
//                 return res.status(400).json({ error: 'Las contraseñas no coinciden' });

//             const result = validatePacientes({
//                 dni,
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 id_rol,
//                 estado,
//                 telefonos,
//                 obra_sociales
//             });

//             if (!result.success)
//                 return res.status(422).json({ error: result.error.issues });

//             const data = result.data;

//             // Persona
//             const existePersona = await Persona.getById({ dni: data.dni });
//             if (existePersona)
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });

//             const persona = await Persona.create({
//                 dni: data.dni,
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             if (!persona) throw new Error('Error al crear Persona');

//             // Usuario
//             const usuario = await Usuario.create({
//                 dni: data.dni,
//                 email,
//                 password,
//                 id_rol: data.id_rol
//             });

//             if (!usuario) throw new Error('Error al crear Usuario');

//             // Paciente
//             const paciente = await Paciente.create({
//                 id_persona: persona.id,
//                 id_usuario: usuario.id,
//                 id_obra_social: data.obra_sociales,
//                 estado: data.estado,
//                 telefono: telefonos
//             });

//             if (!paciente) throw new Error('Error al crear Paciente');

//             res.redirect(`/pacientes?nombreStore=${nombreStore}`);

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;  // ID DEL PACIENTE

//             // =========================
//             // TRAER PACIENTE POR ID REAL
//             // =========================
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             const persona = await Persona.getByIdPersona(paciente.id_persona);
//             const usuario = await Usuario.getByIdUsuario(paciente.id_usuario);
//             const telefonos = await Usuario.getTelefonos(paciente.id_usuario);
//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 persona,
//                 usuario,
//                 paciente,
//                 obra_social,
//                 obrasSociales,
//                 telefonos
//             });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ACTUALIZAR PACIENTE
//     // ===========================================
//     async update(req, res, next) {
//         try {
//             const { id } = req.params;
//             const { nombre, apellido, nacimiento, email, password, telefonoAlternativo, obras_sociales } = req.body;

//             const result = validatePartialPacientes({
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 telefonoAlternativo: telefonoAlternativo ? parseInt(telefonoAlternativo) : null,
//                 obras_sociales
//             });

//             if (!result.success)
//                 return res.status(400).json({ error: JSON.parse(result.error.message) });

//             const data = result.data;

//             await Paciente.updatePaciente(id, {
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0],
//                 email,
//                 password,
//                 id_obra_social: data.obras_sociales
//             });

//             // Teléfono alternativo
//             if (telefonoAlternativo) {
//                 const paciente = await Paciente.getPacienteById(id);
//                 await Usuario.addTelefonoAlternativo(paciente.id_usuario, parseInt(telefonoAlternativo));
//             }

//             res.redirect(`/pacientes?nombreUpdate=${nombre}`);

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // INACTIVAR / ACTIVAR
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             const { id } = req.params;
//             await Paciente.inactivarPaciente(id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             const { id } = req.params;
//             await Paciente.activarPaciente(id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR PACIENTES (AJAX)
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const { query } = req.query;
//             if (!query || query.trim() === "") return res.json([]);

//             const resultados = await Paciente.searchByNombreODni(query);
//             res.json(resultados);

//         } catch (error) {
//             next(error);
//         }
//     }
// }

// module.exports = new PacientesController();


// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');

// class PacientesController {

//     // ===========================================
//     // LISTAR PACIENTES
//     // ===========================================
//     async get(req, res, next) {
//         try {
//             const pacientes = await Paciente.getAll();

//             const pacientesConFechaFormateada = pacientes.map(p => ({
//                 ...p,
//                 nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
//             }));

//             const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;

//             let mensaje = null;
//             if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
//             else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
//             else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
//             else if (nombreStore) mensaje = 'Paciente Creado correctamente';

//             res.render('pacientes/index', { pacientes: pacientesConFechaFormateada, mensaje });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM CREAR PACIENTE
//     // ===========================================
//     async getCreateForm(req, res, next) {
//         try {
//             const obrasSociales = await Paciente.getAllOS();
//             res.render('pacientes/crear', { obrasSociales });
//         } catch (error) {
//             next(error);
//         }
//     }

//     create(req, res) {
//         res.render('pacientes/crear');
//     }

//     // ===========================================
//     // CREAR PACIENTE
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
//             const { nombreStore } = req.query;

//             if (password !== repeatPassword)
//                 return res.status(400).json({ error: 'Las contraseñas no coinciden' });

//             const result = validatePacientes({
//                 dni,
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 id_rol,
//                 estado,
//                 telefonos,
//                 obra_sociales
//             });

//             if (!result.success)
//                 return res.status(422).json({ error: result.error.issues });

//             const data = result.data;

//             // Persona
//             const existePersona = await Persona.getById({ dni: data.dni });
//             if (existePersona)
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });

//             const persona = await Persona.create({
//                 dni: data.dni,
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             if (!persona) throw new Error('Error al crear Persona');

//             // Usuario
//             const usuario = await Usuario.create({
//                 dni: data.dni,
//                 email,
//                 password,
//                 id_rol: data.id_rol
//             });

//             if (!usuario) throw new Error('Error al crear Usuario');

//             // Paciente
//             const paciente = await Paciente.create({
//                 id_persona: persona.id,
//                 id_usuario: usuario.id,
//                 id_obra_social: data.obra_sociales,
//                 estado: data.estado,
//                 telefono: telefonos
//             });

//             if (!paciente) throw new Error('Error al crear Paciente');

//             res.redirect(`/pacientes?nombreStore=${nombreStore}`);

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;  // ID DEL PACIENTE

//             // Traer paciente por ID
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             // Traer persona y usuario usando getById unificado
//             const persona = await Persona.getById({ id: paciente.id_persona });

//             const usuario = await Usuario.getById({ id: paciente.id_usuario });
//             // Traer los teléfonos desde Persona
//             // const telefonos = await Persona.getTelefonos(paciente.id_persona);


//             const telefonos = await Usuario.getTelefonos(paciente.id_usuario);

//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 persona,
//                 usuario,
//                 paciente,
//                 obra_social,
//                 obrasSociales,
//                 telefonos
//             });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ACTUALIZAR PACIENTE
//     // ===========================================
//     async update(req, res, next) {
//         try {
//             const { id } = req.params;
//             const { nombre, apellido, nacimiento, email, password, telefonoAlternativo, obras_sociales } = req.body;

//             const result = validatePartialPacientes({
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 telefonoAlternativo: telefonoAlternativo ? parseInt(telefonoAlternativo) : null,
//                 obras_sociales
//             });

//             if (!result.success)
//                 return res.status(400).json({ error: JSON.parse(result.error.message) });

//             const data = result.data;

//             await Paciente.updatePaciente(id, {
//                 nombre,
//                 apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0],
//                 email,
//                 password,
//                 id_obra_social: data.obras_sociales
//             });

//             // Teléfono alternativo
//             if (telefonoAlternativo) {
//                 const paciente = await Paciente.getPacienteById(id);
//                 await Usuario.addTelefonoAlternativo(paciente.id_usuario, parseInt(telefonoAlternativo));
//             }

//             res.redirect(`/pacientes?nombreUpdate=${nombre}`);

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // INACTIVAR / ACTIVAR
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             const { id } = req.params;
//             await Paciente.inactivarPaciente(id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             const { id } = req.params;
//             await Paciente.activarPaciente(id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR PACIENTES (AJAX)
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const { query } = req.query;
//             if (!query || query.trim() === "") return res.json([]);

//             const resultados = await Paciente.searchByNombreODni(query);
//             res.json(resultados);

//         } catch (error) {
//             next(error);
//         }
//     }
// }

// module.exports = new PacientesController();
const Paciente = require('../models/pacientesModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');

const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');

class PacientesController {

    // ===========================================
    // LISTAR PACIENTES
    // ===========================================
    async get(req, res, next) {
        try {
            const pacientes = await Paciente.getAll();

            const pacientesConFechaFormateada = pacientes.map(p => ({
                ...p,
                nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
            }));

            const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;

            let mensaje = null;
            if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
            else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
            else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
            else if (nombreStore) mensaje = 'Paciente Creado correctamente';

            res.render('pacientes/index', { pacientes: pacientesConFechaFormateada, mensaje });

        } catch (error) {
            next(error);
        }
    }

    // ===========================================
    // FORM CREAR PACIENTE
    // ===========================================
    async getCreateForm(req, res, next) {
        try {
            const obrasSociales = await Paciente.getAllOS();
            res.render('pacientes/crear', { obrasSociales });
        } catch (error) {
            next(error);
        }
    }

    create(req, res) {
        res.render('pacientes/crear');
    }

    // ===========================================
    // CREAR PACIENTE
    // ===========================================
    async store(req, res, next) {
        try {
            const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
            const { nombreStore } = req.query;

            if (password !== repeatPassword)
                return res.status(400).json({ error: 'Las contraseñas no coinciden' });

            const result = validatePacientes({
                dni,
                nombre,
                apellido,
                fechaNacimiento: new Date(nacimiento),
                email,
                password,
                id_rol,
                estado,
                telefonos,
                obra_sociales
            });

            if (!result.success)
                return res.status(422).json({ error: result.error.issues });

            const data = result.data;

            // Persona
            const existePersona = await Persona.getById({ dni: data.dni });
            if (existePersona)
                return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });

            const persona = await Persona.create({
                dni: data.dni,
                nombre,
                apellido,
                nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
            });

            if (!persona) throw new Error('Error al crear Persona');

            // Usuario
            const usuario = await Usuario.create({
                dni: data.dni,
                email,
                password,
                id_rol: data.id_rol
            });

            if (!usuario) throw new Error('Error al crear Usuario');

            // Paciente
            const paciente = await Paciente.create({
                id_persona: persona.id,
                id_usuario: usuario.id,
                id_obra_social: data.obra_sociales,
                estado: data.estado,
                telefono: telefonos
            });

            if (!paciente) throw new Error('Error al crear Paciente');

            res.redirect(`/pacientes?nombreStore=${nombreStore}`);

        } catch (error) {
            next(error);
        }
    }

    // ===========================================
    // FORM EDITAR PACIENTE
    // ===========================================
    async edit(req, res, next) {
        try {
            const { id } = req.params;

            const paciente = await Paciente.getPacienteById(id);
            if (!paciente) return res.status(404).send('Paciente no encontrado');

            const persona = await Persona.getById({ id: paciente.id_persona });
            const usuario = await Usuario.getById({ id: paciente.id_usuario });

            const telefonos = await Usuario.getTelefonos(paciente.id_usuario);
            const obra_social = await Paciente.getOSByPaciente(id);
            const obrasSociales = await Paciente.getAllOS();

            res.render('pacientes/editar', {
                persona,
                usuario,
                paciente,
                obra_social,
                obrasSociales,
                telefonos
            });

        } catch (error) {
            next(error);
        }
    }

    // ===========================================
    // ACTUALIZAR PACIENTE
    // ===========================================
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { nombre, apellido, nacimiento, email, password, telefonoAlternativo, obras_sociales } = req.body;

            const result = validatePartialPacientes({
                nombre,
                apellido,
                fechaNacimiento: new Date(nacimiento),
                email,
                password,
                telefonoAlternativo: telefonoAlternativo ? parseInt(telefonoAlternativo) : null,
                obras_sociales
            });

            if (!result.success)
                return res.status(400).json({ error: JSON.parse(result.error.message) });

            const data = result.data;

            await Paciente.updatePaciente(id, {
                nombre,
                apellido,
                nacimiento: data.fechaNacimiento.toISOString().split('T')[0],
                email,
                password,
                id_obra_social: data.obras_sociales
            });

            if (telefonoAlternativo) {
                const paciente = await Paciente.getPacienteById(id);
                await Usuario.addTelefonoAlternativo(paciente.id_usuario, parseInt(telefonoAlternativo));
            }

            res.redirect(`/pacientes?nombreUpdate=${nombre}`);

        } catch (error) {
            next(error);
        }
    }

    // ===========================================
    // INACTIVAR / ACTIVAR
    // ===========================================
    async inactivar(req, res, next) {
        try {
            const { id } = req.params;
            await Paciente.inactivarPaciente(id);
            res.redirect(`/pacientes?nombreInactivo=true`);
        } catch (error) {
            next(error);
        }
    }

    async activar(req, res, next) {
        try {
            const { id } = req.params;
            await Paciente.activarPaciente(id);
            res.redirect(`/pacientes?nombreActivo=true`);
        } catch (error) {
            next(error);
        }
    }

    // ===========================================
    // BUSCAR PACIENTES (AJAX)
    // ===========================================
    // async search(req, res, next) {
    //     try {
    //         const query = req.query.query?.trim();
    //         if (!query || query.length < 2) return res.json([]);

    //         const resultados = await Paciente.searchByNombreODni(query);
    //         res.json(resultados);

    //     } catch (error) {
    //         console.error("Error en search:", error);
    //         res.status(500).json({ error: "Error buscando pacientes" });
    //     }
    // }

    async search(req, res, next) {
    try {
        const query = req.query.query?.trim();
        if (!query || query.length < 2) return res.json([]);

        // Cambiado de searchByNombreODni a buscarPorNombreODni
        const resultados = await Paciente.buscarPorNombreODni(query);
        res.json(resultados);

    } catch (error) {
        console.error("Error en search:", error);
        res.status(500).json({ error: "Error buscando pacientes" });
    }
}
}

module.exports = new PacientesController();
