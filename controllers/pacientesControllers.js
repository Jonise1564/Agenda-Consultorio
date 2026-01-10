// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const bcrypt = require('bcryptjs');

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
//     // async store(req, res, next) {
//     //     try {
//     //         const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
//     //         const { nombreStore } = req.query;

//     //         if (password !== repeatPassword)
//     //             return res.status(400).json({ error: 'Las contraseñas no coinciden' });

//     //         const result = validatePacientes({
//     //             dni,
//     //             nombre,
//     //             apellido,
//     //             fechaNacimiento: new Date(nacimiento),
//     //             email,
//     //             password,
//     //             id_rol,
//     //             estado,
//     //             telefonos,
//     //             obra_sociales
//     //         });

//     //         if (!result.success)
//     //             return res.status(422).json({ error: result.error.issues });

//     //         const data = result.data;

//     //         // Persona
//     //         const existePersona = await Persona.getById({ dni: data.dni });
//     //         if (existePersona)
//     //             return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });

//     //         const persona = await Persona.create({
//     //             dni: data.dni,
//     //             nombre,
//     //             apellido,
//     //             nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//     //         });

//     //         if (!persona) throw new Error('Error al crear Persona');

//     //         // Usuario
//     //         const usuario = await Usuario.create({
//     //             dni: data.dni,
//     //             email,
//     //             password,
//     //             id_rol: data.id_rol
//     //         });

//     //         if (!usuario) throw new Error('Error al crear Usuario');

//     //         // Paciente
//     //         const paciente = await Paciente.create({
//     //             id_persona: persona.id,
//     //             id_usuario: usuario.id,
//     //             id_obra_social: data.obra_sociales,
//     //             estado: data.estado,
//     //             telefono: telefonos
//     //         });

//     //         if (!paciente) throw new Error('Error al crear Paciente');

//     //         res.redirect(`/pacientes?nombreStore=${nombreStore}`);

//     //     } catch (error) {
//     //         next(error);
//     //     }
//     // }

//     async store(req, res, next) {
//         try {
//             // 1. Extraemos los datos del body tal como vienen del PUG
//             const {
//                 dni, nombre, apellido, nacimiento,
//                 email, password, repeatPassword,
//                 id_rol, estado, telefonos, obra_sociales
//             } = req.body;

//             // 2. IMPORTANTE: Zod espera 'fechaNacimiento', no 'nacimiento'.
//             // Pasamos el string 'nacimiento' directamente, el preprocess de Zod se encargará.
//             const result = validatePacientes({
//                 dni,
//                 nombre,
//                 apellido,
//                 fechaNacimiento: nacimiento, // Ajuste para el esquema
//                 email,
//                 password,
//                 repeatPassword,
//                 telefonos,
//                 obra_sociales
//             });

//             // Si falla la validación de Zod, enviamos el 422
//             if (!result.success) {
//                 console.log("Errores de Zod:", result.error.issues); // Para que veas en consola qué falló
//                 return res.status(422).json({ error: result.error.issues });
//             }

//             // 3. Usamos 'data' que ya viene validado y transformado por Zod
//             const data = result.data;

//             // 4. Verificación de Persona
//             const existePersona = await Persona.getById({ dni: data.dni });
//             if (existePersona) {
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
//             }

//             // 5. Crear Persona 
//             // Nota: data.fechaNacimiento ya es un objeto Date gracias al preprocess de Zod
//             const persona = await Persona.create({
//                 dni: data.dni,
//                 nombre: data.nombre,
//                 apellido: data.apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             if (!persona) throw new Error('Error al crear Persona');

//             // 6. Crear Usuario
//             const usuario = await Usuario.create({
//                 dni: data.dni,
//                 email: data.email,
//                 password: data.password, // Recuerda hashear esto si tu Usuario.create no lo hace
//                 id_rol: id_rol || 3 // Usamos el id_rol que vino del body o default 3
//             });

//             if (!usuario) throw new Error('Error al crear Usuario');

//             // 7. Crear Paciente (Usando el modelo Paciente)
//             const paciente = await Paciente.createPaciente({
//                 dni: data.dni,
//                 nombre: data.nombre,
//                 apellido: data.apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0],
//                 email: data.email,
//                 password: data.password,
//                 id_rol: id_rol || 3,
//                 id_obra_social: data.obra_sociales, // Aquí pasamos el ID de la OS
//                 estado: estado || 1,
//                 telefonos: data.telefonos // Zod ya lo convirtió en Array de números o strings según tu esquema
//             });

//             res.redirect(`/pacientes?nombreStore=true`);

//         } catch (error) {
//             console.error("Error en store paciente:", error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;

//             // ================================
//             // PACIENTE
//             // ================================
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) {
//                 return res.status(404).send('Paciente no encontrado');
//             }

//             // ================================
//             // FECHA 
//             // ================================
//             if (paciente.nacimiento) {
//                 const f = new Date(paciente.nacimiento);
//                 paciente.nacimiento =
//                     f.getFullYear() + '-' +
//                     String(f.getMonth() + 1).padStart(2, '0') + '-' +
//                     String(f.getDate()).padStart(2, '0');
//             }

//             // ================================
//             // USUARIO
//             // ================================
//             const usuario = await Usuario.getById(paciente.id_usuario);

//             // ================================
//             // TELÉFONOS → SOLO STRINGS
//             // ================================
//             const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
//             const telefonos = telefonosDB.map(t => t.numero);

//             // ================================
//             // OBRA SOCIAL
//             // ================================
//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             // ================================
//             // RENDER
//             // ================================
//             res.render('pacientes/editar', {
//                 paciente,
//                 usuario,
//                 telefonos,
//                 obra_social,
//                 obrasSociales
//             });

//         } catch (error) {
//             console.error('Controller edit paciente:', error);
//             next(error);
//         }
//     }



//     async update(req, res, next) {
//         try {
//             const { id } = req.params;

//             const {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 email,
//                 password,
//                 id_obra_social,
//                 telefonos
//             } = req.body;

//             // ================================
//             // ARMAR OBJETO DE UPDATES
//             // ================================
//             const updates = {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 id_obra_social: id_obra_social || null
//             };

//             // ================================
//             // DATOS DE USUARIO (OPCIONAL)
//             // ================================
//             if (email && email.trim() !== '') {
//                 updates.email = email;
//             }

//             if (password && password.trim() !== '') {
//                 const saltRounds = 10;
//                 updates.password = await bcrypt.hash(password, saltRounds);
//             }

//             // ================================
//             // UPDATE PACIENTE / PERSONA / USUARIO
//             // ================================
//             await Paciente.updatePaciente(id, updates);

//             // ================================
//             // TELÉFONOS (PERSONA)
//             // ================================

//             if (telefonos) {
//                 const lista = Array.isArray(telefonos)
//                     ? telefonos
//                     : [telefonos];

//                 const telefonosLimpios = lista
//                     .map(t => t.trim())
//                     .filter(t => t !== '');

//                 // obtener id_persona real
//                 const paciente = await Paciente.getPacienteById(id);
//                 const id_persona = paciente.id_persona;

//                 // borrar teléfonos anteriores
//                 await Persona.eliminarTelefonos(id_persona);

//                 // insertar nuevos
//                 for (const numero of telefonosLimpios) {
//                     await Persona.addTelefono(id_persona, numero);
//                 }
//             }

//             res.redirect('/pacientes');

//         } catch (error) {
//             console.error('Error update paciente:', error);
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
//     // BUSCAR PACIENTES
//     // ===========================================

//     // async search(req, res, next) {
//     //     try {
//     //         const query = req.query.query?.trim();
//     //         if (!query || query.length < 2) return res.json([]);

//     //         const resultados = await Paciente.buscarPorNombreODni(query);
//     //         res.json(resultados);

//     //     } catch (error) {
//     //         console.error("Error en search:", error);
//     //         res.status(500).json({ error: "Error buscando pacientes" });
//     //     }
//     // }

//     async search(req, res, next) {
//         try {
//             // Cambiamos .query por .q para que coincida con el fetch del frontend
//             const query = req.query.q?.trim();

//             if (!query || query.length < 2) return res.json([]);

//             const resultados = await Paciente.buscarPorNombreODni(query);
//             res.json(resultados);

//         } catch (error) {
//             console.error("Error en search:", error);
//             res.status(500).json({ error: "Error buscando pacientes" });
//         }
//     }
// }

// module.exports = new PacientesController();




// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const bcrypt = require('bcryptjs');

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

//     // ===========================================
//     // CREAR PACIENTE (STORE)
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { 
//                 dni, nombre, apellido, nacimiento, 
//                 email, password, repeatPassword, 
//                 id_rol, estado, telefonos, obra_sociales 
//             } = req.body;

//             // 1. Validar con Zod (Mapeamos 'nacimiento' a 'fechaNacimiento')
//             const result = validatePacientes({
//                 dni,
//                 nombre,
//                 apellido,
//                 fechaNacimiento: nacimiento,
//                 email,
//                 password,
//                 repeatPassword,
//                 telefonos,
//                 obra_sociales
//             });

//             if (!result.success) {
//                 return res.status(422).json({ error: result.error.issues });
//             }

//             const data = result.data;

//             // 2. Verificar si la persona ya existe
//             const existePersona = await Persona.getById({ dni: data.dni });
//             if (existePersona) {
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
//             }

//             // 3. Hashear la contraseña antes de guardar
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(data.password, salt);

//             // 4. Crear Persona
//             const persona = await Persona.create({
//                 dni: data.dni,
//                 nombre: data.nombre,
//                 apellido: data.apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             if (!persona) throw new Error('Error al crear Persona');

//             // 5. Crear Usuario (pasando id_persona en lugar de dni)
//             const usuario = await Usuario.create({
//                 id_persona: persona.id,
//                 email: data.email,
//                 password: hashedPassword,
//                 id_rol: id_rol || 3
//             });

//             if (!usuario) throw new Error('Error al crear Usuario');

//             // 6. Crear Paciente
//             const paciente = await Paciente.create({
//                 id_persona: persona.id,
//                 id_usuario: usuario.id,
//                 id_obra_social: data.obra_sociales,
//                 estado: estado || 1
//             });

//             if (!paciente) throw new Error('Error al crear Paciente');

//             // 7. Guardar teléfonos si existen
//             if (data.telefonos && data.telefonos.length > 0) {
//                 for (const num of data.telefonos) {
//                     await Persona.addTelefono(persona.id, num);
//                 }
//             }

//             res.redirect(`/pacientes?nombreStore=true`);

//         } catch (error) {
//             console.error("Error en store paciente:", error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             if (paciente.nacimiento) {
//                 const f = new Date(paciente.nacimiento);
//                 paciente.nacimiento = f.toISOString().split('T')[0];
//             }

//             const usuario = await Usuario.getById(paciente.id_usuario);
//             const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
//             const telefonos = telefonosDB.map(t => t.numero);
//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 paciente,
//                 usuario,
//                 telefonos,
//                 obra_social,
//                 obrasSociales
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
//             const { nombre, apellido, nacimiento, email, password, id_obra_social, telefonos } = req.body;

//             const updates = {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 id_obra_social: id_obra_social || null
//             };

//             if (email && email.trim() !== '') updates.email = email;
//             if (password && password.trim() !== '') {
//                 updates.password = await bcrypt.hash(password, 10);
//             }

//             await Paciente.updatePaciente(id, updates);

//             if (telefonos) {
//                 const lista = Array.isArray(telefonos) ? telefonos : [telefonos];
//                 const paciente = await Paciente.getPacienteById(id);
//                 await Persona.eliminarTelefonos(paciente.id_persona);
//                 for (const numero of lista) {
//                     if (numero.trim() !== '') await Persona.addTelefono(paciente.id_persona, numero.trim());
//                 }
//             }

//             res.redirect('/pacientes?nombreUpdate=true');
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ESTADOS (ACTIVAR/INACTIVAR)
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             await Paciente.inactivarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             await Paciente.activarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR PACIENTES
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const query = req.query.q?.trim();
//             if (!query || query.length < 2) return res.json([]);
//             const resultados = await Paciente.buscarPorNombreODni(query);
//             res.json(resultados);
//         } catch (error) {
//             res.status(500).json({ error: "Error buscando pacientes" });
//         }
//     }
// }

// // module.exports = new PacientesController();

// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const bcrypt = require('bcryptjs');

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

//     // ===========================================
//     // CREAR PACIENTE (STORE)
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { 
//                 dni, nombre, apellido, nacimiento, 
//                 email, password, repeatPassword, 
//                 id_rol, estado, telefonos, obra_sociales 
//             } = req.body;

//             // 1. Validar con Zod
//             const result = validatePacientes({
//                 dni, nombre, apellido, fechaNacimiento: nacimiento,
//                 email, password, repeatPassword, telefonos, obra_sociales
//             });

//             if (!result.success) {
//                 return res.status(422).json({ error: result.error.issues });
//             }

//             const data = result.data;

//             // 2. Verificar si la persona ya existe por DNI
//             const existePersona = await Persona.getByDni(data.dni);
//             if (existePersona) {
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
//             }

//             // 3. Hashear la contraseña
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(data.password, salt);

//             // 4. Crear Persona y obtener ID
//             const personaCreada = await Persona.create({
//                 dni: data.dni,
//                 nombre: data.nombre,
//                 apellido: data.apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             const id_persona = personaCreada.id || personaCreada.insertId;
//             if (!id_persona) throw new Error('Error: No se obtuvo el ID de la persona');

//             // 5. Crear Usuario vinculado a la Persona
//             const usuarioCreado = await Usuario.create({
//                 id_persona: id_persona,
//                 email: data.email,
//                 password: hashedPassword,
//                 id_rol: id_rol || 3
//             });

//             const id_usuario = usuarioCreado.id || usuarioCreado.insertId;
//             if (!id_usuario) throw new Error('Error: No se obtuvo el ID del usuario');

//             // 6. Crear Paciente (Relacionando Persona y Usuario)
//             const pacienteCreado = await Paciente.create({
//                 id_persona: id_persona,
//                 id_usuario: id_usuario,
//                 id_obra_social: data.id_obra_social || data.obra_sociales, // Ajustado según nombre del schema
//                 estado: estado || 1
//             });

//             if (!pacienteCreado) throw new Error('Error al crear Paciente');

//             // 7. Guardar teléfonos si existen
//             if (data.telefonos && data.telefonos.length > 0) {
//                 const listaTelefonos = Array.isArray(data.telefonos) ? data.telefonos : [data.telefonos];
//                 for (const num of listaTelefonos) {
//                     if (num && num.trim() !== '') {
//                         await Persona.addTelefono(id_persona, num.trim());
//                     }
//                 }
//             }

//             res.redirect(`/pacientes?nombreStore=true`);

//         } catch (error) {
//             console.error("Error en store paciente:", error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             if (paciente.nacimiento) {
//                 const f = new Date(paciente.nacimiento);
//                 paciente.nacimiento = f.toISOString().split('T')[0];
//             }

//             const usuario = await Usuario.getById(paciente.id_usuario);
//             const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
//             const telefonos = telefonosDB.map(t => t.numero);
//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 paciente,
//                 usuario,
//                 telefonos,
//                 obra_social,
//                 obrasSociales
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
//             const { nombre, apellido, nacimiento, email, password, id_obra_social, telefonos } = req.body;

//             const updates = {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 id_obra_social: id_obra_social || null
//             };

//             if (email && email.trim() !== '') updates.email = email;
//             if (password && password.trim() !== '') {
//                 updates.password = await bcrypt.hash(password, 10);
//             }

//             await Paciente.updatePaciente(id, updates);

//             if (telefonos) {
//                 const lista = Array.isArray(telefonos) ? telefonos : [telefonos];
//                 const paciente = await Paciente.getPacienteById(id);
//                 await Persona.eliminarTelefonos(paciente.id_persona);
//                 for (const numero of lista) {
//                     if (numero.trim() !== '') {
//                         await Persona.addTelefono(paciente.id_persona, numero.trim());
//                     }
//                 }
//             }

//             res.redirect('/pacientes?nombreUpdate=true');
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ESTADOS (ACTIVAR/INACTIVAR)
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             await Paciente.inactivarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             await Paciente.activarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR PACIENTES
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const query = req.query.q?.trim();
//             if (!query || query.length < 2) return res.json([]);
//             const resultados = await Paciente.buscarPorNombreODni(query);
//             res.json(resultados);
//         } catch (error) {
//             res.status(500).json({ error: "Error buscando pacientes" });
//         }
//     }
// }

// module.exports = new PacientesController();

// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const bcrypt = require('bcryptjs');

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

//     // ===========================================
//     // CREAR PACIENTE (STORE)
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { 
//                 dni, nombre, apellido, nacimiento, 
//                 email, password, repeatPassword, 
//                 id_rol, estado, telefonos, obra_sociales 
//             } = req.body;

//             // 1. Validar con Zod
//             const result = validatePacientes({
//                 dni, nombre, apellido, fechaNacimiento: nacimiento,
//                 email, password, repeatPassword, telefonos, obra_sociales
//             });

//             if (!result.success) {
//                 return res.status(422).json({ error: result.error.issues });
//             }

//             const data = result.data;

//             // 2. Verificar si la persona ya existe por DNI
//             const existePersona = await Persona.getByDni(data.dni);
//             if (existePersona) {
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
//             }

//             // 3. Hashear la contraseña
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(data.password, salt);

//             // 4. Crear Persona y obtener ID
//             const personaCreada = await Persona.create({
//                 dni: data.dni,
//                 nombre: data.nombre,
//                 apellido: data.apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             const id_persona = personaCreada.id || personaCreada.insertId;
//             if (!id_persona) throw new Error('Error: No se obtuvo el ID de la persona');

//             // 5. Crear Usuario vinculado a la Persona
//             const usuarioCreado = await Usuario.create({
//                 id_persona: id_persona,
//                 email: data.email,
//                 password: hashedPassword,
//                 id_rol: id_rol || 3
//             });

//             const id_usuario = usuarioCreado.id || usuarioCreado.insertId;
//             if (!id_usuario) throw new Error('Error: No se obtuvo el ID del usuario');

//             // 6. Crear Paciente (Relacionando Persona y Usuario)
//             const pacienteCreado = await Paciente.create({
//                 id_persona: id_persona,
//                 id_usuario: id_usuario,
//                 id_obra_social: data.id_obra_social || data.obra_sociales,
//                 estado: estado || 1
//             });

//             if (!pacienteCreado) throw new Error('Error al crear Paciente');

//             // 7. Guardar teléfonos si existen (CORREGIDO: num.trim() error)
//             if (data.telefonos && data.telefonos.length > 0) {
//                 const listaTelefonos = Array.isArray(data.telefonos) ? data.telefonos : [data.telefonos];
//                 for (let num of listaTelefonos) {
//                     if (num !== null && num !== undefined) {
//                         const numString = String(num).trim(); // Asegura que sea string antes de hacer trim
//                         if (numString !== '') {
//                             await Persona.addTelefono(id_persona, numString);
//                         }
//                     }
//                 }
//             }

//             res.redirect(`/pacientes?nombreStore=true`);

//         } catch (error) {
//             console.error("Error en store paciente:", error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             if (paciente.nacimiento) {
//                 const f = new Date(paciente.nacimiento);
//                 paciente.nacimiento = f.toISOString().split('T')[0];
//             }

//             const usuario = await Usuario.getById(paciente.id_usuario);
//             const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
//             const telefonos = telefonosDB.map(t => t.numero);
//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 paciente,
//                 usuario,
//                 telefonos,
//                 obra_social,
//                 obrasSociales
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
//             const { nombre, apellido, nacimiento, email, password, id_obra_social, telefonos } = req.body;

//             const updates = {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 id_obra_social: id_obra_social || null
//             };

//             if (email && email.trim() !== '') updates.email = email;
//             if (password && password.trim() !== '') {
//                 updates.password = await bcrypt.hash(password, 10);
//             }

//             await Paciente.updatePaciente(id, updates);

//             // Actualización de teléfonos (CORREGIDO con String() y trim)
//             if (telefonos) {
//                 const lista = Array.isArray(telefonos) ? telefonos : [telefonos];
//                 const paciente = await Paciente.getPacienteById(id);
//                 await Persona.eliminarTelefonos(paciente.id_persona);
//                 for (let numero of lista) {
//                     if (numero !== null && numero !== undefined) {
//                         const numString = String(numero).trim();
//                         if (numString !== '') {
//                             await Persona.addTelefono(paciente.id_persona, numString);
//                         }
//                     }
//                 }
//             }

//             res.redirect('/pacientes?nombreUpdate=true');
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ESTADOS (ACTIVAR/INACTIVAR)
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             await Paciente.inactivarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             await Paciente.activarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR PACIENTES
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const query = req.query.q?.trim();
//             if (!query || query.length < 2) return res.json([]);
//             const resultados = await Paciente.buscarPorNombreODni(query);
//             res.json(resultados);
//         } catch (error) {
//             res.status(500).json({ error: "Error buscando pacientes" });
//         }
//     }
// }

// module.exports = new PacientesController();



// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const bcrypt = require('bcryptjs');

// class PacientesController {

//     // ===========================================
//     // LISTAR PACIENTES (CON PAGINACIÓN)
//     // ===========================================
//     async get(req, res, next) {
//         try {
//             // Configuración de paginación
//             const page = parseInt(req.query.page) || 1;
//             const limit = 10; // Cantidad de registros por página
//             const offset = (page - 1) * limit;

//             // Obtener total para los cálculos y los datos paginados
//             const totalPacientes = await Paciente.countAll();
//             const pacientes = await Paciente.getAllPaginated(limit, offset);
            
//             const totalPages = Math.ceil(totalPacientes / limit);

//             const pacientesConFechaFormateada = pacientes.map(p => ({
//                 ...p,
//                 nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
//             }));

//             // Gestión de mensajes de alerta
//             const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;
//             let mensaje = null;
//             if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
//             else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
//             else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
//             else if (nombreStore) mensaje = 'Paciente Creado correctamente';

//             res.render('pacientes/index', { 
//                 pacientes: pacientesConFechaFormateada, 
//                 mensaje,
//                 currentPage: page,
//                 totalPages: totalPages,
//                 totalPacientes: totalPacientes
//             });

//         } catch (error) {
//             console.error("Error en get pacientes:", error);
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

//     // ===========================================
//     // CREAR PACIENTE (STORE)
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { 
//                 dni, nombre, apellido, nacimiento, 
//                 email, password, repeatPassword, 
//                 id_rol, estado, telefonos, obra_sociales 
//             } = req.body;

//             // 1. Validar con Zod
//             const result = validatePacientes({
//                 dni, nombre, apellido, fechaNacimiento: nacimiento,
//                 email, password, repeatPassword, telefonos, obra_sociales
//             });

//             if (!result.success) {
//                 return res.status(422).json({ error: result.error.issues });
//             }

//             const data = result.data;

//             // 2. Verificar si la persona ya existe por DNI
//             const existePersona = await Persona.getByDni(data.dni);
//             if (existePersona) {
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
//             }

//             // 3. Hashear la contraseña
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(data.password, salt);

//             // 4. Crear Persona y obtener ID
//             const personaCreada = await Persona.create({
//                 dni: data.dni,
//                 nombre: data.nombre,
//                 apellido: data.apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             const id_persona = personaCreada.id || personaCreada.insertId;
//             if (!id_persona) throw new Error('Error: No se obtuvo el ID de la persona');

//             // 5. Crear Usuario vinculado a la Persona
//             const usuarioCreado = await Usuario.create({
//                 id_persona: id_persona,
//                 email: data.email,
//                 password: hashedPassword,
//                 id_rol: id_rol || 3
//             });

//             const id_usuario = usuarioCreado.id || usuarioCreado.insertId;
//             if (!id_usuario) throw new Error('Error: No se obtuvo el ID del usuario');

//             // 6. Crear Paciente
//             const pacienteCreado = await Paciente.create({
//                 id_persona: id_persona,
//                 id_usuario: id_usuario,
//                 id_obra_social: data.id_obra_social || data.obra_sociales,
//                 estado: estado || 1
//             });

//             if (!pacienteCreado) throw new Error('Error al crear Paciente');

//             // 7. Guardar teléfonos (Limpieza de datos corregida)
//             if (data.telefonos && data.telefonos.length > 0) {
//                 const listaTelefonos = Array.isArray(data.telefonos) ? data.telefonos : [data.telefonos];
//                 for (let num of listaTelefonos) {
//                     if (num !== null && num !== undefined) {
//                         const numString = String(num).trim();
//                         if (numString !== '') {
//                             await Persona.addTelefono(id_persona, numString);
//                         }
//                     }
//                 }
//             }

//             res.redirect(`/pacientes?nombreStore=true`);

//         } catch (error) {
//             console.error("Error en store paciente:", error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             if (paciente.nacimiento) {
//                 const f = new Date(paciente.nacimiento);
//                 paciente.nacimiento = f.toISOString().split('T')[0];
//             }

//             const usuario = await Usuario.getById(paciente.id_usuario);
//             const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
//             const telefonos = telefonosDB.map(t => t.numero);
//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 paciente,
//                 usuario,
//                 telefonos,
//                 obra_social,
//                 obrasSociales
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
//             const { nombre, apellido, nacimiento, email, password, id_obra_social, telefonos } = req.body;

//             const updates = {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 id_obra_social: id_obra_social || null
//             };

//             if (email && email.trim() !== '') updates.email = email;
//             if (password && password.trim() !== '') {
//                 updates.password = await bcrypt.hash(password, 10);
//             }

//             await Paciente.updatePaciente(id, updates);

//             if (telefonos) {
//                 const lista = Array.isArray(telefonos) ? telefonos : [telefonos];
//                 const paciente = await Paciente.getPacienteById(id);
//                 await Persona.eliminarTelefonos(paciente.id_persona);
//                 for (let numero of lista) {
//                     if (numero !== null && numero !== undefined) {
//                         const numString = String(numero).trim();
//                         if (numString !== '') {
//                             await Persona.addTelefono(paciente.id_persona, numString);
//                         }
//                     }
//                 }
//             }

//             res.redirect('/pacientes?nombreUpdate=true');
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ESTADOS
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             await Paciente.inactivarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             await Paciente.activarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // BUSCAR
//     // ===========================================
//     async search(req, res, next) {
//         try {
//             const query = req.query.q?.trim();
//             if (!query || query.length < 2) return res.json([]);
//             const resultados = await Paciente.buscarPorNombreODni(query);
//             res.json(resultados);
//         } catch (error) {
//             res.status(500).json({ error: "Error buscando pacientes" });
//         }
//     }
// }

// // module.exports = new PacientesController();

// const Paciente = require('../models/pacientesModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');

// const { validatePacientes } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const bcrypt = require('bcryptjs');

// class PacientesController {

//     // ===========================================
//     // LISTAR PACIENTES (PAGINACIÓN + BUSCADOR)
//     // ===========================================
//     async get(req, res, next) {
//         try {
//             // 1. Capturar parámetros de URL
//             const page = parseInt(req.query.page) || 1;
//             const search = req.query.q || ''; // Término de búsqueda universal
//             const limit = 10;
//             const offset = (page - 1) * limit;

//             // 2. Obtener datos filtrados y total de registros
//             const totalPacientes = await Paciente.countAll(search);
//             const pacientes = await Paciente.getAllPaginated(limit, offset, search);
            
//             const totalPages = Math.ceil(totalPacientes / limit);

//             // 3. Formatear fechas para la tabla
//             const pacientesConFechaFormateada = pacientes.map(p => ({
//                 ...p,
//                 nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
//             }));

//             // 4. Gestión de mensajes de alerta (Notificaciones)
//             const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;
//             let mensaje = null;
//             if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
//             else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
//             else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
//             else if (nombreStore) mensaje = 'Paciente Creado correctamente';

//             // 5. Renderizar vista con todas las variables necesarias
//             res.render('pacientes/index', { 
//                 pacientes: pacientesConFechaFormateada, 
//                 mensaje,
//                 currentPage: page,
//                 totalPages: totalPages,
//                 totalPacientes: totalPacientes,
//                 search: search // Retornamos el término para que el input no se vacíe
//             });

//         } catch (error) {
//             console.error("Error en get pacientes:", error);
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

//     // ===========================================
//     // CREAR PACIENTE (STORE)
//     // ===========================================
//     async store(req, res, next) {
//         try {
//             const { 
//                 dni, nombre, apellido, nacimiento, 
//                 email, password, repeatPassword, 
//                 id_rol, estado, telefonos, obra_sociales 
//             } = req.body;

//             // 1. Validar esquema con Zod
//             const result = validatePacientes({
//                 dni, nombre, apellido, fechaNacimiento: nacimiento,
//                 email, password, repeatPassword, telefonos, obra_sociales
//             });

//             if (!result.success) {
//                 return res.status(422).json({ error: result.error.issues });
//             }

//             const data = result.data;

//             // 2. Verificar duplicidad de DNI
//             const existePersona = await Persona.getByDni(data.dni);
//             if (existePersona) {
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
//             }

//             // 3. Seguridad: Hashear contraseña
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(data.password, salt);

//             // 4. Crear Persona
//             const personaCreada = await Persona.create({
//                 dni: data.dni,
//                 nombre: data.nombre,
//                 apellido: data.apellido,
//                 nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             const id_persona = personaCreada.id || personaCreada.insertId;

//             // 5. Crear Usuario vinculado
//             const usuarioCreado = await Usuario.create({
//                 id_persona: id_persona,
//                 email: data.email,
//                 password: hashedPassword,
//                 id_rol: id_rol || 3
//             });

//             const id_usuario = usuarioCreado.id || usuarioCreado.insertId;

//             // 6. Crear Registro de Paciente
//             const pacienteCreado = await Paciente.create({
//                 id_persona: id_persona,
//                 id_usuario: id_usuario,
//                 id_obra_social: data.obra_sociales, // Viene validado desde el esquema
//                 estado: estado || 1
//             });

//             // 7. Guardar teléfonos asociados
//             if (data.telefonos) {
//                 const listaTelefonos = Array.isArray(data.telefonos) ? data.telefonos : [data.telefonos];
//                 for (let num of listaTelefonos) {
//                     if (num) {
//                         const numString = String(num).trim();
//                         if (numString !== '') await Persona.addTelefono(id_persona, numString);
//                     }
//                 }
//             }

//             res.redirect(`/pacientes?nombreStore=true`);

//         } catch (error) {
//             console.error("Error en store paciente:", error);
//             next(error);
//         }
//     }

//     // ===========================================
//     // FORM EDITAR PACIENTE
//     // ===========================================
//     async edit(req, res, next) {
//         try {
//             const { id } = req.params;
//             const paciente = await Paciente.getPacienteById(id);
//             if (!paciente) return res.status(404).send('Paciente no encontrado');

//             // Formatear fecha para el input type="date"
//             if (paciente.nacimiento) {
//                 paciente.nacimiento = new Date(paciente.nacimiento).toISOString().split('T')[0];
//             }

//             const usuario = await Usuario.getById(paciente.id_usuario);
//             const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
//             const telefonos = telefonosDB.map(t => t.numero);
//             const obra_social = await Paciente.getOSByPaciente(id);
//             const obrasSociales = await Paciente.getAllOS();

//             res.render('pacientes/editar', {
//                 paciente,
//                 usuario,
//                 telefonos,
//                 obra_social,
//                 obrasSociales
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // ACTUALIZAR PACIENTE (UPDATE)
//     // ===========================================
//     async update(req, res, next) {
//         try {
//             const { id } = req.params;
//             const { nombre, apellido, nacimiento, email, password, id_obra_social, telefonos } = req.body;

//             const updates = {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 id_obra_social: id_obra_social || null
//             };

//             if (email && email.trim() !== '') updates.email = email;
//             if (password && password.trim() !== '') {
//                 updates.password = await bcrypt.hash(password, 10);
//             }

//             await Paciente.updatePaciente(id, updates);

//             // Actualización lógica de teléfonos (Eliminar y Volver a crear)
//             const paciente = await Paciente.getPacienteById(id);
//             await Persona.eliminarTelefonos(paciente.id_persona);

//             if (telefonos) {
//                 const lista = Array.isArray(telefonos) ? telefonos : [telefonos];
//                 for (let numero of lista) {
//                     if (numero) {
//                         const numString = String(numero).trim();
//                         if (numString !== '') await Persona.addTelefono(paciente.id_persona, numString);
//                     }
//                 }
//             }

//             res.redirect('/pacientes?nombreUpdate=true');
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ===========================================
//     // GESTIÓN DE ESTADOS (ALTA / BAJA)
//     // ===========================================
//     async inactivar(req, res, next) {
//         try {
//             await Paciente.inactivarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreInactivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             await Paciente.activarPaciente(req.params.id);
//             res.redirect(`/pacientes?nombreActivo=true`);
//         } catch (error) {
//             next(error);
//         }
//     }
// }

// module.exports = new PacientesController();



const Paciente = require('../models/pacientesModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');

const { validatePacientes } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const bcrypt = require('bcryptjs');

class PacientesController {

    // ===========================================
    // LISTAR PACIENTES (PAGINACIÓN + BUSCADOR)
    // ===========================================
    async get(req, res, next) {
        try {
            // 1. Capturar parámetros de URL
            const page = parseInt(req.query.page) || 1;
            const search = req.query.q || ''; // Término de búsqueda (q)
            const limit = parseInt(req.query.limit) || 10; // Límite dinámico
            const offset = (page - 1) * limit;

            // 2. Obtener datos filtrados y total de registros (On-Demand)
            const totalPacientes = await Paciente.countAll(search);
            const pacientes = await Paciente.getAllPaginated(limit, offset, search);
            
            const totalPages = Math.ceil(totalPacientes / limit);

            // 3. Formatear fechas para la tabla
            const pacientesConFechaFormateada = pacientes.map(p => ({
                ...p,
                nacimiento: p.nacimiento ? obtenerFechaFormateada(new Date(p.nacimiento)) : '---'
            }));

            // 4. Gestión de mensajes de alerta
            const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;
            let mensaje = null;
            if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
            else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
            else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
            else if (nombreStore) mensaje = 'Paciente Creado correctamente';

            // 5. Renderizar vista
            res.render('pacientes/index', { 
                pacientes: pacientesConFechaFormateada, 
                mensaje,
                currentPage: page,
                totalPages: totalPages,
                totalPacientes: totalPacientes,
                limit: limit,
                search: search 
            });

        } catch (error) {
            console.error("Error en get pacientes:", error);
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

    // ===========================================
    // CREAR PACIENTE (STORE)
    // ===========================================
    async store(req, res, next) {
        try {
            const { 
                dni, nombre, apellido, nacimiento, 
                email, password, repeatPassword, 
                id_rol, estado, telefonos, obra_sociales 
            } = req.body;

            const result = validatePacientes({
                dni, nombre, apellido, fechaNacimiento: nacimiento,
                email, password, repeatPassword, telefonos, obra_sociales
            });

            if (!result.success) {
                return res.status(422).json({ error: result.error.issues });
            }

            const data = result.data;

            const existePersona = await Persona.getByDni(data.dni);
            if (existePersona) {
                return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);

            const personaCreada = await Persona.create({
                dni: data.dni,
                nombre: data.nombre,
                apellido: data.apellido,
                nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
            });

            const id_persona = personaCreada.id || personaCreada.insertId;

            const usuarioCreado = await Usuario.create({
                id_persona: id_persona,
                email: data.email,
                password: hashedPassword,
                id_rol: id_rol || 3
            });

            const id_usuario = usuarioCreado.id || usuarioCreado.insertId;

            await Paciente.create({
                id_persona: id_persona,
                id_usuario: id_usuario,
                id_obra_social: data.obra_sociales,
                estado: estado || 1
            });

            if (data.telefonos) {
                const listaTelefonos = Array.isArray(data.telefonos) ? data.telefonos : [data.telefonos];
                for (let num of listaTelefonos) {
                    if (num) {
                        const numString = String(num).trim();
                        if (numString !== '') await Persona.addTelefono(id_persona, numString);
                    }
                }
            }

            res.redirect(`/pacientes?nombreStore=true`);

        } catch (error) {
            console.error("Error en store paciente:", error);
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

            if (paciente.nacimiento) {
                paciente.nacimiento = new Date(paciente.nacimiento).toISOString().split('T')[0];
            }

            const usuario = await Usuario.getById(paciente.id_usuario);
            const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
            const telefonos = telefonosDB.map(t => t.numero);
            const obra_social = await Paciente.getOSByPaciente(id);
            const obrasSociales = await Paciente.getAllOS();

            res.render('pacientes/editar', {
                paciente,
                usuario,
                telefonos,
                obra_social,
                obrasSociales
            });
        } catch (error) {
            next(error);
        }
    }

    // ===========================================
    // ACTUALIZAR PACIENTE (UPDATE)
    // ===========================================
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { nombre, apellido, nacimiento, email, password, id_obra_social, telefonos } = req.body;

            const updates = {
                nombre,
                apellido,
                nacimiento,
                id_obra_social: id_obra_social || null
            };

            if (email && email.trim() !== '') updates.email = email;
            if (password && password.trim() !== '') {
                updates.password = await bcrypt.hash(password, 10);
            }

            await Paciente.updatePaciente(id, updates);

            const paciente = await Paciente.getPacienteById(id);
            await Persona.eliminarTelefonos(paciente.id_persona);

            if (telefonos) {
                const lista = Array.isArray(telefonos) ? telefonos : [telefonos];
                for (let numero of lista) {
                    if (numero) {
                        const numString = String(numero).trim();
                        if (numString !== '') await Persona.addTelefono(paciente.id_persona, numString);
                    }
                }
            }

            res.redirect('/pacientes?nombreUpdate=true');
        } catch (error) {
            next(error);
        }
    }

    // ===========================================
    // GESTIÓN DE ESTADOS (ALTA / BAJA)
    // ===========================================
    // async inactivar(req, res, next) {
    //     try {
    //         await Paciente.inactivarPaciente(req.params.id);
    //         res.redirect(`/pacientes?nombreInactivo=true`);
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    async inactivar(req, res, next) {
    try {
        await Paciente.inactivarPaciente(req.params.id);
        
        // Si viene de la edición, podrías querer volver ahí. 
        // Por ahora lo enviamos al index con el mensaje como ya lo tenías:
        res.redirect(`/pacientes?nombreInactivo=true`);
    } catch (error) {
        next(error);
    }
}

    async activar(req, res, next) {
        try {
            await Paciente.activarPaciente(req.params.id);
            res.redirect(`/pacientes?nombreActivo=true`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PacientesController();