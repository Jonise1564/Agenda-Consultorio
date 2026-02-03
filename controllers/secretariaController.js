const Agenda = require('../models/agendasModels');
const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');
const EmailService = require('../services/emailService');

class SecretariaController {

    // Panel Principal de Secretaría
    async index(req, res, next) {
        try {
            const especialidades = await Especialidad.getAll();
            const medicos = await Medico.listar();
            res.render('secretaria/index', {
                especialidades,
                medicos,
                status: req.query.status || null
            });
        } catch (error) { next(error); }
    }

    // Vista de Ausencias
    async verAusencias(req, res, next) {
        try {
            const ausencias = await Agenda.listarAusencias();
            const medicos = await Medico.listar();
            res.render('secretaria/lista_ausencias', { ausencias, medicos });
        } catch (error) { next(error); }
    }

    // Consulta de slots horarios (RETORNA JSON)
    async disponibilidad(req, res, next) {
        try {
            const { id_medico, id_especialidad, fecha } = req.query;

            if (!id_medico || !id_especialidad || !fecha) {
                return res.status(400).json({ error: 'Faltan datos para la consulta' });
            }

            const feriadoDesc = await Agenda.esFeriado(fecha);
            if (feriadoDesc) return res.json({ status: 'feriado', motivo: feriadoDesc });

            const ausencia = await Agenda.obtenerAusencia(id_medico, fecha);
            if (ausencia) {
                return res.json({
                    status: 'ausencia',
                    tipo: ausencia.tipo,
                    descripcion: ausencia.descripcion
                });
            }

            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);
            if (!agendas || agendas.length === 0) return res.json({ status: 'sin_agenda' });

            const agenda = agendas[0];
            const ocupados = await Turno.obtenerHorariosOcupados(agenda.id, fecha);

            let horarios = [];
            let [h, m] = agenda.hora_inicio.split(':');
            let actual = new Date(2000, 0, 1, h, m);
            let [hFin, mFin] = agenda.hora_fin.split(':');
            let fin = new Date(2000, 0, 1, hFin, mFin);

            while (actual < fin) {
                const horaStr = actual.toTimeString().slice(0, 5);
                horarios.push({
                    hora: horaStr,
                    ocupado: ocupados.includes(horaStr),
                    id_agenda: agenda.id
                });
                actual.setMinutes(actual.getMinutes() + agenda.duracion_turnos);
            }

            return res.json({ status: 'success', horarios });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al cargar disponibilidad' });
        }
    }

    // Listado de Turnos
       async verListaTurnos(req, res, next) {
        try {
            let { paciente, profesional, fecha, status } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // --- LIMPIEZA DE FILTROS (Anti-"null") ---
            // Esto asegura que si en la URL dice ?paciente=null, lo tratemos como vacío ""
            const limpiar = (val) => (val === 'null' || !val) ? "" : val;

            const filtros = {
                paciente: limpiar(paciente),
                profesional: limpiar(profesional),
                fecha: limpiar(fecha)
            };

            // Para la DB, si están vacíos, mandamos null, si no, el valor limpio
            const filtrosDB = {
                paciente: filtros.paciente || null,
                profesional: filtros.profesional || null,
                fecha: filtros.fecha || null
            };

            const turnos = await Turno.listarPaginado(filtrosDB, limit, offset);
            const totalTurnos = await Turno.contarTurnos(filtrosDB);
            const totalPages = Math.ceil(totalTurnos / limit);

            const turnosConEstado = await Promise.all(turnos.map(async (t) => {
                let medicoAusente = false;
                let motivoAusencia = null;
                try {
                    if (t.id_medico && t.fecha) {
                        // Validamos que t.fecha sea válida antes de convertirla
                        const fechaObj = new Date(t.fecha);
                        if (!isNaN(fechaObj)) {
                            const fechaSql = fechaObj.toISOString().split('T')[0];
                            const ausencia = await Agenda.obtenerAusencia(t.id_medico, fechaSql);
                            if (ausencia) {
                                medicoAusente = true;
                                motivoAusencia = ausencia.tipo;
                            }
                        }
                    }
                } catch (err) { console.error("Error al verificar ausencia:", err); }
                return { ...t, medicoAusente, motivoAusencia };
            }));

            const medicos = await Medico.listar();
            const especialidades = await Especialidad.getAll();

            // Enviamos 'filtros' (que ya están limpios de la palabra "null") a la vista
            res.render('secretaria/lista_turnos', {
                turnos: turnosConEstado,
                medicos,
                especialidades,
                status: status || null,
                currentPage: page,
                totalPages,
                totalTurnos,
                limit,
                filtros // <--- Aquí ya van sin el texto "null"
            });
        } catch (error) {
            console.error("Error en verListaTurnos:", error);
            next(error);
        }
    }




    // Proceso de agendar con Lógica de Sobreturnos
    async agendar(req, res, next) {
        try {
            const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
            const archivo_dni = req.file ? req.file.filename : null;

            if (!id_paciente || !fecha || !hora_inicio || !id_agenda) return res.status(400).send("Faltan datos.");

            const detallesAgenda = await Agenda.getAgendaById(id_agenda);
            if (!detallesAgenda) return res.status(404).send("Agenda no existe.");

            const yaTieneTurno = await Turno.verificarTurnoExistente(id_paciente, fecha, hora_inicio);
            if (yaTieneTurno) return res.status(400).send("El paciente ya tiene turno.");

            const horariosOcupados = await Turno.obtenerHorariosOcupados(id_agenda, fecha);
            const cantidadActual = horariosOcupados.filter(h => h === hora_inicio).length;
            const esSobretorno = cantidadActual > 0;

            if (esSobretorno && cantidadActual > (detallesAgenda.limite_sobreturnos || 0)) {
                return res.status(400).send("Cupo de sobreturnos agotado.");
            }

            await Turno.agendarTurnoVirtual({
                fecha, hora_inicio, id_agenda, id_paciente,
                motivo: motivo || (esSobretorno ? 'SOBRETURNO' : 'Turno solicitado en secretaría'),
                archivo_dni, es_sobreturno: esSobretorno
            });

            // Llamada a la notificación corregida
            this.enviarNotificacionSilenciosa(id_paciente, fecha, hora_inicio, detallesAgenda, motivo, esSobretorno);
            res.redirect('/secretaria?status=success');

        } catch (error) { next(error); }
    }

    // NOTIFICACIÓN CORREGIDA (Evita el "General")
    async enviarNotificacionSilenciosa(id_paciente, fecha, hora, detalles, motivo, esSobre) {
        try {
            const datosPaciente = await Paciente.getById(id_paciente);
            if (datosPaciente?.email) {
                // FALLBACK: Si detalles no tiene especialidad_nombre, lo buscamos por ID
                let nombreEsp = detalles.especialidad_nombre || detalles.especialidad;
                if (!nombreEsp && detalles.id_especialidad) {
                    const espData = await Especialidad.getById(detalles.id_especialidad);
                    nombreEsp = espData?.nombre;
                }

                await EmailService.enviarConfirmacion(datosPaciente.email, {
                    nombre: datosPaciente.nombre,
                    fecha,
                    hora,
                    motivo: motivo || (esSobre ? 'Sobreturno' : 'Consulta médica'),
                    medico: `Dr/a. ${detalles.apellido_medico || detalles.medico || 'Designado'}`,
                    especialidad: nombreEsp || 'Consulta Médica'
                });
            }
        } catch (e) { console.error("Error envío mail:", e.message); }
    }

    // ASIGNAR DESDE LISTA DE ESPERA CORREGIDO
    async asignarDesdeListaEspera(req, res, next) {
        try {
            const { id_paciente, id_medico, fecha, hora, id_espera } = req.query;

            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, null, fecha);
            if (!agendas || agendas.length === 0) return res.redirect('/secretaria/lista-espera?status=error_no_agenda');
            const agendaDestino = agendas[0];

            await Turno.agendarTurnoVirtual({
                fecha, hora_inicio: hora, id_agenda: agendaDestino.id,
                id_paciente, motivo: 'Asignado desde Lista de Espera', archivo_dni: null
            });

            // Lógica de Mail con búsqueda de respaldo para especialidad
            try {
                const datosPaciente = await Paciente.getById(id_paciente);
                if (datosPaciente?.email) {
                    let nombreEsp = agendaDestino.especialidad_nombre || agendaDestino.especialidad;

                    // Si sigue siendo nulo, buscamos el nombre real de la especialidad
                    if (!nombreEsp && agendaDestino.id_especialidad) {
                        const espData = await Especialidad.getById(agendaDestino.id_especialidad);
                        nombreEsp = espData?.nombre;
                    }

                    await EmailService.enviarConfirmacion(datosPaciente.email, {
                        nombre: datosPaciente.nombre,
                        fecha,
                        hora,
                        medico: `Dr/a. ${agendaDestino.apellido_medico || agendaDestino.medico || 'Designado'}`,
                        especialidad: nombreEsp || 'Consulta Médica',
                        motivo: 'Asignación por disponibilidad en lista de espera'
                    });
                }
            } catch (mailErr) { console.error("Falló mail:", mailErr.message); }

            res.redirect('/secretaria/turnos?status=asignacion_exitosa');
        } catch (error) { next(error); }
    }

    // Métodos de apoyo (Se mantienen igual)
    async buscarPacientePorDNI(req, res, next) {
        try { const r = await Paciente.buscar(req.query.q); res.json(r); } catch (e) { res.json([]); }
    }

    async buscarMedicos(req, res, next) {
        try { const r = await Medico.buscar(req.query.q); res.json(r); } catch (e) { res.json([]); }
    }

    async registrarAusencia(req, res, next) {
        try {
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;
            if (new Date(fecha_fin) < new Date(fecha_inicio)) return res.status(400).send("Fecha fin errónea.");
            await Agenda.registrarAusencia({ id_medico, fecha_inicio, fecha_fin, tipo, descripcion: descripcion || '' });
            res.redirect('/secretaria/ausencias?status=success');
        } catch (e) { next(e); }
    }

    async eliminarAusencia(req, res, next) {
        try { await Agenda.eliminarAusencia(req.params.id); res.redirect('/secretaria/ausencias?status=deleted'); } catch (e) { next(e); }
    }

    async actualizarAusencia(req, res, next) {
        try {
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;
            await Agenda.actualizarAusencia(req.params.id, { id_medico, fecha_inicio, fecha_fin, tipo, descripcion: descripcion || '' });
            res.redirect('/secretaria/ausencias?status=success');
        } catch (e) { next(e); }
    }

    async trasladarTurnoIndividual(req, res) {
        try {
            const { id_turno, id_medico_destino, nueva_fecha, nueva_hora } = req.body;
            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico_destino, null, nueva_fecha);
            if (!agendas || agendas.length === 0) return res.redirect('/secretaria/turnos?status=error_no_agenda');
            const agendaDestino = agendas[0];
            const ocupados = await Turno.obtenerHorariosOcupados(agendaDestino.id, nueva_fecha);
            if (ocupados.includes(nueva_hora)) return res.redirect('/secretaria/turnos?status=error_turno_ocupado');
            await Turno.actualizar(id_turno, { fecha: nueva_fecha, hora_inicio: nueva_hora, id_agenda: agendaDestino.id, id_medico: id_medico_destino, estado: 'Reservado' });
            res.redirect('/secretaria/turnos?status=traslado_success');
        } catch (e) { res.status(500).send("Error"); }
    }

    async transferirAgenda(req, res, next) {
        try {
            const { id_medico_origen, id_medico_destino, fecha, id_especialidad } = req.body;
            if (id_medico_origen === id_medico_destino) return res.redirect('/secretaria?status=error_mismo_medico');
            await Turno.transferirMasivo({ origen: id_medico_origen, destino: id_medico_destino, fecha, especialidad: id_especialidad });
            res.redirect('/secretaria?status=transfer_success');
        } catch (e) { next(e); }
    }

    async actualizarEstadoTurno(req, res, next) {
        try {
            const { id_turno, estado, observaciones } = req.body;
            await Turno.actualizar(id_turno, { estado, observaciones: observaciones || '' });
            res.redirect('/secretaria/turnos?status=edit_success');
        } catch (e) { res.redirect('/secretaria/turnos?status=error'); }
    }

    async agregarAListaEspera(req, res, next) {
        try {
            await Turno.insertarListaEspera(req.body);
            res.redirect('/secretaria/turnos?status=espera_ok');
        } catch (e) { next(e); }
    }
}

module.exports = new SecretariaController();