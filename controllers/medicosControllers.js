

// // const Medico = require('../models/medicosModels');
// // const Persona = require('../models/personasModels');
// // const Usuario = require('../models/usuariosModels');
// // const Especialidad = require('../models/especialidadesModels');

// // const { validateMedicos } = require('../schemas/validation');
// // const { obtenerFechaFormateada } = require('../utils/dateFormatter');

// // class MedicosController {

// //     // ================================================================
// //     // LISTAR MÉDICOS
// //     // ================================================================
// //     async get(req, res, next) {
// //         try {
// //             const medicos = await Medico.listar();
// //             const medicosConFecha = medicos.map(m => ({
// //                 ...m,
// //                 nacimiento: m.nacimiento
// //                     ? obtenerFechaFormateada(new Date(m.nacimiento))
// //                     : null
// //             }));

// //             const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;
// //             let mensaje = null;
// //             if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Médico';
// //             if (nombreActivo) mensaje = 'Se ha dado de Alta a un Médico';
// //             if (nombreUpdate) mensaje = 'Médico actualizado correctamente';
// //             if (nombreStore) mensaje = 'Médico creado correctamente';

// //             res.render('medicos/index', { medicos: medicosConFecha, mensaje });
// //         } catch (error) {
// //             console.error('Error listando médicos:', error);
// //             next(error);
// //         }
// //     }

// //     // ================================================================
// //     // FORMULARIO CREACIÓN
// //     // ================================================================
// //     async getCreateForm(req, res, next) {
// //         try {
// //             const especialidades = await Especialidad.getAll();
// //             res.render('medicos/crear', { especialidades });
// //         } catch (error) {
// //             next(error);
// //         }
// //     }

// //     // ================================================================
// //     // CREAR MÉDICO
// //     // ================================================================
// //     async store(req, res, next) {
// //         try {
// //             const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, especialidades, telefonos } = req.body;

// //             if (password !== repeatPassword) {
// //                 return res.status(400).json({ error: "Las contraseñas no coinciden" });
// //             }

// //             const parsed = validateMedicos({ dni, nombre, apellido, fechaNacimiento: new Date(nacimiento), email, password, especialidades, telefonos });
// //             if (!parsed.success) return res.status(422).json({ error: parsed.error.issues });

// //             const nacimientoFinal = parsed.data.fechaNacimiento.toISOString().split('T')[0];

// //             const personaExistente = await Persona.getByDni(dni);
// //             if (personaExistente) return res.status(409).json({ message: "Ya existe una persona con ese DNI" });

// //             const persona = await Persona.create({ dni, nombre, apellido, nacimiento: nacimientoFinal });
// //             const usuario = await Usuario.create({ email: email.split("@")[0], password, id_persona: persona.id, id_rol: 2 });
// //             const medicoId = await Medico.crear({ id_persona: persona.id, estado: 1 });

// //             if (especialidades && especialidades.length > 0) {
// //                 for (let esp of especialidades) await Especialidad.asignarAMedico(medicoId, esp);
// //             }
// //             if (telefonos && telefonos.length > 0) {
// //                 for (let tel of telefonos) await Persona.addTelefono(persona.id, tel);
// //             }

// //             res.redirect('/medicos?nombreStore=1');
// //         } catch (error) {
// //             console.error(error);
// //             next(error);
// //         }
// //     }

// //     // ================================================================
// //     // EDITAR MÉDICO
// //     // ================================================================

// // async edit(req, res, next) {
// //     try {
// //         const { id_medico } = req.params;

// //         // Obtener médico
// //         const medico = await Medico.obtenerPorId(id_medico);
// //         if (!medico) return res.status(404).send("Médico no encontrado");

// //         // Obtener datos de persona y usuario
// //         const persona = await Persona.getById(medico.id_persona);
// //         const usuario = await Usuario.getById(medico.id_usuario);

// //         // Especialidades
// //         const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);
// //         const especialidades = await Especialidad.getAll();

// //         // Teléfonos
// //         const telefonos = await Persona.getTelefonos(persona.id) || [];
// //         const telefonosString = telefonos.length
// //             ? telefonos.map(t => t.numero).join(', ')
// //             : "";

// //         // Normalizar fecha
// //         persona.nacimiento = persona.nacimiento
// //             ? new Date(persona.nacimiento)
// //             : null;

// //         // Render
// //         res.render('medicos/editar', {
// //             persona,
// //             usuario,
// //             medico,
// //             especialidades,
// //             especialidadesAsignadas,
// //             telefonos: { numeros: telefonosString },
// //             matricula: medico.matricula
// //         });

// //     } catch (error) {
// //         next(error);
// //     }
// // }



// //     // ================================================================
// //     // GUARDAR EDICIÓN
// //     // ================================================================
// //     async update(req, res, next) {
// //         try {
// //             const { id_medico } = req.params;
// //             const { nombre, apellido, nacimiento, email, password } = req.body;

// //             const medico = await Medico.obtenerPorId(id_medico);
// //             if (!medico) return res.status(404).send("Médico no encontrado");

// //             const persona = await Persona.getById(medico.id_persona);
// //             const usuario = await Usuario.getById(medico.id_usuario);

// //             await Persona.updatePersona(persona.id, { nombre, apellido, nacimiento });
// //             await Usuario.updateUsuario(usuario.id, { email: email.split("@")[0], password });

// //             res.redirect('/medicos?nombreUpdate=1');
// //         } catch (error) {
// //             next(error);
// //         }
// //     }

// //     // ================================================================
// //     // ACTIVAR / INACTIVAR MÉDICO
// //     // ================================================================
// //     async inactivar(req, res, next) {
// //         try {
// //             const { id_medico } = req.params;
// //             const medico = await Medico.obtenerPorId(id_medico);
// //             if (!medico) return res.status(404).send("Médico no encontrado");

// //             await Medico.actualizar({ id: medico.id_medico, estado: 0, id_usuario: medico.id_usuario, id_persona: medico.id_persona });
// //             res.redirect('/medicos?nombreInactivo=1');
// //         } catch (error) {
// //             next(error);
// //         }
// //     }

// //     async activar(req, res, next) {
// //         try {
// //             const { id_medico } = req.params;
// //             const medico = await Medico.obtenerPorId(id_medico);
// //             if (!medico) return res.status(404).send("Médico no encontrado");

// //             await Medico.actualizar({ id: medico.id_medico, estado: 1, id_usuario: medico.id_usuario, id_persona: medico.id_persona });
// //             res.redirect('/medicos?nombreActivo=1');
// //         } catch (error) {
// //             next(error);
// //         }
// //     }
// // }

// // module.exports = new MedicosController();


// const Medico = require('../models/medicosModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');
// const Especialidad = require('../models/especialidadesModels');

// const { validateMedicos } = require('../schemas/validation');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');

// class MedicosController {

//     // ================================================================
//     // LISTAR MÉDICOS
//     // ================================================================
//     async get(req, res, next) {
//         try {
//             const medicos = await Medico.listar();

//             const medicosConFecha = medicos.map(m => ({
//                 ...m,
//                 nacimiento: m.nacimiento
//                     ? obtenerFechaFormateada(new Date(m.nacimiento))
//                     : null
//             }));

//             const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;
//             let mensaje = null;

//             if (nombreInactivo) mensaje = 'Se ha dado de baja al médico';
//             if (nombreActivo) mensaje = 'Se ha dado de alta al médico';
//             if (nombreUpdate) mensaje = 'Médico actualizado correctamente';
//             if (nombreStore) mensaje = 'Médico creado correctamente';

//             res.render('medicos/index', { medicos: medicosConFecha, mensaje });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ================================================================
//     // FORMULARIO CREACIÓN
//     // ================================================================
//     async getCreateForm(req, res, next) {
//         try {
//             const especialidades = await Especialidad.getAll();
//             res.render('medicos/crear', { especialidades });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ================================================================
//     // CREAR MÉDICO
//     // ================================================================
//     async store(req, res, next) {
//         try {
//             const {
//                 dni,
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 email,
//                 password,
//                 repeatPassword,
//                 especialidades,
//                 telefonos
//             } = req.body;

//             if (password !== repeatPassword) {
//                 return res.status(400).json({ error: 'Las contraseñas no coinciden' });
//             }

//             const parsed = validateMedicos({
//                 dni,
//                 nombre,
//                 apellido,
//                 fechaNacimiento: new Date(nacimiento),
//                 email,
//                 password,
//                 especialidades,
//                 telefonos
//             });

//             if (!parsed.success) {
//                 return res.status(422).json({ error: parsed.error.issues });
//             }

//             const personaExistente = await Persona.getByDni(dni);
//             if (personaExistente) {
//                 return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });
//             }

//             const persona = await Persona.create({
//                 dni,
//                 nombre,
//                 apellido,
//                 nacimiento: parsed.data.fechaNacimiento.toISOString().split('T')[0]
//             });

//             const usuario = await Usuario.create({
//                 email,
//                 password,
//                 id_persona: persona.id,
//                 id_rol: 2
//             });

//             const medicoId = await Medico.crear({
//                 id_persona: persona.id,
//                 id_usuario: usuario.id,
//                 estado: 1
//             });

//             if (especialidades?.length) {
//                 for (const esp of especialidades) {
//                     await Especialidad.asignarAMedico(medicoId, esp);
//                 }
//             }

//             if (telefonos?.length) {
//                 for (const tel of telefonos) {
//                     await Persona.addTelefono(persona.id, tel);
//                 }
//             }

//             res.redirect('/medicos?nombreStore=1');

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ================================================================
//     // EDITAR MÉDICO (FORMULARIO)
//     // ================================================================
//     async edit(req, res, next) {
//         try {
//             const { id_medico } = req.params;

//             const medicoDb = await Medico.obtenerPorId(id_medico);
//             if (!medicoDb) return res.status(404).send('Médico no encontrado');

//             // Normalizar ID
//             const medico = {
//                 ...medicoDb,
//                 id: medicoDb.id_medico
//             };

//             const persona = await Persona.getById(medico.id_persona);
//             const usuario = await Usuario.getById(medico.id_usuario);

//             // Fecha para input date
//             persona.nacimiento = persona.nacimiento
//                 ? new Date(persona.nacimiento)
//                 : null;

//             // Teléfonos
//             const telefonos = await Persona.getTelefonos(persona.id) || [];
//             const telefonosString = telefonos.map(t => t.numero).join(', ');

//             // Especialidades
//             const especialidades = await Especialidad.getAll();
//             const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

//             res.render('medicos/editar', {
//                 medico,
//                 persona,
//                 usuario,
//                 especialidades,
//                 especialidadesAsignadas,
//                 telefonos: { numeros: telefonosString }
//             });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ================================================================
//     // GUARDAR EDICIÓN
//     // ================================================================
//     async update(req, res, next) {
//         try {
//             const { id_medico } = req.params;
//             const {
//                 nombre,
//                 apellido,
//                 nacimiento,
//                 email,
//                 password,
//                 especialidades,
//                 matriculas
//             } = req.body;

//             const medico = await Medico.obtenerPorId(id_medico);
//             if (!medico) return res.status(404).send('Médico no encontrado');

//             const persona = await Persona.getById(medico.id_persona);
//             const usuario = await Usuario.getById(medico.id_usuario);

//             await Persona.updatePersona(persona.id, {
//                 nombre,
//                 apellido,
//                 nacimiento
//             });

//             if (email) {
//                 await Usuario.updateUsuario(usuario.id, { email });
//             }

//             if (password) {
//                 await Usuario.updateUsuario(usuario.id, { password });
//             }

//             // Actualizar especialidades
//             if (especialidades) {
//                 await Especialidad.eliminarDeMedico(id_medico);

//                 for (const idEsp of especialidades) {
//                     await Especialidad.asignarAMedico(
//                         id_medico,
//                         idEsp,
//                         matriculas?.[idEsp] || null
//                     );
//                 }
//             }

//             res.redirect('/medicos?nombreUpdate=1');

//         } catch (error) {
//             next(error);
//         }
//     }

//     // ================================================================
//     // ACTIVAR / INACTIVAR MÉDICO
//     // ================================================================
//     async inactivar(req, res, next) {
//         try {
//             const { id_medico } = req.params;

//             await Medico.actualizarEstado(id_medico, 0);

//             res.redirect('/medicos?nombreInactivo=1');
//         } catch (error) {
//             next(error);
//         }
//     }

//     async activar(req, res, next) {
//         try {
//             const { id_medico } = req.params;

//             await Medico.actualizarEstado(id_medico, 1);

//             res.redirect('/medicos?nombreActivo=1');
//         } catch (error) {
//             next(error);
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

class MedicosController {

    // ================================================================
    // LISTAR
    // ================================================================
    async get(req, res, next) {
        try {
            const medicos = await Medico.listar();

            const medicosConFecha = medicos.map(m => ({
                ...m,
                nacimiento: m.nacimiento
                    ? obtenerFechaFormateada(new Date(m.nacimiento))
                    : null
            }));

            const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;
            let mensaje = null;

            if (nombreInactivo) mensaje = 'Se dio de baja al médico';
            if (nombreActivo) mensaje = 'Se dio de alta al médico';
            if (nombreUpdate) mensaje = 'Médico actualizado correctamente';
            if (nombreStore) mensaje = 'Médico creado correctamente';

            res.render('medicos/index', { medicos: medicosConFecha, mensaje });
        } catch (err) {
            next(err);
        }
    }

    // ================================================================
    // FORM CREAR
    // ================================================================
    async getCreateForm(req, res, next) {
        try {
            const especialidades = await Especialidad.getAll();
            res.render('medicos/crear', { especialidades });
        } catch (err) {
            next(err);
        }
    }

    // ================================================================
    // CREAR
    // ================================================================
    async store(req, res, next) {
        try {
            const {
                dni, nombre, apellido, nacimiento,
                email, password, repeatPassword,
                especialidades, telefonos, matricula
            } = req.body;

            if (password !== repeatPassword) {
                return res.status(400).send('Las contraseñas no coinciden');
            }

            const parsed = validateMedicos({
                dni,
                nombre,
                apellido,
                fechaNacimiento: new Date(nacimiento),
                email,
                password,
                especialidades,
                telefonos
            });

            if (!parsed.success) {
                return res.status(422).json(parsed.error.issues);
            }

            const personaExistente = await Persona.getByDni(dni);
            if (personaExistente) {
                return res.status(409).send('DNI ya existente');
            }

            const persona = await Persona.create({
                dni,
                nombre,
                apellido,
                nacimiento: parsed.data.fechaNacimiento.toISOString().split('T')[0],
                email
            });

            const usuario = await Usuario.create({
                email,
                password,
                id_persona: persona.id,
                id_rol: 2
            });

            const medicoId = await Medico.crear({
                id_persona: persona.id,
                id_usuario: usuario.id,
                estado: 1,
                matricula
            });

            if (especialidades?.length) {
                for (const idEsp of especialidades) {
                    await Especialidad.asignarAMedico(medicoId, idEsp);
                }
            }

            if (telefonos?.length) {
                for (const tel of telefonos) {
                    await Persona.addTelefono(persona.id, tel);
                }
            }

            res.redirect('/medicos?nombreStore=1');

        } catch (err) {
            next(err);
        }
    }

    // ================================================================
    // EDITAR (FORM)
    // ================================================================
    // async edit(req, res, next) {
    //     try {
    //         const { id_medico } = req.params;

    //         const medico = await Medico.obtenerPorId(id_medico);
    //         if (!medico) return res.status(404).send('Médico no encontrado');

    //         const persona = await Persona.getById(medico.id_persona);
    //         const usuario = await Usuario.getById(medico.id_usuario);

    //         persona.nacimiento = persona.nacimiento
    //             ? new Date(persona.nacimiento)
    //             : null;

    //         const telefonos = await Persona.getTelefonos(persona.id);
    //         const telefonosString = telefonos.map(t => t.numero).join(', ');

    //         const especialidades = await Especialidad.getAll();
    //         const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

    //         res.render('medicos/editar', {
    //             medico,
    //             persona,
    //             usuario,
    //             especialidades,
    //             especialidadesAsignadas,
    //             telefonos: { numeros: telefonosString }
    //         });

    //     } catch (err) {
    //         next(err);
    //     }
    // }
    //     async edit(req, res, next) {
    //     try {
    //         const { id_medico } = req.params;


    //         const medico = await Medico.obtenerPorId(id_medico);
    //         if (!medico) return res.status(404).send('Médico no encontrado');

    //         medico.nacimiento = medico.nacimiento
    //             ? new Date(medico.nacimiento)
    //             : null;

    //         const especialidades = await Especialidad.getAll();
    //         const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);
    //         console.log('ESPECIALIDADES ASIGNADAS =>', especialidadesAsignadas);


    //         res.render('medicos/editar', {
    //             medico,
    //             persona: medico,   
    //             usuario: medico,   
    //             especialidades,
    //             especialidadesAsignadas,
    //             telefonos: { numeros: medico.telefonos || '' }
    //         });

    //     } catch (err) {
    //         next(err);
    //     }
    // }

    async edit(req, res, next) {
        try {
            const { id_medico } = req.params;

            // ===============================
            // 1️⃣ MÉDICO (JOIN COMPLETO)
            // ===============================
            const medico = await Medico.obtenerPorId(id_medico);
            if (!medico) {
                return res.status(404).send('Médico no encontrado');
            }

            // ===============================
            // 2️⃣ PERSONA (MAPEO CLAVE)
            // ===============================
            const persona = {
                id: medico.id_persona,
                nombre: medico.nombre,
                apellido: medico.apellido,
                nacimiento: medico.nacimiento
                    ? new Date(medico.nacimiento)
                    : null
            };

            // ===============================
            // 3️⃣ USUARIO (MAPEO CLAVE)
            // ===============================
            const usuario = {
                id: medico.id_usuario,
                email: medico.email
            };

            // ===============================
            // 4️⃣ TELÉFONOS (COMO ESPERA EL PUG)
            // ===============================
            medico.telefonos = medico.telefonos || '';

            // ===============================
            // 5️⃣ ESPECIALIDADES
            // ===============================
            const especialidades = await Especialidad.getAll();
            const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

            console.log('ESPECIALIDADES ASIGNADAS =>', especialidadesAsignadas);

            // ===============================
            // 6️⃣ RENDER
            // ===============================
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
    // UPDATE
    // ================================================================
    // async update(req, res, next) {
    //     try {
    //         const { id_medico } = req.params;
    //         const {
    //             nombre, apellido, nacimiento,
    //             email, password, matricula,
    //             especialidades
    //         } = req.body;

    //         const medico = await Medico.obtenerPorId(id_medico);
    //         if (!medico) return res.status(404).send('Médico no encontrado');

    //         await Persona.updatePersona(medico.id_persona, {
    //             nombre,
    //             apellido,
    //             nacimiento
    //         });

    //         if (email) {
    //             await Usuario.updateUsuario(medico.id_usuario, { email });
    //         }

    //         if (password) {
    //             await Usuario.updateUsuario(medico.id_usuario, { password });
    //         }

    //         await Medico.actualizarMatricula(id_medico, matricula);

    //         await Especialidad.eliminarDeMedico(id_medico);
    //         if (especialidades?.length) {
    //             for (const idEsp of especialidades) {
    //                 await Especialidad.asignarAMedico(id_medico, idEsp);
    //             }
    //         }

    //         res.redirect('/medicos?nombreUpdate=1');

    //     } catch (err) {
    //         next(err);
    //     }
    // }

    //     async update(req, res, next) {
    //     try {
    //         const { id_medico } = req.params;

    //         const {
    //             nombre,
    //             apellido,
    //             nacimiento,
    //             email,
    //             password,
    //             matricula
    //         } = req.body;

    //         // ===============================
    //         // OBTENER MÉDICO
    //         // ===============================
    //         const medico = await Medico.obtenerPorId(id_medico);
    //         if (!medico) {
    //             return res.status(404).send('Médico no encontrado');
    //         }

    //         // ===============================
    //         // ACTUALIZAR PERSONA
    //         // ===============================
    //         await Persona.updatePersona(medico.id_persona, {
    //             nombre,
    //             apellido,
    //             nacimiento
    //         });

    //         // ===============================
    //         // ACTUALIZAR USUARIO
    //         // ===============================
    //         const userUpdates = {};
    //         if (email) userUpdates.email = email;
    //         if (password && password.trim() !== '') {
    //             userUpdates.password = password;
    //         }

    //         if (Object.keys(userUpdates).length > 0) {
    //             await Usuario.updateUsuario(medico.id_usuario, userUpdates);
    //         }

    //         // ===============================
    //         // ACTUALIZAR MÉDICO (matrícula)
    //         // ===============================
    //         if (matricula) {
    //             await Medico.updateMatricula(id_medico, matricula);
    //         }

    //         // ===============================
    //         // REDIRECT OK
    //         // ===============================
    //         // res.redirect(`/medicos/edit/${id_medico}?ok=1`);

    //         res.redirect('/medicos?nombreUpdate=1');


    //     } catch (error) {
    //         console.error('Error al actualizar médico:', error);
    //         next(error);
    //     }
    // }



    // async update(req, res, next) {
    //     try {
    //         const { id_medico } = req.params;

    //         const {
    //             nombre,
    //             apellido,
    //             nacimiento,
    //             email,
    //             password,
    //             matricula,
    //             especialidades = [],
    //             telefonos = []
    //         } = req.body;

    //         // ===============================
    //         // OBTENER MÉDICO
    //         // ===============================
    //         const medico = await Medico.obtenerPorId(id_medico);
    //         if (!medico) {
    //             return res.status(404).send('Médico no encontrado');
    //         }

    //         // ===============================
    //         // PERSONA
    //         // ===============================
    //         await Persona.updatePersona(medico.id_persona, {
    //             nombre,
    //             apellido,
    //             nacimiento
    //         });

    //         // ===============================
    //         // USUARIO
    //         // ===============================
    //         const userUpdates = {};
    //         if (email) userUpdates.email = email;
    //         if (password && password.trim() !== '') {
    //             userUpdates.password = password;
    //         }

    //         if (Object.keys(userUpdates).length > 0) {
    //             await Usuario.updateUsuario(medico.id_usuario, userUpdates);
    //         }

    //         // ===============================
    //         // MÉDICO (MATRÍCULA)
    //         // ===============================
    //         if (matricula) {
    //             await Medico.updateMatricula(id_medico, matricula);
    //         }

    //         // ===============================
    //         // TELÉFONOS
    //         // ===============================
    //         await Persona.eliminarTelefonos(medico.id_persona);

    //         const telefonosArray = Array.isArray(telefonos)
    //             ? telefonos
    //             : [telefonos];

    //         for (const tel of telefonosArray) {
    //             if (tel && tel.trim() !== '') {
    //                 await Persona.addTelefono(medico.id_persona, tel);
    //             }
    //         }

    //         // ===============================
    //         // ESPECIALIDADES
    //         // ===============================
    //         // 1. Desactivar todas
    //         await Especialidad.desactivarTodasPorMedico(id_medico);

    //         // 2. Activar las seleccionadas
    //         const especialidadesArray = Array.isArray(especialidades)
    //             ? especialidades
    //             : [especialidades];

    //         for (const idEsp of especialidadesArray) {
    //             await Especialidad.asignarAMedico(id_medico, idEsp);
    //         }

    //         // ===============================
    //         // OK
    //         // ===============================
    //         res.redirect('/medicos?nombreUpdate=1');

    //     } catch (error) {
    //         console.error('Error al actualizar médico:', error);
    //         next(error);
    //     }
    // }



    // async update(req, res, next) {
    //   try {
    //     const { id_medico } = req.params;

    //     const {
    //       nombre,
    //       apellido,
    //       nacimiento,
    //       email,
    //       password,
    //       matricula,
    //       especialidades,
    //       especialidades_modificadas
    //     } = req.body;

    //     // ===============================
    //     // 1️⃣ OBTENER MÉDICO
    //     // ===============================
    //     const medico = await Medico.obtenerPorId(id_medico);
    //     if (!medico) {
    //       return res.status(404).send('Médico no encontrado');
    //     }

    //     // ===============================
    //     // 2️⃣ PERSONA
    //     // ===============================
    //     await Persona.updatePersona(medico.id_persona, {
    //       nombre,
    //       apellido,
    //       nacimiento
    //     });

    //     // ===============================
    //     // 3️⃣ USUARIO
    //     // ===============================
    //     const userUpdates = {};
    //     if (email) userUpdates.email = email;
    //     if (password && password.trim() !== '') {
    //       userUpdates.password = password;
    //     }

    //     if (Object.keys(userUpdates).length > 0) {
    //       await Usuario.updateUsuario(medico.id_usuario, userUpdates);
    //     }

    //     // ===============================
    //     //  MÉDICO (MATRÍCULA)
    //     // ===============================
    //     if (matricula) {
    //       await Medico.updateMatricula(id_medico, matricula);
    //     }

    //     // ===============================
    //     //  ESPECIALIDADES (SOLO SI HUBO CAMBIOS)
    //     // ===============================
    //     if (especialidades_modificadas === '1') {

    //       const listaEspecialidades = Array.isArray(especialidades)
    //         ? especialidades
    //         : especialidades
    //           ? [especialidades]
    //           : [];

    //       // sincronización controlada
    //       await Especialidad.desactivarTodasPorMedico(id_medico);

    //       for (const idEsp of listaEspecialidades) {
    //         await Especialidad.asignarAMedico(id_medico, idEsp);
    //       }

    //     } else {
    //       console.log('Especialidades no modificadas → no se toca BD');
    //     }

    //         // ===============================
    //         // TELÉFONOS
    //         // ===============================
    //         if (req.body.telefonos !== undefined) {

    //         // 1️⃣ borrar teléfonos actuales
    //         await Persona.eliminarTelefonos(medico.id_persona);

    //         // 2️⃣ normalizar
    //         const telefonosArray = Array.isArray(req.body.telefonos)
    //             ? req.body.telefonos
    //             : [req.body.telefonos];

    //         // 3️⃣ insertar
    //         for (const tel of telefonosArray) {
    //             if (tel && tel.trim() !== '') {
    //             await Persona.addTelefono(medico.id_persona, tel);
    //             }
    //         }
    //         }


    //     // ===============================
    //     // 6️⃣ OK
    //     // ===============================
    //     res.redirect('/medicos?nombreUpdate=1');

    //   } catch (error) {
    //     console.error('Error al actualizar médico:', error);
    //     next(error);
    //   }
    // }

    async update(req, res, next) {
        try {
            const { id_medico } = req.params;

            const {
                nombre,
                apellido,
                nacimiento,
                email,
                password,
                matricula,
                especialidades,
                especialidades_modificadas,
                telefonos,
                telefonos_modificados
            } = req.body;

            // ===============================
            // 1️⃣ OBTENER MÉDICO
            // ===============================
            const medico = await Medico.obtenerPorId(id_medico);
            if (!medico) {
                return res.status(404).send('Médico no encontrado');
            }

            // ===============================
            // 2️⃣ PERSONA
            // ===============================
            await Persona.updatePersona(medico.id_persona, {
                nombre,
                apellido,
                nacimiento
            });

            // ===============================
            // 3️⃣ USUARIO
            // ===============================
            const userUpdates = {};
            if (email) userUpdates.email = email;
            if (password && password.trim() !== '') {
                userUpdates.password = password;
            }

            if (Object.keys(userUpdates).length > 0) {
                await Usuario.updateUsuario(medico.id_usuario, userUpdates);
            }

            // ===============================
            // 4️⃣ MÉDICO (MATRÍCULA)
            // ===============================
            if (matricula) {
                await Medico.updateMatricula(id_medico, matricula);
            }

            // ===============================
            // 5️⃣ ESPECIALIDADES (🔑 SOLO SI HUBO CAMBIOS)
            // ===============================
            if (especialidades_modificadas === '1') {

                const listaEspecialidades = Array.isArray(especialidades)
                    ? especialidades
                    : especialidades
                        ? [especialidades]
                        : [];

                await Especialidad.desactivarTodasPorMedico(id_medico);

                for (const idEsp of listaEspecialidades) {
                    await Especialidad.asignarAMedico(id_medico, idEsp);
                }

            } else {
                console.log('Especialidades no modificadas → no se toca BD');
            }

            // ===============================
            // 6️⃣ TELÉFONOS (🔑 SOLO SI HUBO CAMBIOS)
            // ===============================
            if (telefonos_modificados === '1') {

                await Persona.eliminarTelefonos(medico.id_persona);

                const telefonosArray = Array.isArray(telefonos)
                    ? telefonos
                    : telefonos
                        ? [telefonos]
                        : [];

                for (const tel of telefonosArray) {
                    if (tel && tel.trim() !== '') {
                        await Persona.addTelefono(medico.id_persona, tel.trim());
                    }
                }

            } else {
                console.log('Teléfonos no modificados → no se toca BD');
            }

            // ===============================
            // 7️⃣ OK
            // ===============================
            res.redirect('/medicos?nombreUpdate=1');

        } catch (error) {
            console.error('Error al actualizar médico:', error);
            next(error);
        }
    }





    // ================================================================
    // ESTADO
    // ================================================================
    async inactivar(req, res, next) {
        await Medico.actualizarEstado(req.params.id_medico, 0);
        res.redirect('/medicos?nombreInactivo=1');
    }

    async activar(req, res, next) {
        await Medico.actualizarEstado(req.params.id_medico, 1);
        res.redirect('/medicos?nombreActivo=1');
    }
}

module.exports = new MedicosController();
