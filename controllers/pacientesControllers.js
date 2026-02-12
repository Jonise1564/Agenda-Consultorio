const Paciente = require('../models/pacientesModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');

const { validatePacientes } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const bcrypt = require('bcryptjs');

class PacientesController {

    // ===========================================
    // BUSCADOR DINÁMICO (AJAX)
    // ===========================================   
    async buscar(req, res) {
        try {
            // Acepta tanto ?q=... como ?query=...
            const texto = req.query.q || req.query.query;

            if (!texto || texto.length < 2) {
                return res.json([]);
            }

            const resultados = await Paciente.buscar(texto);
            res.json(resultados);
        } catch (error) {
            console.error("Error en PacientesController.buscar:", error);
            res.status(500).json({ error: "Error en la búsqueda" });
        }
    }

    // ===========================================
    // LISTAR PACIENTES (PAGINACIÓN + BUSCADOR)
    // ===========================================
    async get(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const search = req.query.q || '';
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const totalPacientes = await Paciente.countAll(search);
            const pacientes = await Paciente.getAllPaginated(limit, offset, search);

            const totalPages = Math.ceil(totalPacientes / limit);

            const pacientesConFechaFormateada = pacientes.map(p => ({
                ...p,
                nacimiento: p.nacimiento ? obtenerFechaFormateada(new Date(p.nacimiento)) : '---'
            }));

            const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;
            let mensaje = null;
            if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
            else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
            else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
            else if (nombreStore) mensaje = 'Paciente Creado correctamente';

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

            // Renombramos la variable aquí para evitar conflictos con res.locals.usuario
            const usuarioPaciente = await Usuario.getById(paciente.id_usuario);

            const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
            const telefonos = telefonosDB.map(t => t.numero);
            const obra_social = await Paciente.getOSByPaciente(id);
            const obrasSociales = await Paciente.getAllOS();

            res.render('pacientes/editar', {
                paciente,
                usuarioPaciente, // <--- CAMBIADO
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
    // GESTIÓN DE ESTADOS
    // ===========================================
    async inactivar(req, res, next) {
        try {
            await Paciente.inactivarPaciente(req.params.id);
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
    // ===========================================
    // VERIFICAR DNI EXISTENTE (AJAX)
    // ===========================================
    async verificarDni(req, res) {
        try {
            const { dni } = req.params;
            if (!dni) return res.json({ existe: false });

            // Usamos el modelo Persona para buscar por DNI
            const existePersona = await Persona.getByDni(dni);

            // Si existePersona no es null/undefined, significa que el DNI ya está registrado
            res.json({ existe: !!existePersona });
        } catch (error) {
            console.error("Error al verificar DNI:", error);
            res.status(500).json({ error: "Error en el servidor" });
        }
    }
    // ===========================================
    // VERIFICAR EMAIL EXISTENTE (AJAX)
    // ===========================================
    async verificarEmail(req, res) {
        try {
            const { email } = req.params;
            if (!email) return res.json({ existe: false });

            const existeUsuario = await Usuario.getByEmail(email);
            res.json({ existe: !!existeUsuario });
        } catch (error) {
            console.error("Error al verificar Email:", error);
            res.status(500).json({ error: "Error en el servidor" });
        }
    }




}

module.exports = new PacientesController();