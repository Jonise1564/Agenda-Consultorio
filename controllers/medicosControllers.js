// const Medico = require('../models/medicosModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');
// const Especialidad = require('../models/especialidadesModels');

// const { validateMedicos } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const bcrypt = require('bcrypt');


// class MedicosController {

//     // // ================================================================
//     // // LISTAR
//     // // ================================================================
//     // async get(req, res, next) {
//     //     try {
//     //         const medicos = await Medico.listar();

//     //         const medicosConFecha = medicos.map(m => ({
//     //             ...m,
//     //             nacimiento: m.nacimiento
//     //                 ? obtenerFechaFormateada(new Date(m.nacimiento))
//     //                 : null
//     //         }));

//     //         const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;
//     //         let mensaje = null;

//     //         if (nombreInactivo) mensaje = 'Se dio de baja al médico';
//     //         if (nombreActivo) mensaje = 'Se dio de alta al médico';
//     //         if (nombreUpdate) mensaje = 'Médico actualizado correctamente';
//     //         if (nombreStore) mensaje = 'Médico creado correctamente';

//     //         res.render('medicos/index', { medicos: medicosConFecha, mensaje });
//     //     } catch (err) {
//     //         next(err);
//     //     }
//     // }


//     // ================================================================
//     // LISTAR CON PAGINACIÓN Y BUSCADOR
//     // ================================================================
//     async get(req, res, next) {
//         try {
//             // 1. Obtener parámetros de la query
//             const page = parseInt(req.query.page) || 1;
//             const limit = parseInt(req.query.limit) || 10;
//             const search = req.query.q || '';
//             const offset = (page - 1) * limit;

//             // 2. Obtener datos paginados y total (Debes crear estos métodos en el modelo)
//             const medicos = await Medico.listarPaginado(limit, offset, search);
//             const totalMedicos = await Medico.contarTodos(search);

//             const totalPages = Math.ceil(totalMedicos / limit);

//             // 3. Formatear fechas para la vista
//             const medicosConFecha = medicos.map(m => ({
//                 ...m,
//                 nacimiento: m.nacimiento
//                     ? obtenerFechaFormateada(new Date(m.nacimiento))
//                     : null
//             }));

//             // 4. Lógica de mensajes de feedback
//             const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;
//             let mensaje = null;
//             if (nombreInactivo) mensaje = 'Se dio de baja al médico';
//             else if (nombreActivo) mensaje = 'Se dio de alta al médico';
//             else if (nombreUpdate) mensaje = 'Médico actualizado correctamente';
//             else if (nombreStore) mensaje = 'Médico creado correctamente';

//             // 5. Renderizar enviando todas las variables necesarias para la paginación
//             res.render('medicos/index', {
//                 medicos: medicosConFecha,
//                 mensaje,
//                 currentPage: page,
//                 totalPages: totalPages,
//                 totalMedicos: totalMedicos,
//                 limit: limit,
//                 search: search
//             });
//         } catch (err) {
//             console.error("Error en MedicosController.get:", err);
//             next(err);
//         }
//     }

//     // ================================================================
//     // FORM CREAR
//     // ================================================================
//     async getCreateForm(req, res, next) {
//         try {
//             const especialidades = await Especialidad.getAll();
//             res.render('medicos/crear', { especialidades });
//         } catch (err) {
//             next(err);
//         }
//     }




//     // async store(req, res, next) {
//     //     try {
//     //         const {
//     //             dni,
//     //             nombre,
//     //             apellido,
//     //             nacimiento,
//     //             email,
//     //             password,
//     //             repeatPassword,
//     //             matricula,
//     //             especialidades,
//     //             telefonos
//     //         } = req.body;

//     //         // ===============================
//     //         // NORMALIZAR ARRAYS (ANTES DE VALIDAR)
//     //         // ===============================
//     //         const especialidadesArray = Array.isArray(especialidades)
//     //             ? especialidades
//     //             : especialidades ? [especialidades] : [];

//     //         const telefonosArray = Array.isArray(telefonos)
//     //             ? telefonos
//     //             : telefonos ? [telefonos] : [];

//     //         // ===============================
//     //         // VALIDACIÓN ZOD
//     //         // ===============================
//     //         const parsed = validateMedicos({
//     //             dni,
//     //             nombre,
//     //             apellido,
//     //             fechaNacimiento: new Date(nacimiento),
//     //             email,
//     //             password,
//     //             repeatPassword,     // 🔑 FALTABA
//     //             matricula,          // 🔑 FALTABA
//     //             especialidades: especialidadesArray,
//     //             telefonos: telefonosArray
//     //         });

//     //         if (!parsed.success) {
//     //             return res.status(422).json(parsed.error.issues);
//     //         }

//     //         // ===============================
//     //         // DNI ÚNICO
//     //         // ===============================
//     //         const personaExistente = await Persona.getByDni(dni);
//     //         if (personaExistente) {
//     //             return res.status(409).send('DNI ya existente');
//     //         }

//     //         // ===============================
//     //         // CREAR PERSONA
//     //         // ===============================
//     //         const persona = await Persona.create({
//     //             dni,
//     //             nombre,
//     //             apellido,
//     //             nacimiento: parsed.data.fechaNacimiento
//     //                 .toISOString()
//     //                 .split('T')[0]
//     //         });

//     //         // ===============================
//     //         // CREAR USUARIO
//     //         // ===============================
//     //         const saltRounds = 10;
//     //         const hashedPassword = await bcrypt.hash(parsed.data.password, saltRounds);

//     //         const usuario = await Usuario.create({
//     //             email: parsed.data.email,
//     //             password: hashedPassword,
//     //             id_persona: persona.id,
//     //             id_rol: 2
//     //         });

//     //         // ===============================
//     //         // CREAR MÉDICO
//     //         // ===============================
//     //         const medicoId = await Medico.crear({
//     //             id_persona: persona.id,
//     //             id_usuario: usuario.id,
//     //             estado: 1,
//     //             matricula: parsed.data.matricula
//     //         });

//     //         // ===============================
//     //         // ESPECIALIDADES
//     //         // ===============================
//     //         for (const idEsp of parsed.data.especialidades) {
//     //             await Especialidad.asignarAMedico(medicoId, idEsp);
//     //         }

//     //         // ===============================
//     //         // TELÉFONOS
//     //         // ===============================
//     //         for (const tel of parsed.data.telefonos) {
//     //             await Persona.addTelefono(persona.id, tel);
//     //         }

//     //         // ===============================
//     //         // REDIRECT OK
//     //         // ===============================
//     //         res.redirect('/medicos?nombreStore=1');

//     //     } catch (err) {
//     //         console.error('Error al crear médico:', err);
//     //         next(err);
//     //     }
//     // }
//     async store(req, res, next) {
//     try {
//         const {
//             dni,
//             nombre,
//             apellido,
//             nacimiento,
//             email,
//             password,
//             repeatPassword,
//             matricula,
//             especialidades,
//             // 1. Capturamos los nombres exactos que vienen del PUG
//             telefonoAlternativo, 
//             telefonos_extra
//         } = req.body;

//         // 2. Normalizar Especialidades
//         const especialidadesArray = Array.isArray(especialidades)
//             ? especialidades
//             : especialidades ? [especialidades] : [];

//         // 3. Unificar todos los teléfonos en un solo array
//         // Agregamos el principal y luego los extras si existen
//         let todosLosTelefonos = [];
//         if (telefonoAlternativo) todosLosTelefonos.push(telefonoAlternativo);
        
//         if (telefonos_extra) {
//             const extras = Array.isArray(telefonos_extra) ? telefonos_extra : [telefonos_extra];
//             todosLosTelefonos = [...todosLosTelefonos, ...extras];
//         }

//         // 4. Validación Zod (Asegúrate que tu schema acepte 'telefonos' como array)
//         const parsed = validateMedicos({
//             dni,
//             nombre,
//             apellido,
//             fechaNacimiento: new Date(nacimiento),
//             email,
//             password,
//             repeatPassword,
//             matricula,
//             especialidades: especialidadesArray,
//             telefonos: todosLosTelefonos // Enviamos el array unificado
//         });

//         if (!parsed.success) {
//             // Si falla la validación, volvemos al formulario con errores
//             const especialidadesDB = await Especialidad.getAll();
//             return res.render('medicos/crear', {
//                 errores: parsed.error.issues.map(i => i.message),
//                 old: req.body,
//                 especialidades: especialidadesDB
//             });
//         }

//         // 5. Verificar DNI Único
//         const personaExistente = await Persona.getByDni(dni);
//         if (personaExistente) {
//             const especialidadesDB = await Especialidad.getAll();
//             return res.render('medicos/crear', {
//                 errores: ['El DNI ya se encuentra registrado en el sistema.'],
//                 old: req.body,
//                 especialidades: especialidadesDB
//             });
//         }

//         // 6. Proceso de creación (Transacción lógica)
//         const persona = await Persona.create({
//             dni,
//             nombre,
//             apellido,
//             nacimiento: parsed.data.fechaNacimiento.toISOString().split('T')[0]
//         });

//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(parsed.data.password, saltRounds);

//         const usuario = await Usuario.create({
//             email: parsed.data.email,
//             password: hashedPassword,
//             id_persona: persona.id,
//             id_rol: 2
//         });

//         const medicoId = await Medico.crear({
//             id_persona: persona.id,
//             id_usuario: usuario.id,
//             estado: 1,
//             matricula: parsed.data.matricula,
//             // Importante: Si tu Medico.crear pide telefonoAlternativo explícitamente:
//             telefonoAlternativo: telefonoAlternativo 
//         });

//         // 7. Especialidades
//         for (const idEsp of parsed.data.especialidades) {
//             await Especialidad.asignarAMedico(medicoId, idEsp);
//         }

//         // 8. Todos los Teléfonos a la tabla personas_telefonos
//         for (const tel of todosLosTelefonos) {
//             if (tel.trim()) {
//                 await Persona.addTelefono(persona.id, tel.trim());
//             }
//         }

//         res.redirect('/medicos?nombreStore=1');

//     } catch (err) {
//         console.error('Error al crear médico:', err);
//         // Si el error es de base de datos, mostrarlo en el render
//         const especialidadesDB = await Especialidad.getAll();
//         res.render('medicos/crear', {
//             errores: [err.message],
//             old: req.body,
//             especialidades: especialidadesDB
//         });
//     }
// }


//     // ================================================================
//     // EDITAR (FORM)
//     // ================================================================

//     async edit(req, res, next) {
//         try {
//             const { id_medico } = req.params;

//             // ===============================
//             //  MÉDICO (JOIN COMPLETO)
//             // ===============================
//             const medico = await Medico.obtenerPorId(id_medico);
//             if (!medico) {
//                 return res.status(404).send('Médico no encontrado');
//             }

//             // ===============================
//             //  PERSONA (MAPEO CLAVE)
//             // ===============================
//             const persona = {
//                 id: medico.id_persona,
//                 nombre: medico.nombre,
//                 apellido: medico.apellido,
//                 nacimiento: medico.nacimiento
//                     ? new Date(medico.nacimiento)
//                     : null
//             };

//             // ===============================
//             // USUARIO (MAPEO CLAVE)
//             // ===============================
//             const usuario = {
//                 id: medico.id_usuario,
//                 email: medico.email
//             };

//             // ===============================
//             // TELÉFONOS (COMO ESPERA EL PUG)
//             // ===============================
//             medico.telefonos = medico.telefonos || '';

//             // ===============================
//             //  ESPECIALIDADES
//             // ===============================
//             const especialidades = await Especialidad.getAll();
//             const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

//             console.log('ESPECIALIDADES ASIGNADAS =>', especialidadesAsignadas);

//             // ===============================
//             // RENDER
//             // ===============================
//             res.render('medicos/editar', {
//                 medico,
//                 persona,
//                 usuario,
//                 especialidades,
//                 especialidadesAsignadas
//             });

//         } catch (err) {
//             next(err);
//         }
//     }




//     async update(req, res, next) {
//         try {
//             const { id_medico } = req.params;

//             const {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 email,
//                 password,
//                 matricula,
//                 especialidades,
//                 especialidades_modificadas,
//                 telefonos,
//                 telefonos_modificados
//             } = req.body;

//             // ===============================
//             // OBTENER MÉDICO
//             // ===============================
//             const medico = await Medico.obtenerPorId(id_medico);
//             if (!medico) {
//                 return res.status(404).send('Médico no encontrado');
//             }

//             // ===============================
//             // PERSONA
//             // ===============================
//             await Persona.updatePersona(medico.id_persona, {
//                 nombre,
//                 apellido,
//                 nacimiento
//             });

//             // =========================
//             // USUARIO
//             // =========================
//             const userUpdates = {};

//             if (email) {
//                 userUpdates.email = email.trim();
//             }

//             if (password && password.trim() !== '') {
//                 const saltRounds = 10;
//                 const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);
//                 userUpdates.password = hashedPassword;
//             }

//             if (Object.keys(userUpdates).length > 0) {
//                 await Usuario.updateUsuario(medico.id_usuario, userUpdates);
//             }

//             // ===============================
//             // MÉDICO (MATRÍCULA)
//             // ===============================
//             if (matricula) {
//                 await Medico.updateMatricula(id_medico, matricula);
//             }

//             // ===============================
//             // ESPECIALIDADES
//             // ===============================
//             if (especialidades_modificadas === '1') {

//                 const listaEspecialidades = Array.isArray(especialidades)
//                     ? especialidades
//                     : especialidades
//                         ? [especialidades]
//                         : [];

//                 await Especialidad.desactivarTodasPorMedico(id_medico);

//                 for (const idEsp of listaEspecialidades) {
//                     await Especialidad.asignarAMedico(id_medico, idEsp);
//                 }

//             } else {
//                 console.log('Especialidades no modificadas → no se toca BD');
//             }


//             // ===============================
//             // TELÉFONOS
//             // ===============================
//             if (telefonos_modificados === '1') {

//                 // 🔑 Si no llegó el campo, interpretamos: borrar todos
//                 const telefonosArray = Array.isArray(telefonos)
//                     ? telefonos
//                     : typeof telefonos === 'string'
//                         ? [telefonos]
//                         : [];

//                 // Limpiar vacíos
//                 const telefonosLimpios = telefonosArray
//                     .map(t => t?.trim())
//                     .filter(Boolean);

//                 // Borrar siempre si hubo cambios
//                 await Persona.eliminarTelefonos(medico.id_persona);

//                 //  Insertar solo si hay algo
//                 for (const tel of telefonosLimpios) {
//                     await Persona.addTelefono(medico.id_persona, tel);
//                 }

//             }

//             res.redirect('/medicos?nombreUpdate=1');

//         } catch (error) {
//             console.error('Error al actualizar médico:', error);
//             next(error);
//         }
//     }





//     // ================================================================
//     // ESTADO
//     // ================================================================
//     async inactivar(req, res, next) {
//         await Medico.actualizarEstado(req.params.id_medico, 0);
//         res.redirect('/medicos?nombreInactivo=1');
//     }

//     async activar(req, res, next) {
//         await Medico.actualizarEstado(req.params.id_medico, 1);
//         res.redirect('/medicos?nombreActivo=1');
//     }
//     // ================================================================
//     // BUSCADOR ON DEMAND
//     // ================================================================

//     // 🔎 Buscar médicos por nombre/apellido
//     async buscar(req, res) {
//         try {
//             const { q } = req.query;

//             if (!q || q.length < 2) {
//                 return res.json([]);
//             }

//             const resultados = await Medico.buscarPorNombre(q);
//             res.json(resultados);

//         } catch (error) {
//             console.error('Error buscando médicos:', error);
//             res.status(500).json([]);
//         }
//     }

//     //Especialidades activas del médico
//     async especialidadesActivas(req, res) {
//         try {
//             const { id_medico } = req.params;

//             const especialidades = await Especialidad.getActivasPorMedico(id_medico);
//             res.json(especialidades);

//         } catch (error) {
//             console.error('Error obteniendo especialidades:', error);
//             res.status(500).json([]);
//         }
//     }






// }


// module.exports = new MedicosController();


const Medico = require('../models/medicosModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');
const Especialidad = require('../models/especialidadesModels');

const { validateMedicos } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const bcrypt = require('bcrypt');

class MedicosController {

    // ================================================================
    // LISTAR CON PAGINACIÓN Y BUSCADOR
    // ================================================================
    async get(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.q || '';
            const offset = (page - 1) * limit;

            const medicos = await Medico.listarPaginado(limit, offset, search);
            const totalMedicos = await Medico.contarTodos(search);
            const especialidades = await Especialidad.getAll(); // Para modales de creación/edición en el index

            const totalPages = Math.ceil(totalMedicos / limit);

            const medicosConFecha = medicos.map(m => ({
                ...m,
                nacimiento: m.nacimiento
                    ? obtenerFechaFormateada(new Date(m.nacimiento))
                    : null
            }));

            const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;
            let mensaje = null;
            if (nombreInactivo) mensaje = 'Se dio de baja al médico';
            else if (nombreActivo) mensaje = 'Se dio de alta al médico';
            else if (nombreUpdate) mensaje = 'Médico actualizado correctamente';
            else if (nombreStore) mensaje = 'Médico creado correctamente';

            res.render('medicos/index', {
                medicos: medicosConFecha,
                especialidades, // <--- Enviado para evitar el error 'length' en el each
                mensaje,
                currentPage: page,
                totalPages: totalPages,
                totalMedicos: totalMedicos,
                limit: limit,
                search: search
            });
        } catch (err) {
            console.error("Error en MedicosController.get:", err);
            next(err);
        }
    }

    // ================================================================
    // FORM CREAR
    // ================================================================
    async getCreateForm(req, res, next) {
        try {
            const especialidades = await Especialidad.getAll();
            res.render('medicos/crear', { especialidades, errores: [], old: {} });
        } catch (err) {
            next(err);
        }
    }

    // ================================================================
    // GUARDAR MÉDICO (STORE)
    // ================================================================
    async store(req, res, next) {
        try {
            const {
                dni, nombre, apellido, nacimiento, email,
                password, repeatPassword, matricula, especialidades,
                telefonoAlternativo, telefonos_extra
            } = req.body;

            // 1. Normalizar Especialidades
            const especialidadesArray = Array.isArray(especialidades)
                ? especialidades
                : especialidades ? [especialidades] : [];

            // 2. Unificar teléfonos y limpiar vacíos
            let todosLosTelefonos = [];
            if (telefonoAlternativo && telefonoAlternativo.trim()) {
                todosLosTelefonos.push(telefonoAlternativo.trim());
            }
            if (telefonos_extra) {
                const extras = Array.isArray(telefonos_extra) ? telefonos_extra : [telefonos_extra];
                extras.forEach(t => {
                    if (t && t.trim()) todosLosTelefonos.push(t.trim());
                });
            }

            // 3. Validación Zod
            const parsed = validateMedicos({
                dni, nombre, apellido,
                fechaNacimiento: nacimiento, // Zod Preprocess lo convierte a Date
                email, password, repeatPassword, matricula,
                especialidades: especialidadesArray,
                telefonos: todosLosTelefonos
            });

            if (!parsed.success) {
                const especialidadesDB = await Especialidad.getAll();
                return res.render('medicos/crear', {
                    errores: parsed.error.issues.map(i => i.message),
                    old: req.body,
                    especialidades: especialidadesDB
                });
            }

            // 4. Verificar DNI Único
            const personaExistente = await Persona.getByDni(parsed.data.dni);
            if (personaExistente) {
                const especialidadesDB = await Especialidad.getAll();
                return res.render('medicos/crear', {
                    errores: ['El DNI ya se encuentra registrado.'],
                    old: req.body,
                    especialidades: especialidadesDB
                });
            }

            // 5. Creación de Persona
            const persona = await Persona.create({
                dni: parsed.data.dni,
                nombre: parsed.data.nombre,
                apellido: parsed.data.apellido,
                nacimiento: parsed.data.fechaNacimiento.toISOString().split('T')[0]
            });

            // 6. Creación de Usuario
            const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
            const usuario = await Usuario.create({
                email: parsed.data.email,
                password: hashedPassword,
                id_persona: persona.id,
                id_rol: 2
            });

            // 7. Creación de Médico (Aseguramos que todos los campos obligatorios existan)
            const medicoId = await Medico.crear({
                id_persona: persona.id,
                id_usuario: usuario.id,
                matricula: parsed.data.matricula,
                estado: 1
            });

            // 8. Relaciones (Especialidades y Teléfonos)
            for (const idEsp of parsed.data.especialidades) {
                await Especialidad.asignarAMedico(medicoId, idEsp);
            }
            for (const tel of parsed.data.telefonos) {
                await Persona.addTelefono(persona.id, tel);
            }

            res.redirect('/medicos?nombreStore=1');

        } catch (err) {
            console.error('Error detallado al crear médico:', err);
            const especialidadesDB = await Especialidad.getAll();
            res.render('medicos/crear', {
                errores: [err.message || 'Ocurrió un error inesperado al guardar'],
                old: req.body,
                especialidades: especialidadesDB
            });
        }
    }

    // ================================================================
    // EDITAR (FORM)
    // ================================================================
    async edit(req, res, next) {
        try {
            const { id_medico } = req.params;
            const medico = await Medico.obtenerPorId(id_medico);
            
            if (!medico) return res.status(404).send('Médico no encontrado');

            const persona = {
                id: medico.id_persona,
                nombre: medico.nombre,
                apellido: medico.apellido,
                nacimiento: medico.nacimiento ? new Date(medico.nacimiento) : null
            };

            const usuario = {
                id: medico.id_usuario,
                email: medico.email
            };

            const especialidades = await Especialidad.getAll();
            const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

            res.render('medicos/editar', {
                medico,
                persona,
                usuario,
                especialidades,
                especialidadesAsignadas
            });
        } catch (err) {
            next(err);
        }
    }

    // ================================================================
    // ACTUALIZAR (UPDATE)
    // ================================================================
    async update(req, res, next) {
        try {
            const { id_medico } = req.params;
            const {
                nombre, apellido, nacimiento, email, password,
                matricula, especialidades, especialidades_modificadas,
                telefonos, telefonos_modificados
            } = req.body;

            const medico = await Medico.obtenerPorId(id_medico);
            if (!medico) return res.status(404).send('Médico no encontrado');

            // Actualizar Persona
            await Persona.updatePersona(medico.id_persona, { nombre, apellido, nacimiento });

            // Actualizar Usuario (Email y Password si existe)
            const userUpdates = {};
            if (email) userUpdates.email = email.trim();
            if (password && password.trim() !== '') {
                userUpdates.password = await bcrypt.hash(password.trim(), 10);
            }
            if (Object.keys(userUpdates).length > 0) {
                await Usuario.updateUsuario(medico.id_usuario, userUpdates);
            }

            // Actualizar Matrícula
            if (matricula) await Medico.updateMatricula(id_medico, matricula);

            // Actualizar Especialidades si cambiaron
            if (especialidades_modificadas === '1') {
                const listaEspecialidades = Array.isArray(especialidades) ? especialidades : (especialidades ? [especialidades] : []);
                await Especialidad.desactivarTodasPorMedico(id_medico);
                for (const idEsp of listaEspecialidades) {
                    await Especialidad.asignarAMedico(id_medico, idEsp);
                }
            }

            // Actualizar Teléfonos si cambiaron
            if (telefonos_modificados === '1') {
                const telefonosArray = Array.isArray(telefonos) ? telefonos : (telefonos ? [telefonos] : []);
                const telefonosLimpios = telefonosArray.map(t => t?.trim()).filter(Boolean);
                
                await Persona.eliminarTelefonos(medico.id_persona);
                for (const tel of telefonosLimpios) {
                    await Persona.addTelefono(medico.id_persona, tel);
                }
            }

            res.redirect('/medicos?nombreUpdate=1');
        } catch (error) {
            console.error('Error al actualizar médico:', error);
            next(error);
        }
    }

    // ================================================================
    // ESTADO (ACTIVAR/INACTIVAR)
    // ================================================================
    async inactivar(req, res, next) {
        try {
            await Medico.actualizarEstado(req.params.id_medico, 0);
            res.redirect('/medicos?nombreInactivo=1');
        } catch (err) { next(err); }
    }

    async activar(req, res, next) {
        try {
            await Medico.actualizarEstado(req.params.id_medico, 1);
            res.redirect('/medicos?nombreActivo=1');
        } catch (err) { next(err); }
    }

    // ================================================================
    // BUSCADORES Y API
    // ================================================================
    async buscar(req, res) {
        try {
            const { q } = req.query;
            if (!q || q.length < 2) return res.json([]);
            const resultados = await Medico.buscarPorNombre(q);
            res.json(resultados);
        } catch (error) {
            res.status(500).json([]);
        }
    }

    async especialidadesActivas(req, res) {
        try {
            const especialidades = await Especialidad.getActivasPorMedico(req.params.id_medico);
            res.json(especialidades);
        } catch (error) {
            res.status(500).json([]);
        }
    }
}

module.exports = new MedicosController();