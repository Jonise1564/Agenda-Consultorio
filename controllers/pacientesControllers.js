const Paciente = require('../models/pacientesModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');

const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const bcrypt = require('bcryptjs');

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

            // ================================
            // PACIENTE
            // ================================
            const paciente = await Paciente.getPacienteById(id);
            if (!paciente) {
                return res.status(404).send('Paciente no encontrado');
            }

            // ================================
            // FECHA 
            // ================================
            if (paciente.nacimiento) {
                const f = new Date(paciente.nacimiento);
                paciente.nacimiento =
                    f.getFullYear() + '-' +
                    String(f.getMonth() + 1).padStart(2, '0') + '-' +
                    String(f.getDate()).padStart(2, '0');
            }

            // ================================
            // USUARIO
            // ================================
            const usuario = await Usuario.getById(paciente.id_usuario);

            // ================================
            // TELÉFONOS → SOLO STRINGS
            // ================================
            const telefonosDB = await Persona.getTelefonos(paciente.id_persona);
            const telefonos = telefonosDB.map(t => t.numero);

            // ================================
            // OBRA SOCIAL
            // ================================
            const obra_social = await Paciente.getOSByPaciente(id);
            const obrasSociales = await Paciente.getAllOS();

            // ================================
            // RENDER
            // ================================
            res.render('pacientes/editar', {
                paciente,
                usuario,
                telefonos,
                obra_social,
                obrasSociales
            });

        } catch (error) {
            console.error('Controller edit paciente:', error);
            next(error);
        }
    }



    async update(req, res, next) {
        try {
            const { id } = req.params;

            const {
                nombre,
                apellido,
                nacimiento,
                email,
                password,
                id_obra_social,
                telefonos
            } = req.body;

            // ================================
            // ARMAR OBJETO DE UPDATES
            // ================================
            const updates = {
                nombre,
                apellido,
                nacimiento,
                id_obra_social: id_obra_social || null
            };

            // ================================
            // DATOS DE USUARIO (OPCIONAL)
            // ================================
            if (email && email.trim() !== '') {
                updates.email = email;
            }

            if (password && password.trim() !== '') {
                const saltRounds = 10;
                updates.password = await bcrypt.hash(password, saltRounds);
            }

            // ================================
            // UPDATE PACIENTE / PERSONA / USUARIO
            // ================================
            await Paciente.updatePaciente(id, updates);

            // ================================
            // TELÉFONOS (PERSONA)
            // ================================
            
            if (telefonos) {
                const lista = Array.isArray(telefonos)
                    ? telefonos
                    : [telefonos];

                const telefonosLimpios = lista
                    .map(t => t.trim())
                    .filter(t => t !== '');

                // obtener id_persona real
                const paciente = await Paciente.getPacienteById(id);
                const id_persona = paciente.id_persona;

                // borrar teléfonos anteriores
                await Persona.eliminarTelefonos(id_persona);

                // insertar nuevos
                for (const numero of telefonosLimpios) {
                    await Persona.addTelefono(id_persona, numero);
                }
            }

            res.redirect('/pacientes');

        } catch (error) {
            console.error('Error update paciente:', error);
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
    // BUSCAR PACIENTES
    // ===========================================

    // async search(req, res, next) {
    //     try {
    //         const query = req.query.query?.trim();
    //         if (!query || query.length < 2) return res.json([]);

    //         const resultados = await Paciente.buscarPorNombreODni(query);
    //         res.json(resultados);

    //     } catch (error) {
    //         console.error("Error en search:", error);
    //         res.status(500).json({ error: "Error buscando pacientes" });
    //     }
    // }

    async search(req, res, next) {
    try {
        // Cambiamos .query por .q para que coincida con el fetch del frontend
        const query = req.query.q?.trim(); 
        
        if (!query || query.length < 2) return res.json([]);

        const resultados = await Paciente.buscarPorNombreODni(query);
        res.json(resultados);

    } catch (error) {
        console.error("Error en search:", error);
        res.status(500).json({ error: "Error buscando pacientes" });
    }
}
}

module.exports = new PacientesController();
