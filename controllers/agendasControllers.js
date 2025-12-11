const Medico = require('../models/medicosModels');
// const Persona = require('../models/personasModels');
// const Usuario = require('../models/usuariosModels');
const Especialidad = require('../models/especialidadesModels');
const Agenda = require('../models/agendasModels');

const { validateAgendas, validatePartialAgendas } = require('../schemas/validationAgenda');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const { obtenerHoraFormateada } = require('../utils/timeFormatter');

// =========================================================
// Helpers seguros para fechas sin errores de zona horaria
// =========================================================
function parseDateOnly(str) {
    const [y, m, d] = str.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
}

function todayDateOnly() {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

class AgendasController {

    // =========================================================
    // GET ALL
    // =========================================================
    async get(req, res, next) {
        console.log('Controller: Get All agendas');
        try {
            const especialidades = await Especialidad.getAll();
            const medicos = await Medico.listar();
            const agendas = await Agenda.getAll();

            const agendaFormateada = agendas.map(agenda => {
                const fechaCreacionFormateada = agenda.fecha_creacion
                    ? obtenerFechaFormateada(new Date(agenda.fecha_creacion))
                    : null;

                const fechaFinFormateada = agenda.fecha_fin
                    ? obtenerFechaFormateada(new Date(agenda.fecha_fin))
                    : null;

                const horaInicio = agenda.hora_inicio
                    ? obtenerHoraFormateada(agenda.hora_inicio)
                    : null;

                const horaFin = agenda.hora_fin
                    ? obtenerHoraFormateada(agenda.hora_fin)
                    : null;

                return {
                    ...agenda,
                    fecha_creacion: fechaCreacionFormateada,
                    fecha_fin: fechaFinFormateada,
                    hora_inicio: horaInicio,
                    hora_fin: horaFin
                };
            });

            const { nombreUpdate, nombreStore, nombreInactivo, nombreActivo } = req.query;
            let mensaje = null;

            if (nombreInactivo) mensaje = 'Se ha dado de Baja a una agenda';
            else if (nombreActivo) mensaje = 'Se ha dado de Alta a una agenda';
            else if (nombreUpdate) mensaje = 'Agenda Actualizada correctamente';
            else if (nombreStore) mensaje = 'Agenda Creada correctamente';

            res.render('agendas/inicio', {
                agendas: agendaFormateada,
                mensaje,
                especialidades,
                medicos
            });
        } catch (error) {
            console.error('Error al obtener agendas desde el controlador:', error);
            next(error);
        }
    }

    // =========================================================
    // CREATE VIEW
    // =========================================================
    async create(req, res, next) {
        try {
            console.log('Controller: Create agenda');
            const matriculas =
                (typeof Medico.getProfesionalesParaAgendas === 'function')
                    ? await Medico.getProfesionalesParaAgendas()
                    : await Medico.getAllMatriculas();

            if (!matriculas) {
                console.log('Controller agenda: matriculas no encontradas');
                return res.status(404).send('Matrícula no encontrada');
            }

            res.render('agendas/crear', { matriculas });
        } catch (error) {
            console.error('Error en create agenda:', error);
            next(error);
        }
    }

    // =========================================================
    // STORE AGENDA (CREAR)
    // =========================================================
    async store(req, res, next) {
        console.log('Controller: Create agenda (store)');

        try {
            const body = req.body || {};

            // Normalizo nombres alternativos
            const fecha_creacion_raw = body.fecha_creacion || body.fc;
            const fecha_fin_raw = body.fecha_fin || body.ff;
            const hora_inicio = body.hora_inicio || body.hi;
            const hora_fin = body.hora_fin || body.hf;
            const limite_sobreturnos = body.limite_sobreturnos || body.ls;
            const duracion_turnos = body.duracion_turnos || body.dt;
            const matricula_raw = body.nromatricula || body.matricula || body["nroMatricula"];
            const id_sucursal_raw = body.id_sucursal || body.sucursal;
            const id_clasificacion_raw = body.id_clasificacion || body.clasificacion;

            // Validación básica de presencia
            if (!fecha_creacion_raw || !fecha_fin_raw || !hora_inicio || !hora_fin ||
                limite_sobreturnos == null || duracion_turnos == null || !matricula_raw ||
                !id_sucursal_raw || !id_clasificacion_raw) {

                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }

            // Fechas seguras sin UTC
            const fechaCreacion = parseDateOnly(fecha_creacion_raw);
            const fechaFin = parseDateOnly(fecha_fin_raw);
            const today = todayDateOnly();

            // Validación correcta: permitir HOY → bloquear solo si es ANTES
            if (fechaCreacion < today) {
                return res.status(400).json({
                    message: 'La fecha de creación no puede ser menor a la fecha actual'
                });
            }

            if (fechaCreacion > fechaFin) {
                return res.status(400).json({
                    message: 'La fecha de creación debe ser anterior o igual a la fecha fin'
                });
            }

           

            // Validación con Zod
const result = validateAgendas({
    fecha_creacion: fechaCreacion,
    fecha_fin: fechaFin,
    hora_inicio,
    hora_fin,
    limite_sobreturnos: Number(limite_sobreturnos),
    duracion_turnos: Number(duracion_turnos),
    nromatricula: String(matricula_raw),
    id_sucursal: Number(id_sucursal_raw),
    id_clasificacion: Number(id_clasificacion_raw)
});

if (!result.success) {
    console.error(" Error de validación:", result.error?.errors ?? result.error);

    return res.status(422).json({
        error: result.error.errors.map(err => ({
            campo: err.path.join("."),
            mensaje: err.message
        }))
    });
}

const data = result.data;

// Crear agenda
const agendaCreada = await Agenda.create({
    fecha_creacion: data.fecha_creacion.toISOString().split("T")[0],
    fecha_fin: data.fecha_fin.toISOString().split("T")[0],
    hora_inicio: data.hora_inicio,
    hora_fin: data.hora_fin,
    limite_sobreturnos: Number(data.limite_sobreturnos),
    duracion_turnos: Number(data.duracion_turnos),
    matricula: Number(data.nromatricula),
    id_sucursal: Number(data.id_sucursal),
    id_clasificacion: Number(data.id_clasificacion)
});


            if (!agendaCreada) {
                return res.status(400).json({ message: 'Error al crear la agenda' });
            }

            console.log('Controller: agenda insertada con éxito');
            return res.redirect(`/agendas?nombreStore=true`);

        } catch (error) {
            console.error('Error al crear agenda desde el controlador:', error);
            next(error);
        }
    }

    // =========================================================
    // EDIT VIEW
    // =========================================================
    async edit(req, res, next) {
        try {
            const { id } = req.params;
            console.log(`Controller: edit, agenda id: ${id}`);

            const [agendaData] = await Agenda.getAgendaById(id);
            if (!agendaData) return res.status(404).json({ message: "Agenda no encontrada" });

            const matriculas =
                (typeof Medico.getProfesionalesParaAgendas === "function")
                    ? await Medico.getProfesionalesParaAgendas()
                    : await Medico.getAllMatriculas();

            if (!matriculas) return res.status(404).send("Matrícula no encontrada");

            res.render("agendas/editar", { agenda: agendaData, matriculas });

        } catch (error) {
            console.error("Error en edit agenda:", error);
            next(error);
        }
    }

    // =========================================================
    // UPDATE
    // =========================================================
    async update(req, res, next) {
        console.log("Controller: Update Agenda");
        try {
            const { id } = req.params;
            const {
                fecha_creacion: fc,
                fecha_fin: ff,
                hora_inicio: hi,
                hora_fin: hf,
                limite_sobreturnos: ls,
                duracion_turnos: dt,
                matricula: nro,
                id_sucursal,
                id_clasificacion
            } = req.body;

            const fechaCreacion = parseDateOnly(fc);
            const fechaFin = parseDateOnly(ff);
            const today = todayDateOnly();

            if (fechaCreacion < today)
                return res.status(400).json({ message: "La fecha de creación no puede ser menor a hoy" });

            if (fechaCreacion > fechaFin)
                return res.status(400).json({ message: "La fecha de creación no puede ser mayor a la fecha fin" });

            const result = validatePartialAgendas({
                fecha_creacion: fechaCreacion,
                fecha_fin: fechaFin,
                hora_inicio: hi,
                hora_fin: hf,
                limite_sobreturnos: ls,
                duracion_turnos: dt,
                nromatricula: nro,
                id_sucursal,
                id_clasificacion
            });

            if (!result.success) {
                console.dir(result.error, { depth: null, colors: true });
                return res.status(400).json({ error: result.error });
            }

            const data = result.data;

            const updateData = {
                fecha_creacion: data.fecha_creacion.toISOString().split("T")[0],
                fecha_fin: data.fecha_fin.toISOString().split("T")[0],
                hora_inicio: data.hora_inicio,
                hora_fin: data.hora_fin,
                limite_sobreturnos: data.limite_sobreturnos,
                duracion_turnos: data.duracion_turnos,
                matricula: data.nromatricula,
                id_sucursal: data.id_sucursal,
                id_clasificacion: data.id_clasificacion
            };

            const updatedAgenda = await Agenda.updateAgenda(id, updateData);

            if (!updatedAgenda)
                return res.status(400).json({ message: "Error al modificar la agenda" });

            res.redirect(`/agendas?nombreUpdate=true`);

        } catch (error) {
            console.error("Error update Agenda:", error);
            next(error);
        }
    }

    // =========================================================
    // DELETE
    // =========================================================
    async eliminarAgenda(req, res, next) {
        console.log("Controller: Eliminar agenda");
        try {
            const { id } = req.params;
            const resultado = await Agenda.eliminar(id);

            if (!resultado)
                return res.status(500).json({ message: "Error al eliminar la agenda" });

            res.status(200).json({ message: "Agenda eliminada exitosamente" });

        } catch (error) {
            console.error("Error al eliminar agenda desde el controlador:", error);
            next(error);
        }
    }
}

module.exports = new AgendasController();

