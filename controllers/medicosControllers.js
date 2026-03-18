const Medico = require('../models/medicosModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');
const Especialidad = require('../models/especialidadesModels');

const { validateMedicos } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
    // BUSCADORES
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

    // Verifica si un Email ya existe en la tabla Usuarios
    async verificarEmail(req, res) {
        try {
            const { email } = req.params;
            // Usamos el método que ya tienes en tu modelo Usuario
            const usuario = await Usuario.getByEmail(email);
            res.json({ existe: !!usuario });
        } catch (error) {
            console.error("Error al verificar email:", error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    }


    // ==============================
    // DASHBOARD DEL MÉDICO 
    // ==============================   
    async getDashboard(req, res, next) {
        try {
            const id_usuario = res.locals.usuario.id;
            const medico = await Medico.obtenerPorUsuario(id_usuario);

            if (!medico) {
                return res.status(404).render('errors/403', {
                    mensaje: 'No se encontró un perfil profesional asociado a su cuenta.'
                });
            }

            const [pacientesHoy, especialidades] = await Promise.all([
                Medico.obtenerTurnosDelDia(medico.id_medico),
                Medico.obtenerEspecialidades(medico.id_medico)
            ]);

            res.render('medicos/dashboard', {
                page: 'dashboard-medico',
                // PASAMOS EL DNI AQUÍ
                persona: {
                    nombre: res.locals.usuario.nombre || medico.nombre,
                    apellido: res.locals.usuario.apellido || medico.apellido,
                    dni: medico.dni || medico.paciente_dni, // Aseguramos que viaje el DNI del médico
                    nacimiento: medico.nacimiento
                },
                medico: {
                    id_medico: medico.id_medico,
                    matricula: medico.matricula,
                    especialidades: especialidades // Estas son las especialidades del médico
                },
                pacientesHoy: pacientesHoy, // Aquí deben venir: paciente_dni y especialidad_nombre
                usuario: res.locals.usuario
            });

        } catch (err) {
            console.error("Error en MedicosController.getDashboard:", err);
            next(err);
        }
    }



    // ================================================================
    // ACTUALIZAR PERFIL DESDE EL DASHBOARD (MÉDICO)
    // ================================================================
    async updatePerfil(req, res, next) {
        try {
            const id_usuario = res.locals.usuario.id;
            const id_persona_sesion = res.locals.usuario.id_persona;
            const { nombre, apellido, email, password, nacimiento } = req.body;

            const medico = await Medico.obtenerPorUsuario(id_usuario);
            if (!medico) return res.status(404).send('Perfil no encontrado');

            // 1. FORMATEAR FECHA PARA MYSQL
            let fechaFormateada = null;
            if (nacimiento) {
                fechaFormateada = nacimiento.toString().split('T')[0];
            }

            // 2. ACTUALIZAR BASE DE DATOS
            await Persona.updatePersona(id_persona_sesion, {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                nacimiento: fechaFormateada
            });

            const userUpdates = { email: email.trim() };
            if (password && password.trim() !== '') {
                const bcrypt = require('bcrypt');
                userUpdates.password = await bcrypt.hash(password.trim(), 10);
            }
            await Usuario.updateUsuario(id_usuario, userUpdates);

            // 3. ACTUALIZAR SESIÓN (LIMPIANDO EL PAYLOAD)
            // Extraemos iat y exp para que no viajen al nuevo token
            const { iat, exp, ...datosLimpios } = res.locals.usuario;

            const nuevoPayload = {
                ...datosLimpios,
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                email: email.trim()
            };

            const nuevoToken = jwt.sign(
                nuevoPayload,
                process.env.JWT_SECRET || 'tu_palabra_secreta',
                { expiresIn: '1d' } // Ahora sí funcionará sin chocar con 'exp'
            );

            // 4. GUARDAR COOKIE
            res.cookie('token_acceso', nuevoToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            // 5. REDIRIGIR CON ÉXITO
            return res.redirect('/medicos/dashboard?status=success');

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return res.redirect('/medicos/dashboard?status=error');
        }
    }

    // Verifica si una Matrícula ya existe en la tabla medicos
    async verificarMatricula(req, res) {
        try {
            const { matricula } = req.params;
            const medico = await Medico.buscarPorMatricula(matricula);
            res.json({ existe: !!medico });
        } catch (error) {
            console.error("Error al verificar matrícula:", error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    }

}

module.exports = new MedicosController();