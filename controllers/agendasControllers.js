

const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');
const Agenda = require('../models/agendasModels');

const { validateAgendas, validatePartialAgendas } = require('../schemas/validationAgenda');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const { obtenerHoraFormateada } = require('../utils/timeFormatter');

// =========================================================
// Helpers seguros para fechas (sin UTC)
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
        try {
            const agendas = await Agenda.getAll();
            const especialidades = await Especialidad.getAll();
            const medicos = await Medico.listar();

            const agendasFormateadas = agendas.map(a => ({
                ...a,
                fecha_creacion: a.fecha_creacion ? obtenerFechaFormateada(new Date(a.fecha_creacion)) : null,
                fecha_fin: a.fecha_fin ? obtenerFechaFormateada(new Date(a.fecha_fin)) : null,
                hora_inicio: a.hora_inicio ? obtenerHoraFormateada(a.hora_inicio) : null,
                hora_fin: a.hora_fin ? obtenerHoraFormateada(a.hora_fin) : null
            }));

            const { nombreStore, nombreUpdate } = req.query;
            let mensaje = null;
            //Mensaje de accion completada correctamente
            if (nombreStore) mensaje = 'Agenda creada correctamente';
            if (nombreUpdate) mensaje = 'Agenda actualizada correctamente';

            res.render('agendas/inicio', {
                agendas: agendasFormateadas,
                especialidades,
                medicos,
                mensaje
            });

        } catch (error) {
            next(error);
        }
    }

    // =========================================================
    // CREATE VIEW
    // =========================================================
    async create(req, res, next) {
        try {
            const medicos = await Medico.getProfesionalesParaAgendas();

            res.render('agendas/crear', {
                medicos,
                error: null,
                old: {}
            });

        } catch (error) {
            next(error);
        }
    }



    async store(req, res, next) {
        try {
            const body = req.body;
            const erroresCampos = {};

            // ========================
            // VALIDACIÓN DE FECHAS
            // ========================
            const fechaCreacion = body.fecha_creacion ? new Date(body.fecha_creacion) : null;
            const fechaFin = body.fecha_fin ? new Date(body.fecha_fin) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0); // solo fecha

            if (!fechaCreacion) erroresCampos.fecha_creacion = true;
            else if (fechaCreacion >= today) erroresCampos.fecha_creacion = true;

            if (!fechaFin) erroresCampos.fecha_fin = true;

            if (fechaCreacion && fechaFin && fechaCreacion > fechaFin) {
                erroresCampos.fecha_creacion = true;
                erroresCampos.fecha_fin = true;
            }

            // ========================
            // VALIDACIÓN DE HORARIOS
            // ========================
            if (!body.hora_inicio) erroresCampos.hora_inicio = true;
            if (!body.hora_fin) erroresCampos.hora_fin = true;
            if (body.hora_inicio && body.hora_fin && body.hora_inicio >= body.hora_fin) {
                erroresCampos.hora_inicio = true;
                erroresCampos.hora_fin = true;
            }

            // ========================
            // VALIDACIÓN DE TURNOS Y SOBRETURNOS
            // ========================
            if (!body.duracion_turnos || isNaN(body.duracion_turnos) || body.duracion_turnos < 5 || body.duracion_turnos > 120) {
                erroresCampos.duracion_turnos = true;
            }
            if (body.limite_sobreturnos == null || isNaN(body.limite_sobreturnos) || body.limite_sobreturnos < 0) {
                erroresCampos.limite_sobreturnos = true;
            }

            // ========================
            // VALIDACIÓN DE SELECTS
            // ========================
            if (!body.id_medico) erroresCampos.id_medico = true;
            if (!body.id_especialidad) erroresCampos.id_especialidad = true;
            if (!body.id_sucursal) erroresCampos.id_sucursal = true;
            if (!body.id_clasificacion) erroresCampos.id_clasificacion = true;

            // Si hay errores, retornar todos juntos
            if (Object.keys(erroresCampos).length > 0) {
                return res.render('agendas/crear', { old: body, erroresCampos, error: 'Debe completar los campos obligatorios' });
            }

            // ========================
            // VALIDACIÓN DE SOLAPAMIENTO
            // ========================
            const haySolapamiento = await Agenda.existeSolapamiento({
                fecha_creacion: fechaCreacion.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0],
                hora_inicio: body.hora_inicio,
                hora_fin: body.hora_fin,
                id_medico: body.id_medico,
                id_especialidad: body.id_especialidad
            });

            if (haySolapamiento) {
                erroresCampos.id_medico = true;
                erroresCampos.id_especialidad = true;
                return res.render('agendas/crear', { old: body, erroresCampos, error: 'La agenda se superpone con otra existente' });
            }

            // ========================
            // GUARDAR AGENDA
            // ========================
            await Agenda.create({
                fecha_creacion: fechaCreacion.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0],
                hora_inicio: body.hora_inicio,
                hora_fin: body.hora_fin,
                duracion_turnos: body.duracion_turnos,
                limite_sobreturnos: body.limite_sobreturnos,
                id_medico: body.id_medico,
                id_especialidad: body.id_especialidad,
                id_sucursal: body.id_sucursal,
                id_clasificacion: body.id_clasificacion
            });

            res.redirect('/agendas?nombreStore=true');

        } catch (error) {
            next(error);
        }
    }




    async edit(req, res, next) {
        try {
            // Obtener agenda
            const agenda = await Agenda.getAgendaById(req.params.id);

            // Obtener todos los médicos disponibles
            let medicos = await Medico.getProfesionalesParaAgendas();

            // Traer el médico asignado a la agenda (por si no está en la lista)
            const medicoActual = await Medico.obtenerPorId(agenda.id_medico);

            // Si el médico actual no está en la lista, agregarlo
            if (!medicos.find(m => m.id_medico === medicoActual.id_medico)) {
                medicos.push(medicoActual);
            }

            // Obtener especialidades del médico actual
            const especialidades = await Especialidad.getActivasPorMedico(agenda.id_medico);

            res.render('agendas/editar', {
                agenda,
                medicos,
                especialidades,
                error: null
            });
        } catch (error) {
            next(error);
        }
    }


    
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const body = req.body;

            const agendaActual = await Agenda.getAgendaById(id);

            const erroresCampos = {};

            // ==========================
            // 1VALIDACIÓN DE ESQUEMA
            // ==========================
            const result = validatePartialAgendas({
                fecha_creacion: parseDateOnly(body.fecha_creacion),
                fecha_fin: parseDateOnly(body.fecha_fin),
                hora_inicio: body.hora_inicio,
                hora_fin: body.hora_fin,
                limite_sobreturnos: body.limite_sobreturnos,
                duracion_turnos: body.duracion_turnos
            });

            if (!result.success) {
                result.error.errors.forEach(e => {
                    erroresCampos[e.path[0]] = true;
                });
            }

            // ==========================
            // CAMPOS SELECT OBLIGATORIOS
            // ==========================
            ['id_medico', 'id_especialidad', 'id_sucursal', 'id_clasificacion']
                .forEach(campo => {
                    if (!body[campo]) erroresCampos[campo] = true;
                });

            // ==========================
            // REGLAS DE NEGOCIO 
            // ==========================
            if (result.success) {
                const data = result.data;

                if (data.fecha_creacion > data.fecha_fin) {
                    erroresCampos.fecha_creacion = true;
                    erroresCampos.fecha_fin = true;
                }

                if (data.hora_inicio >= data.hora_fin) {
                    erroresCampos.hora_inicio = true;
                    erroresCampos.hora_fin = true;
                }
            }

            // ==========================
            // SI HAY ERRORES, VOLVER
            // ==========================
            if (Object.keys(erroresCampos).length > 0) {
                const medicos = await Medico.getProfesionalesParaAgendas();
                const especialidades = body.id_medico
                    ? await Especialidad.getActivasPorMedico(body.id_medico)
                    : await Especialidad.getActivasPorMedico(agendaActual.id_medico);

                return res.render('agendas/editar', {
                    agenda: { ...agendaActual, ...body },
                    medicos,
                    especialidades,
                    erroresCampos,
                    error: 'Revise los campos marcados'
                });
            }

            // ==========================
            // VALIDAR SOLAPAMIENTO
            // ==========================
            const data = result.data;

            const haySolapamiento = await Agenda.existeSolapamientoUpdate({
                id_agenda: id,
                fecha_creacion: data.fecha_creacion.toISOString().split('T')[0],
                fecha_fin: data.fecha_fin.toISOString().split('T')[0],
                hora_inicio: data.hora_inicio,
                hora_fin: data.hora_fin,
                id_medico: body.id_medico,
                id_especialidad: body.id_especialidad
            });

            if (haySolapamiento) {
                const medicos = await Medico.getProfesionalesParaAgendas();
                const especialidades = await Especialidad.getActivasPorMedico(body.id_medico);

                return res.render('agendas/editar', {
                    agenda: { ...agendaActual, ...body },
                    medicos,
                    especialidades,
                    erroresCampos: {
                        id_medico: true,
                        id_especialidad: true
                    },
                    error: 'La agenda se superpone con otra existente'
                });
            }

            // ==========================
            // UPDATE REAL
            // ==========================
            await Agenda.updateAgenda(id, {
                fecha_creacion: data.fecha_creacion.toISOString().split('T')[0],
                fecha_fin: data.fecha_fin.toISOString().split('T')[0],
                hora_inicio: data.hora_inicio,
                hora_fin: data.hora_fin,
                limite_sobreturnos: data.limite_sobreturnos,
                duracion_turnos: data.duracion_turnos,
                id_medico: body.id_medico,
                id_especialidad: body.id_especialidad,
                id_sucursal: body.id_sucursal,
                id_clasificacion: body.id_clasificacion
            });

            res.redirect('/agendas?nombreUpdate=true');

        } catch (error) {
            next(error);
        }
    }



    // =========================================================
    // DELETE
    // =========================================================
    async eliminarAgenda(req, res, next) {
        try {
            await Agenda.eliminar(req.params.id);
            res.redirect('/agendas');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AgendasController();
