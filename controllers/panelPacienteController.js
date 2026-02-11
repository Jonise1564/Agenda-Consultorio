const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');
const Agenda = require('../models/agendasModels');
const EmailService = require('../services/emailService');

class PanelPacienteController {

    // 1. Dashboard principal del paciente
    getInicio = async (req, res, next) => {
        try {
            const usuarioLogueado = req.user || res.locals.usuario;
            if (!usuarioLogueado) return res.redirect('/auth/login');

            const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
            const infoPaciente = await Paciente.getByUsuarioId(idUsuario);

            if (!infoPaciente) return res.status(404).send("Perfil no encontrado");

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
    verPerfil = async (req, res, next) => {
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

    confirmarReserva = async (req, res, next) => {
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

            // 1. Agendamos el turno en la DB
            await Turno.agendarTurnoVirtual({
                fecha,
                hora_inicio,
                id_agenda,
                id_paciente,
                motivo: motivo || 'Turno solicitado desde el Panel del Paciente'
            });

            // 2. DISPARAR NOTIFICACIÓN (Solo llega aquí si agendarTurnoVirtual NO lanzó error)
            this.enviarNotificacionPaciente(id_paciente, fecha, hora_inicio, id_agenda, motivo);

            return res.redirect('/pacientes/dashboard?status=success');

        } catch (error) {
            console.error("❌ Manejando error en confirmarReserva:", error.message);

            // Detectamos si es un error de nuestras validaciones (Especialidad o Solapamiento)
            const esValidacion = error.message.includes("Ya tienes") || error.code === 'ER_DUP_ENTRY';

            if (esValidacion) {
                // Enviamos el status "error_duplicado" y el mensaje real codificado en la URL
                return res.redirect(`/pacientes/dashboard?status=error_duplicado&msg=${encodeURIComponent(error.message)}`);
            }

            // Error genérico de servidor
            return res.redirect('/pacientes/dashboard?status=error_server');
        }
    }

    // 4. Método auxiliar para manejar la lógica de email (Arrow function para fijar el 'this')
    enviarNotificacionPaciente = async (id_paciente, fecha, hora, id_agenda, motivo) => {
        try {
            // Obtenemos los datos completos para el cuerpo del mail
            const [paciente, agenda] = await Promise.all([
                Paciente.getById(id_paciente),
                Agenda.getAgendaById(id_agenda)
            ]);

            if (paciente && paciente.email) {
                // Buscamos el nombre de la especialidad en las propiedades posibles que devuelva tu DB
                const especialidadDetectada = agenda.especialidad_nombre ||
                    agenda.especialidad ||
                    agenda.nombre_especialidad ||
                    'Consulta General';

                await EmailService.enviarConfirmacion(paciente.email, {
                    nombre: paciente.nombre,
                    fecha: fecha,
                    hora: hora,
                    medico: `Dr/a. ${agenda.apellido_medico || agenda.medico || 'Designado'}`,
                    especialidad: especialidadDetectada,
                    motivo: motivo || 'Consulta médica'
                });
            }
        } catch (err) {
            console.error("⚠️ No se pudo enviar el mail de confirmación:", err.message);
        }
    }

    // 5. Procesar la edición del perfil
    postEditarPerfil = async (req, res, next) => {
        try {
            const usuarioLogueado = req.user || res.locals.usuario;
            const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
            const { nombre, apellido, email, nacimiento } = req.body;

            const infoPaciente = await Paciente.getByUsuarioId(idUsuario);
            if (!infoPaciente) return res.status(404).send("No se encontró el perfil.");

            await Paciente.actualizarPerfil({
                id_persona: infoPaciente.id_persona,
                id_paciente: infoPaciente.id_paciente,
                nombre,
                apellido,
                email,
                nacimiento
            });

            res.redirect('/pacientes/dashboard?status=profile_updated');
        } catch (error) {
            console.error("🔥 Error al editar perfil:", error);
            next(error);
        }
    }
}

module.exports = new PanelPacienteController();