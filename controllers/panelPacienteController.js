const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');

class PanelPacienteController {

    // 1. Dashboard principal del paciente
    async getInicio(req, res, next) {
        try {
            const usuarioLogueado = req.user || res.locals.usuario;
            if (!usuarioLogueado) return res.redirect('/auth/login');

            const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
            const infoPaciente = await Paciente.getByUsuarioId(idUsuario);

            if (!infoPaciente) return res.status(404).send("Perfil no encontrado");

            // Obtenemos los turnos usando el id_paciente que viene de la base de datos
            const turnos = await Turno.getByPacienteId(infoPaciente.id_paciente);

            res.render('paciente/dashboard', {
                paciente: infoPaciente,
                turnos: turnos || []
            });
        } catch (error) {
            console.error("🔥 Error en getInicio:", error);
            next(error);
        }
    }

    // 2. Vista de Perfil 
    async verPerfil(req, res, next) {
        try {
            const usuarioLogueado = req.user || res.locals.usuario;
            const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
            const infoPaciente = await Paciente.getByUsuarioId(idUsuario);
            
            res.render('paciente/perfil', {
                paciente: infoPaciente,
                usuario: usuarioLogueado
            });
        } catch (error) {
            next(error);
        }
    }

    // 3. Procesar la reserva de un nuevo turno
    async confirmarReserva(req, res, next) {
        try {
            const { id_paciente, fecha, hora_inicio, id_agenda, motivo } = req.body;

            if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
                return res.status(400).send("Faltan datos obligatorios.");
            }

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaSeleccionada = new Date(fecha + 'T00:00:00');

            if (fechaSeleccionada < hoy) {
                return res.status(400).send("No puedes solicitar turnos en fechas pasadas.");
            }

            await Turno.agendarTurnoVirtual({
                fecha,
                hora_inicio,
                id_agenda,
                id_paciente,
                motivo: motivo || 'Turno solicitado desde el Panel del Paciente'
            });

            res.redirect('/pacientes/dashboard?status=success');
        } catch (error) {
            console.error("🔥 Error en confirmarReserva:", error);
            next(error);
        }
    }

    // 4. Procesar la edición del perfil (Nombre, Apellido, Email, Nacimiento)
    async postEditarPerfil(req, res, next) {
        try {
            const usuarioLogueado = req.user || res.locals.usuario;
            const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;

            // Datos que vienen del formulario Modal del PUG
            const { nombre, apellido, email, nacimiento } = req.body;

            // Obtenemos el perfil actual para tener los IDs necesarios
            const infoPaciente = await Paciente.getByUsuarioId(idUsuario);

            if (!infoPaciente) {
                return res.status(404).send("No se encontró el perfil del paciente.");
            }

            // Llamamos a la función del modelo (la que creamos con createConnection)
            await Paciente.actualizarPerfil({
                id_persona: infoPaciente.id_persona,
                id_paciente: infoPaciente.id_paciente,
                nombre,
                apellido,
                email,
                nacimiento
            });

            // Redirigimos con un parámetro de estado para mostrar el SweetAlert
            res.redirect('/pacientes/dashboard?status=profile_updated');

        } catch (error) {
            console.error("🔥 Error al editar perfil:", error);
            next(error);
        }
    }
}

module.exports = new PanelPacienteController();