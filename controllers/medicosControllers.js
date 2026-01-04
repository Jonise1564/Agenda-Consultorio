const Medico = require('../models/medicosModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');
const Especialidad = require('../models/especialidadesModels');

const { validateMedicos } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const bcrypt = require('bcrypt');


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
    // async store(req, res, next) {
    //     try {
    //         const {
    //             dni, nombre, apellido, nacimiento,
    //             email, password, repeatPassword,
    //             especialidades, telefonos, matricula
    //         } = req.body;

    //         if (password !== repeatPassword) {
    //             return res.status(400).send('Las contraseñas no coinciden');
    //         }

    //         const parsed = validateMedicos({
    //             dni,
    //             nombre,
    //             apellido,
    //             fechaNacimiento: new Date(nacimiento),
    //             email,
    //             password,
    //             especialidades,
    //             telefonos
    //         });

    //         if (!parsed.success) {
    //             return res.status(422).json(parsed.error.issues);
    //         }

    //         const personaExistente = await Persona.getByDni(dni);
    //         if (personaExistente) {
    //             return res.status(409).send('DNI ya existente');
    //         }

    //         const persona = await Persona.create({
    //             dni,
    //             nombre,
    //             apellido,
    //             nacimiento: parsed.data.fechaNacimiento.toISOString().split('T')[0],
    //             email
    //         });

    //         const usuario = await Usuario.create({
    //             email,
    //             password,
    //             id_persona: persona.id,
    //             id_rol: 2
    //         });

    //         const medicoId = await Medico.crear({
    //             id_persona: persona.id,
    //             id_usuario: usuario.id,
    //             estado: 1,
    //             matricula
    //         });

    //         if (especialidades?.length) {
    //             for (const idEsp of especialidades) {
    //                 await Especialidad.asignarAMedico(medicoId, idEsp);
    //             }
    //         }

    //         if (telefonos?.length) {
    //             for (const tel of telefonos) {
    //                 await Persona.addTelefono(persona.id, tel);
    //             }
    //         }

    //         res.redirect('/medicos?nombreStore=1');

    //     } catch (err) {
    //         next(err);
    //     }
    // }


    // async store(req, res, next) {
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
    //             telefonos
    //         } = req.body;

    //         // ===============================
    //         // VALIDACIONES BÁSICAS
    //         // ===============================
    //         if (password !== repeatPassword) {
    //             return res.status(400).send('Las contraseñas no coinciden');
    //         }

    //         const parsed = validateMedicos({
    //             dni,
    //             nombre,
    //             apellido,
    //             fechaNacimiento: new Date(nacimiento),
    //             email,
    //             password,
    //             especialidades,
    //             telefonos
    //         });

    //         if (!parsed.success) {
    //             return res.status(422).json(parsed.error.issues);
    //         }

    //         // ===============================
    //         // DNI ÚNICO
    //         // ===============================
    //         const personaExistente = await Persona.getByDni(dni);
    //         if (personaExistente) {
    //             return res.status(409).send('DNI ya existente');
    //         }

    //         // ===============================
    //         // CREAR PERSONA
    //         // ===============================
    //         const persona = await Persona.create({
    //             dni,
    //             nombre,
    //             apellido,
    //             nacimiento: parsed.data.fechaNacimiento
    //                 .toISOString()
    //                 .split('T')[0]
    //         });

    //         // ===============================
    //         // CREAR USUARIO
    //         // ===============================
    //         const saltRounds = 10;
    //         const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);

    //         const usuario = await Usuario.create({
    //             email: email.trim(),
    //             password: hashedPassword,
    //             id_persona: persona.id,
    //             id_rol: 2 // médico
    //         });

    //         // ===============================
    //         // CREAR MÉDICO
    //         // ===============================
    //         const medicoId = await Medico.crear({
    //             id_persona: persona.id,
    //             id_usuario: usuario.id,
    //             estado: 1,
    //             matricula
    //         });

    //         // ===============================
    //         // ESPECIALIDADES (MISMA LÓGICA QUE UPDATE)
    //         // ===============================
    //         const especialidadesArray = Array.isArray(especialidades)
    //             ? especialidades
    //             : especialidades
    //                 ? [especialidades]
    //                 : [];

    //         for (const idEsp of especialidadesArray) {
    //             await Especialidad.asignarAMedico(medicoId, idEsp);
    //         }

    //         // ===============================
    //         // TELÉFONOS (MISMA LÓGICA QUE UPDATE)
    //         // ===============================
    //         const telefonosArray = Array.isArray(telefonos)
    //             ? telefonos
    //             : typeof telefonos === 'string'
    //                 ? [telefonos]
    //                 : [];

    //         const telefonosLimpios = telefonosArray
    //             .map(t => t?.trim())
    //             .filter(Boolean);

    //         for (const tel of telefonosLimpios) {
    //             await Persona.addTelefono(persona.id, tel);
    //         }

    //         // ===============================
    //         // REDIRECT OK
    //         // ===============================
    //         res.redirect('/medicos?nombreStore=1');

    //     } catch (err) {
    //         console.error('Error al crear médico:', err);
    //         next(err);
    //     }
    // }


    async store(req, res, next) {
    try {
        const {
            dni,
            nombre,
            apellido,
            nacimiento,
            email,
            password,
            repeatPassword,
            matricula,
            especialidades,
            telefonos
        } = req.body;

        // ===============================
        // NORMALIZAR ARRAYS (ANTES DE VALIDAR)
        // ===============================
        const especialidadesArray = Array.isArray(especialidades)
            ? especialidades
            : especialidades ? [especialidades] : [];

        const telefonosArray = Array.isArray(telefonos)
            ? telefonos
            : telefonos ? [telefonos] : [];

        // ===============================
        // VALIDACIÓN ZOD
        // ===============================
        const parsed = validateMedicos({
            dni,
            nombre,
            apellido,
            fechaNacimiento: new Date(nacimiento),
            email,
            password,
            repeatPassword,     // 🔑 FALTABA
            matricula,          // 🔑 FALTABA
            especialidades: especialidadesArray,
            telefonos: telefonosArray
        });

        if (!parsed.success) {
            return res.status(422).json(parsed.error.issues);
        }

        // ===============================
        // DNI ÚNICO
        // ===============================
        const personaExistente = await Persona.getByDni(dni);
        if (personaExistente) {
            return res.status(409).send('DNI ya existente');
        }

        // ===============================
        // CREAR PERSONA
        // ===============================
        const persona = await Persona.create({
            dni,
            nombre,
            apellido,
            nacimiento: parsed.data.fechaNacimiento
                .toISOString()
                .split('T')[0]
        });

        // ===============================
        // CREAR USUARIO
        // ===============================
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(parsed.data.password, saltRounds);

        const usuario = await Usuario.create({
            email: parsed.data.email,
            password: hashedPassword,
            id_persona: persona.id,
            id_rol: 2
        });

        // ===============================
        // CREAR MÉDICO
        // ===============================
        const medicoId = await Medico.crear({
            id_persona: persona.id,
            id_usuario: usuario.id,
            estado: 1,
            matricula: parsed.data.matricula
        });

        // ===============================
        // ESPECIALIDADES
        // ===============================
        for (const idEsp of parsed.data.especialidades) {
            await Especialidad.asignarAMedico(medicoId, idEsp);
        }

        // ===============================
        // TELÉFONOS
        // ===============================
        for (const tel of parsed.data.telefonos) {
            await Persona.addTelefono(persona.id, tel);
        }

        // ===============================
        // REDIRECT OK
        // ===============================
        res.redirect('/medicos?nombreStore=1');

    } catch (err) {
        console.error('Error al crear médico:', err);
        next(err);
    }
}


    // ================================================================
    // EDITAR (FORM)
    // ================================================================

    async edit(req, res, next) {
        try {
            const { id_medico } = req.params;

            // ===============================
            //  MÉDICO (JOIN COMPLETO)
            // ===============================
            const medico = await Medico.obtenerPorId(id_medico);
            if (!medico) {
                return res.status(404).send('Médico no encontrado');
            }

            // ===============================
            //  PERSONA (MAPEO CLAVE)
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
            // USUARIO (MAPEO CLAVE)
            // ===============================
            const usuario = {
                id: medico.id_usuario,
                email: medico.email
            };

            // ===============================
            // TELÉFONOS (COMO ESPERA EL PUG)
            // ===============================
            medico.telefonos = medico.telefonos || '';

            // ===============================
            //  ESPECIALIDADES
            // ===============================
            const especialidades = await Especialidad.getAll();
            const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

            console.log('ESPECIALIDADES ASIGNADAS =>', especialidadesAsignadas);

            // ===============================
            // RENDER
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
            // OBTENER MÉDICO
            // ===============================
            const medico = await Medico.obtenerPorId(id_medico);
            if (!medico) {
                return res.status(404).send('Médico no encontrado');
            }

            // ===============================
            // PERSONA
            // ===============================
            await Persona.updatePersona(medico.id_persona, {
                nombre,
                apellido,
                nacimiento
            });

            // =========================
            // USUARIO
            // =========================
            const userUpdates = {};

            if (email) {
                userUpdates.email = email.trim();
            }

            if (password && password.trim() !== '') {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password.trim(), saltRounds);
                userUpdates.password = hashedPassword;
            }

            if (Object.keys(userUpdates).length > 0) {
                await Usuario.updateUsuario(medico.id_usuario, userUpdates);
            }

            // ===============================
            // MÉDICO (MATRÍCULA)
            // ===============================
            if (matricula) {
                await Medico.updateMatricula(id_medico, matricula);
            }

            // ===============================
            // ESPECIALIDADES
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
            // TELÉFONOS
            // ===============================
            if (telefonos_modificados === '1') {

                // 🔑 Si no llegó el campo, interpretamos: borrar todos
                const telefonosArray = Array.isArray(telefonos)
                    ? telefonos
                    : typeof telefonos === 'string'
                        ? [telefonos]
                        : [];

                // Limpiar vacíos
                const telefonosLimpios = telefonosArray
                    .map(t => t?.trim())
                    .filter(Boolean);

                // Borrar siempre si hubo cambios
                await Persona.eliminarTelefonos(medico.id_persona);

                //  Insertar solo si hay algo
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
    // ================================================================
    // BUSCADOR ON DEMAND
    // ================================================================

    // 🔎 Buscar médicos por nombre/apellido
    async buscar(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.length < 2) {
                return res.json([]);
            }

            const resultados = await Medico.buscarPorNombre(q);
            res.json(resultados);

        } catch (error) {
            console.error('Error buscando médicos:', error);
            res.status(500).json([]);
        }
    }

    //Especialidades activas del médico
    async especialidadesActivas(req, res) {
        try {
            const { id_medico } = req.params;

            const especialidades = await Especialidad.getActivasPorMedico(id_medico);
            res.json(especialidades);

        } catch (error) {
            console.error('Error obteniendo especialidades:', error);
            res.status(500).json([]);
        }
    }






}


module.exports = new MedicosController();
