const Turno = require('../models/turnosModels') // Modelo de especialidades

//const { validateMedicos, validatePartialMedicos } = require('../schemas/validation')
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const { obtenerHoraFormateada } = require('../utils/timeFormatter');

class TurnosController {
    //Mostrar todas los medicos
    async get(req, res, next) {
        console.log('Controller: Get All turnos');
        try {
            const { id } = req.params
            const turnos = await Turno.getAll(id);
            console.log('controlador 1', turnos)

            //formatear turnos id, fecha, hora_inicio, motivo,	estado,	orden, id_paciente, id_agenda)
            const turnosFormateado = turnos.map(turno => {
                const { hora_inicio } = turno
                const { fecha } = turno
                const horarInicioFormateado = obtenerHoraFormateada(hora_inicio)
                const fechaFormateada = obtenerFechaFormateada(new Date(fecha))
                return {
                    ...turno,
                    hora_inicio: horarInicioFormateado,
                    fecha: fechaFormateada,
                }
            })

            //Flags para verificar cambios con mensajes en pantalla
            const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;

            let mensaje = null;
            if (nombreInactivo) {
                mensaje = 'Se ha dado de Baja a un turno';
            } else if (nombreActivo) {
                mensaje = 'Medico ha dado de Alta a un turno';
            } else if (nombreUpdate) {
                mensaje = 'turno Actualizado correctamente';
            } else if (nombreStore) {
                mensaje = 'turno Creado correctamente';
            }
            console.log('controlador 1', turnosFormateado)
            //renderizo al index de turnos
            res.render('turnos/index', { turnos: turnosFormateado, mensaje });
        } catch (error) {
            console.error('Error al obtener turnos desde el controlador:', error);
            next(error);
        }
    }
    // Mostrar formulario para crear un turno
async createForm(req, res, next) {
    try {
        const { id } = req.params; // id_agenda
        res.render('turnos/create', { id_agenda: id });
    } catch (error) {
        console.error('Error mostrando formulario de turno:', error);
        next(error);
    }
}

// Guardar un turno
async store(req, res, next) {
    try {
        const { fecha, hora_inicio, motivo, id_paciente, id_agenda } = req.body;

        await Turno.create({
            fecha,
            hora_inicio,
            motivo,
            id_paciente,
            id_agenda
        });

        res.redirect(`/turnos/${id_agenda}?nombreStore=1`);
    } catch (error) {
        console.error('Error al crear turno desde el controlador:', error);
        next(error);
    }
}








}

module.exports = new TurnosController()