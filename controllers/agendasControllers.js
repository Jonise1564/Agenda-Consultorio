const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');
const Agenda = require('../models/agendasModels');

const { validatePartialAgendas } = require('../schemas/validationAgenda');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const { obtenerHoraFormateada } = require('../utils/timeFormatter');

// --- Helpers Internos ---
function parseDateOnly(value) {
    if (!value) return null;
    if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    if (typeof value === 'string') {
        const [y, m, d] = value.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return null;
}

function todayDateOnly() {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

class AgendasController {

    // LISTAR TODAS LAS AGENDAS
    async get(req, res, next) {
        try {
            const [agendas, especialidades, medicos] = await Promise.all([
                Agenda.getAll(),
                Especialidad.getAll(),
                Medico.listar()
            ]);

            const agendasFormateadas = agendas.map(a => ({
                ...a,
                fecha_creacion: a.fecha_creacion ? obtenerFechaFormateada(parseDateOnly(a.fecha_creacion)) : null,
                fecha_fin: a.fecha_fin ? obtenerFechaFormateada(parseDateOnly(a.fecha_fin)) : null,
                hora_inicio: a.hora_inicio ? obtenerHoraFormateada(a.hora_inicio) : null,
                hora_fin: a.hora_fin ? obtenerHoraFormateada(a.hora_fin) : null
            }));

            const { nombreStore, nombreUpdate, error: errorQuery } = req.query;
            let mensaje = null;
            if (nombreStore) mensaje = 'Agenda creada correctamente';
            if (nombreUpdate) mensaje = 'Agenda actualizada correctamente';

            res.render('agendas/inicio', {
                agendas: agendasFormateadas,
                especialidades,
                medicos,
                mensaje,
                error: errorQuery === 'no_encontrada' ? 'La agenda solicitada no existe' : null
            });
        } catch (error) {
            next(error);
        }
    }

    // FORMULARIO CREAR
    async create(req, res, next) {
        try {
            const medicos = await Medico.getProfesionalesParaAgendas();
            res.render('agendas/crear', { 
                medicos, 
                error: null, 
                old: {}, 
                erroresCampos: {} 
            });
        } catch (error) {
            next(error);
        }
    }

    // GUARDAR NUEVA AGENDA
    async store(req, res, next) {
        try {
            const body = req.body;
            const erroresCampos = {};

            // Normalizar días
            let diasSeleccionados = body.dias || [];
            if (!Array.isArray(diasSeleccionados)) diasSeleccionados = [diasSeleccionados];
            body.dias = diasSeleccionados.map(d => d.toString());

            // Validaciones manuales de fechas y horas
            const fechaCreacion = parseDateOnly(body.fecha_creacion);
            const fechaFin = parseDateOnly(body.fecha_fin);
            const today = todayDateOnly();

            if (!fechaCreacion || fechaCreacion < today) erroresCampos.fecha_creacion = true;
            if (!fechaFin) erroresCampos.fecha_fin = true;
            if (fechaCreacion && fechaFin && fechaCreacion > fechaFin) {
                erroresCampos.fecha_creacion = true;
                erroresCampos.fecha_fin = true;
            }

            if (!body.hora_inicio) erroresCampos.hora_inicio = true;
            if (!body.hora_fin) erroresCampos.hora_fin = true;
            if (body.hora_inicio && body.hora_fin && body.hora_inicio >= body.hora_fin) {
                erroresCampos.hora_inicio = true;
                erroresCampos.hora_fin = true;
            }

            // Validar selects y otros campos
            ['id_medico', 'id_especialidad', 'id_sucursal', 'id_clasificacion'].forEach(campo => {
                if (!body[campo]) erroresCampos[campo] = true;
            });

            if (body.dias.length === 0) erroresCampos.dias = true;

            if (Object.keys(erroresCampos).length > 0) {
                const medicos = await Medico.getProfesionalesParaAgendas();
                return res.render('agendas/crear', {
                    old: body,
                    erroresCampos,
                    error: 'Debe completar los campos obligatorios correctamente',
                    medicos
                });
            }

            // Solapamiento
            const haySolapamiento = await Agenda.existeSolapamiento({ ...body });
            if (haySolapamiento) {
                const medicos = await Medico.getProfesionalesParaAgendas();
                return res.render('agendas/crear', {
                    old: body,
                    erroresCampos: { id_medico: true, id_especialidad: true },
                    error: 'La agenda se superpone con otra existente para este médico',
                    medicos
                });
            }

            await Agenda.create(body);
            res.redirect('/agendas?nombreStore=true');

        } catch (error) {
            next(error);
        }
    }

    // FORMULARIO EDITAR
    async edit(req, res, next) {
        try {
            const agenda = await Agenda.getAgendaById(req.params.id);
            if (!agenda) return res.redirect('/agendas?error=no_encontrada');

            const [medicos, especialidades] = await Promise.all([
                Medico.getProfesionalesParaAgendas(),
                Especialidad.getActivasPorMedico(agenda.id_medico)
            ]);

            const medicoActual = await Medico.obtenerPorId(agenda.id_medico);
            if (medicoActual && !medicos.find(m => m.id_medico === medicoActual.id_medico)) {
                medicos.push(medicoActual);
            }

            res.render('agendas/editar', {
                agenda,
                medicos,
                especialidades,
                error: null,
                erroresCampos: {}
            });
        } catch (error) {
            next(error);
        }
    }

    // ACTUALIZAR AGENDA
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const body = req.body;
            const agendaActual = await Agenda.getAgendaById(id);
            if (!agendaActual) return res.redirect('/agendas?error=no_encontrada');

            const erroresCampos = {};

            // 1. Normalizar Días
            let diasSeleccionados = body.dias || [];
            if (!Array.isArray(diasSeleccionados)) diasSeleccionados = [diasSeleccionados];
            body.dias = diasSeleccionados.map(d => d.toString());

            // 2. Validación con Schema
            const result = validatePartialAgendas({
                ...body,
                fecha_creacion: parseDateOnly(body.fecha_creacion),
                fecha_fin: parseDateOnly(body.fecha_fin)
            });

            if (!result.success) {
                result.error.errors.forEach(e => { erroresCampos[e.path[0]] = true; });
            }

            // 3. Validaciones adicionales
            ['id_medico', 'id_especialidad', 'id_sucursal', 'id_clasificacion'].forEach(campo => {
                if (!body[campo]) erroresCampos[campo] = true;
            });
            if (body.dias.length === 0) erroresCampos.dias = true;

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

            // 4. Re-render si hay errores
            if (Object.keys(erroresCampos).length > 0) {
                const [medicos, especialidades] = await Promise.all([
                    Medico.getProfesionalesParaAgendas(),
                    Especialidad.getActivasPorMedico(body.id_medico || agendaActual.id_medico)
                ]);
                return res.render('agendas/editar', {
                    agenda: { ...agendaActual, ...body, diasIds: body.dias },
                    medicos,
                    especialidades,
                    erroresCampos,
                    error: 'Revise los campos marcados'
                });
            }

            // 5. Verificar solapamiento
            const haySolapamiento = await Agenda.existeSolapamientoUpdate({
                id_agenda: id,
                ...body
            });

            if (haySolapamiento) {
                const [medicos, especialidades] = await Promise.all([
                    Medico.getProfesionalesParaAgendas(),
                    Especialidad.getActivasPorMedico(body.id_medico)
                ]);
                return res.render('agendas/editar', {
                    agenda: { ...agendaActual, ...body, diasIds: body.dias },
                    medicos,
                    especialidades,
                    erroresCampos: { id_medico: true, id_especialidad: true },
                    error: 'La agenda se superpone con otra existente'
                });
            }

            // 6. Persistir cambios
            await Agenda.updateAgenda(id, {
                fecha_creacion: body.fecha_creacion,
                fecha_fin: body.fecha_fin,
                hora_inicio: body.hora_inicio,
                hora_fin: body.hora_fin,
                duracion_turnos: body.duracion_turnos,
                limite_sobreturnos: body.limite_sobreturnos,
                id_medico: body.id_medico,
                id_especialidad: body.id_especialidad,
                id_sucursal: body.id_sucursal,
                id_clasificacion: body.id_clasificacion
            }, body.dias);

            res.redirect('/agendas?nombreUpdate=true');
        } catch (error) {
            next(error);
        }
    }

    // ELIMINAR AGENDA
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