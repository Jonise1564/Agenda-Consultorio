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
            const especialidades = await Especialidad.getAll(); 

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
                especialidades, 
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
    // async edit(req, res, next) {
    //     try {
    //         const { id_medico } = req.params;
    //         const medico = await Medico.obtenerPorId(id_medico);

    //         if (!medico) return res.status(404).send('Médico no encontrado');

    //         const persona = {
    //             id: medico.id_persona,
    //             nombre: medico.nombre,
    //             apellido: medico.apellido,
    //             nacimiento: medico.nacimiento ? new Date(medico.nacimiento) : null
    //         };

    //         const usuario = {
    //             id: medico.id_usuario,
    //             email: medico.email
    //         };

    //         const especialidades = await Especialidad.getAll();
    //         const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

    //         res.render('medicos/editar', {
    //             medico,
    //             persona,
    //             usuario,
    //             especialidades,
    //             especialidadesAsignadas
    //         });
    //     } catch (err) {
    //         next(err);
    //     }
    // }
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

            // Renombrado de 'usuario' a 'usuarioMedico' para evitar conflicto con layout.pug
            const usuarioMedico = {
                id: medico.id_usuario,
                email: medico.email
            };

            const especialidades = await Especialidad.getAll();
            const especialidadesAsignadas = await Especialidad.getPorMedico(id_medico);

            // Obtener teléfonos para pasarlos a la vista (si no estaban ya en el objeto medico)
            const telefonosDB = await Persona.getTelefonos(medico.id_persona);
            const telefonos = telefonosDB.map(t => t.numero);

            res.render('medicos/editar', {
                medico,
                persona,
                usuarioMedico, // <--- CAMBIADO
                telefonos,     // <--- Asegúrate de enviarlos
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
    // async update(req, res, next) {
    //     try {
    //         const { id_medico } = req.params;
    //         const {
    //             nombre, apellido, nacimiento, email, password,
    //             matricula, especialidades, especialidades_modificadas,
    //             telefonos, telefonos_modificados
    //         } = req.body;

    //         const medico = await Medico.obtenerPorId(id_medico);
    //         if (!medico) return res.status(404).send('Médico no encontrado');

    //         // Actualizar Persona
    //         await Persona.updatePersona(medico.id_persona, { nombre, apellido, nacimiento });

    //         // Actualizar Usuario (Email y Password si existe)
    //         const userUpdates = {};
    //         if (email) userUpdates.email = email.trim();
    //         if (password && password.trim() !== '') {
    //             userUpdates.password = await bcrypt.hash(password.trim(), 10);
    //         }
    //         if (Object.keys(userUpdates).length > 0) {
    //             await Usuario.updateUsuario(medico.id_usuario, userUpdates);
    //         }

    //         // Actualizar Matrícula
    //         if (matricula) await Medico.updateMatricula(id_medico, matricula);

    //         // Actualizar Especialidades si cambiaron
    //         if (especialidades_modificadas === '1') {
    //             const listaEspecialidades = Array.isArray(especialidades) ? especialidades : (especialidades ? [especialidades] : []);
    //             await Especialidad.desactivarTodasPorMedico(id_medico);
    //             for (const idEsp of listaEspecialidades) {
    //                 await Especialidad.asignarAMedico(id_medico, idEsp);
    //             }
    //         }

    //         // Actualizar Teléfonos si cambiaron
    //         if (telefonos_modificados === '1') {
    //             const telefonosArray = Array.isArray(telefonos) ? telefonos : (telefonos ? [telefonos] : []);
    //             const telefonosLimpios = telefonosArray.map(t => t?.trim()).filter(Boolean);

    //             await Persona.eliminarTelefonos(medico.id_persona);
    //             for (const tel of telefonosLimpios) {
    //                 await Persona.addTelefono(medico.id_persona, tel);
    //             }
    //         }

    //         res.redirect('/medicos?nombreUpdate=1');
    //     } catch (error) {
    //         console.error('Error al actualizar médico:', error);
    //         next(error);
    //     }
    // }

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

            // 1. Validar Email Duplicado antes de operar
            const nuevoEmail = email ? email.trim() : '';
            if (nuevoEmail !== '' && nuevoEmail !== medico.email) {
                // Buscamos si el email ya lo tiene OTRO usuario
                const existeEmail = await Usuario.getByEmail(nuevoEmail);
                if (existeEmail) {
                    console.log('Intento de duplicado bloqueado:', nuevoEmail);
                    // Redirigimos al index con un parámetro de error para mostrar un mensaje lindo
                    return res.redirect(`/medicos?errorEmail=true&email=${nuevoEmail}`);
                }
            }

            // 2. Actualizar Persona
            await Persona.updatePersona(medico.id_persona, { nombre, apellido, nacimiento });

            // 3. Preparar actualizaciones de Usuario
            const userUpdates = {};
            if (nuevoEmail !== '' && nuevoEmail !== medico.email) {
                userUpdates.email = nuevoEmail;
            }

            if (password && password.trim() !== '') {
                userUpdates.password = await bcrypt.hash(password.trim(), 10);
            }

            if (Object.keys(userUpdates).length > 0) {
                await Usuario.updateUsuario(medico.id_usuario, userUpdates);
            }

            // 4. Actualizar Matrícula
            if (matricula) await Medico.updateMatricula(id_medico, matricula);

            // 5. Especialidades
            if (especialidades_modificadas === '1') {
                const listaEspecialidades = Array.isArray(especialidades) ? especialidades : (especialidades ? [especialidades] : []);
                await Especialidad.desactivarTodasPorMedico(id_medico);
                for (const idEsp of listaEspecialidades) {
                    await Especialidad.asignarAMedico(id_medico, idEsp);
                }
            }

            // 6. Teléfonos
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
            console.error('Error crítico al actualizar médico:', error);
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