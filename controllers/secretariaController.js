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

    // Consulta para armar slots horarios
    async disponibilidad(req, res, next) {
        try {
            const { id_medico, id_especialidad, fecha } = req.query;

            if (!id_medico || !id_especialidad || !fecha) {
                return res.status(400).json({ error: 'Faltan datos para la consulta' });
            }

            // 1. Verificación de Feriados y Ausencias
            const feriadoDesc = await Agenda.esFeriado(fecha);
            if (feriadoDesc) return res.json({ status: 'feriado', motivo: feriadoDesc });

            const ausencia = await Agenda.obtenerAusencia(id_medico, fecha);
            if (ausencia) {
                return res.json({ status: 'ausencia', tipo: ausencia.tipo, descripcion: ausencia.descripcion });
            }

            // 2. Obtener TODAS las Agendas del médico para ese día
            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);
            if (!agendas || agendas.length === 0) return res.json({ status: 'sin_agenda' });

            let horariosFinales = [];
            let totalSobreDisponibles = 0;
            let totalSobreActuales = 0;

            // 3. Iterar sobre cada bloque de agenda (Mañana, Tarde, etc.)
            for (const agenda of agendas) {
                const ocupados = await Turno.obtenerHorariosOcupados(agenda.id, fecha);
                const sobreturnosActuales = await Turno.contarSobreturnos(agenda.id, fecha);
                const limiteMax = agenda.limite_sobreturnos || 0;

                // Datos para el resumen final
                totalSobreDisponibles += Math.max(0, limiteMax - sobreturnosActuales);
                totalSobreActuales += sobreturnosActuales;

                const hayCupoParaSobre = sobreturnosActuales < limiteMax;

                let [h, m] = agenda.hora_inicio.split(':');
                let actual = new Date(2000, 0, 1, h, m);
                let [hFin, mFin] = agenda.hora_fin.split(':');
                let fin = new Date(2000, 0, 1, hFin, mFin);

                while (actual < fin) {
                    const horaStr = actual.toTimeString().slice(0, 5);
                    const estaOcupado = ocupados.includes(horaStr);

                    horariosFinales.push({
                        hora: horaStr,
                        ocupado: estaOcupado,
                        id_agenda: agenda.id,
                        // Regla de sobreturno aplicada a ESTA agenda específica
                        permitirSobre: estaOcupado && hayCupoParaSobre
                    });

                    actual.setMinutes(actual.getMinutes() + agenda.duracion_turnos);
                }
            }

            // 4. Retornar todos los bloques unidos
            return res.json({
                status: 'success',
                horarios: horariosFinales,
                sobreturnos_actuales: totalSobreActuales,
                disponibles_sobre: totalSobreDisponibles
            });

        } catch (error) {
            console.error("Error en disponibilidad:", error);
            res.status(500).json({ error: 'Error al cargar disponibilidad' });
        }
    }


async verListaTurnos(req, res, next) {
    try {
        let {
            paciente, profesional, fecha, status,
            sucursal, especialidad,
            fecha_inicio, fecha_fin
        } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const limpiar = (val) => (val === 'null' || !val) ? "" : val;

        const filtros = {
            paciente: limpiar(paciente),
            profesional: limpiar(profesional),
            fecha: limpiar(fecha),
            fecha_inicio: limpiar(fecha_inicio),
            fecha_fin: limpiar(fecha_fin),
            sucursal: limpiar(sucursal),
            especialidad: limpiar(especialidad),
            status: limpiar(status)
        };

        const filtrosDB = {
            ...filtros,
            paciente: filtros.paciente || null,
            profesional: filtros.profesional || null,
            fecha: filtros.fecha || null,
            fecha_inicio: filtros.fecha_inicio || null,
            fecha_fin: filtros.fecha_fin || null,
            sucursal: filtros.sucursal || null,
            especialidad: filtros.especialidad || null,
            status: filtros.status || null
        };

        // 1. Obtener turnos filtrados para la tabla principal
        const turnos = await Turno.listarPaginado(filtrosDB, limit, offset);
        const totalTurnos = await Turno.contarTurnos(filtrosDB);
        const totalPages = Math.ceil(totalTurnos / limit);

        // 2. Identificar ausencias en los turnos de la vista actual (para pintar de rojo la fila)
        const turnosConEstado = await Promise.all(
            turnos.map(async (t) => {
                let medicoAusente = false;
                let motivoAusencia = null;
                if (t.id_medico && t.fecha) {
                    const fechaSql = new Date(t.fecha).toISOString().split('T')[0];
                    const ausencia = await Agenda.obtenerAusencia(t.id_medico, fechaSql);
                    if (ausencia) {
                        medicoAusente = true;
                        motivoAusencia = ausencia.tipo;
                    }
                }
                return { ...t, medicoAusente, motivoAusencia };
            })
        );

        // 3. CENTRAL DE REUBICACIÓN GLOBAL 
        // A. Obtenemos turnos de agendas dadas de baja
        const agendasInactivas = await Turno.getTurnosAgendasNoActivas();
        
        // B. Obtenemos TODOS los turnos futuros que tienen una ausencia médica cargada
        // Debes crear este método en tu modelo Turno o usar una consulta que cruce turnos con la tabla ausencias
        const afectadosPorAusencia = await Turno.getTurnosConMedicosAusentesGlobal();

        // C. Unificamos ambas listas para la solapa de reubicación
        const turnosUrgentes = [...agendasInactivas, ...afectadosPorAusencia];

        const medicos = await Medico.listar();
        const especialidades = await Especialidad.getAll();

        res.render('secretaria/lista_turnos', {
            turnos: turnosConEstado,
            turnosUrgentes, 
            medicos,
            especialidades,
            status: status || null,
            currentPage: page,
            totalPages,
            totalTurnos,
            filtros,
            currentUrl: req.originalUrl
        });

    } catch (error) {
        console.error("Error en verListaTurnos:", error);
        next(error);
    }
}

    async verificarTurnoPaciente(req, res) {
        try {
            const { id_paciente, fecha } = req.query;
            if (!id_paciente || !fecha) return res.status(400).json({ existe: false });

            // Buscamos cualquier turno del paciente en esa fecha (normal o sobreturno)
            const turno = await Turno.verificarTurnoDia(id_paciente, fecha);

            if (turno) {
                return res.json({
                    existe: true,
                    msg: `El paciente ya tiene un turno a las ${turno.hora_inicio}`
                });
            }
            res.json({ existe: false });
        } catch (error) {
            res.status(500).json({ existe: false, error: error.message });
        }
    }



    // Proceso de agendar con Lógica de Sobreturnos      
    async agendar(req, res, next) {
        try {
            const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
            const archivo_dni = req.file ? req.file.filename : null;

            if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
                return res.redirect('/secretaria?status=error_datos');
            }

            const detallesAgenda = await Agenda.getAgendaById(id_agenda);
            if (!detallesAgenda) {
                return res.redirect('/secretaria?status=error_no_agenda');
            }

            const id_medico_nuevo = detallesAgenda.id_medico;

            // A. Verificaciones de duplicados 
            const tieneTurnoConMedico = await Turno.verificarTurnoMedicoDia(id_paciente, fecha, id_medico_nuevo);
            if (tieneTurnoConMedico) return res.redirect('/secretaria?status=error_duplicado_medico');

            const tieneTurnoMismaHora = await Turno.verificarTurnoHora(id_paciente, fecha, hora_inicio);
            if (tieneTurnoMismaHora) return res.redirect('/secretaria?status=error_hora_ocupada');

            // B. Lógica de Sobreturnos (Validación de Seguridad en Backend)
            const horariosOcupados = await Turno.obtenerHorariosOcupados(id_agenda, fecha);
            const esSobretorno = horariosOcupados.includes(hora_inicio);

            if (esSobretorno) {
                const sobreturnosActuales = await Turno.contarSobreturnos(id_agenda, fecha);
                const limiteMax = detallesAgenda.limite_sobreturnos || 0;

                if (sobreturnosActuales >= limiteMax) {
                    // Bloqueo total: Se alcanzó el límite de sobreturnos para el día
                    return res.redirect('/secretaria?status=error_sobreturno_agotado');
                }
            }

            // C. Proceder con el agendamiento
            await Turno.agendarTurnoVirtual({
                fecha,
                hora_inicio,
                id_agenda,
                id_paciente,
                motivo: motivo || (esSobretorno ? 'SOBRETURNO' : 'Turno solicitado en secretaría'),
                archivo_dni,
                es_sobreturno: esSobretorno
            });

            this.enviarNotificacionSilenciosa(id_paciente, fecha, hora_inicio, detallesAgenda, motivo, esSobretorno);
            res.redirect('/secretaria?status=success');

        } catch (error) {
            console.error("Error al agendar:", error);
            res.redirect('/secretaria?status=error_server');
        }
    }

    // NOTIFICACIÓN A MAIL
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

    // Métodos de apoyo 
    async buscarPacientePorDNI(req, res, next) {
        try { const r = await Paciente.buscar(req.query.q); res.json(r); } catch (e) { res.json([]); }
    }

    async buscarMedicos(req, res, next) {
        try { const r = await Medico.buscar(req.query.q); res.json(r); } catch (e) { res.json([]); }
    }

    // async registrarAusencia(req, res, next) {
    //     try {
    //         const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;
    //         if (new Date(fecha_fin) < new Date(fecha_inicio)) return res.status(400).send("Fecha fin errónea.");
    //         await Agenda.registrarAusencia({ id_medico, fecha_inicio, fecha_fin, tipo, descripcion: descripcion || '' });
    //         res.redirect('/secretaria/ausencias?status=success');
    //     } catch (e) { next(e); }
    // }


    async registrarAusencia(req, res, next) {
        try {
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;

            if (new Date(fecha_fin) < new Date(fecha_inicio)) {
                return res.status(400).send("Fecha fin errónea.");
            }

            // 1. Registro normal
            await Agenda.registrarAusencia({
                id_medico,
                fecha_inicio,
                fecha_fin,
                tipo,
                descripcion: descripcion || ''
            });

            // 2. Redirección estratégica: 
            // Enviamos al médico y el rango de fechas como filtros de búsqueda
            res.redirect(`/secretaria/turnos?profesional=${id_medico}&fecha_desde=${fecha_inicio}&fecha_hasta=${fecha_fin}&status=ausencia_registrada`);

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

            // 1. Buscamos la agenda del médico destino para ese día
            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico_destino, null, nueva_fecha);

            if (!agendas || agendas.length === 0) {
                return res.redirect('/secretaria/turnos?status=error_no_agenda');
            }

            const agendaDestino = agendas[0];

            // 2. Verificamos si el horario ya está ocupado en esa agenda
            const ocupados = await Turno.obtenerHorariosOcupados(agendaDestino.id, nueva_fecha);
            if (ocupados.includes(nueva_hora)) {
                return res.redirect('/secretaria/turnos?status=error_turno_ocupado');
            }

            // 3. ACTUALIZACIÓN: Eliminamos 'id_medico' de aquí para evitar el error SQL
            await Turno.actualizar(id_turno, {
                fecha: nueva_fecha,
                hora_inicio: nueva_hora,
                id_agenda: agendaDestino.id,
                estado: 'Reservado'
            });

            res.redirect('/secretaria/turnos?status=traslado_success');
        } catch (e) {
            console.error("Error en trasladarTurnoIndividual:", e);
            res.status(500).send("Error interno al trasladar el turno");
        }
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
            // 1. Extraemos returnUrl del body (lo que envió el PUG)
            const { id_turno, estado, observaciones, returnUrl } = req.body;

            await Turno.actualizar(id_turno, {
                estado,
                observaciones: observaciones || ''
            });

            // 2. Si returnUrl existe, lo usamos. 
            // Si no existe (está vacío), recién ahí va a la base.
            let destino = (returnUrl && returnUrl !== '') ? returnUrl : '/secretaria/turnos';

            // 3. Pegamos el cartelito de éxito
            const separador = destino.includes('?') ? '&' : '?';
            if (!destino.includes('status=')) {
                destino += `${separador}status=edit_success`;
            }

            console.log("Redirigiendo a:", destino); // <--- Agrega este log para debuguear
            res.redirect(destino);

        } catch (e) {
            console.error(e);
            res.redirect('/secretaria/turnos?status=error');
        }
    }



    async agregarAListaEspera(req, res, next) {
        try {
            await Turno.insertarListaEspera(req.body);
            res.redirect('/secretaria/turnos?status=espera_ok');
        } catch (e) { next(e); }
    }



    // Vista de Turnos con Agendas que ya no están activas
    async verTurnosInactivos(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Llamamos a un nuevo método en el modelo Turno
            // Este método debe hacer un JOIN con agendas y filtrar por activas = false
            const turnos = await Turno.listarTurnosAgendaInactiva(limit, offset);
            const totalTurnos = await Turno.contarTurnosAgendaInactiva();
            const totalPages = Math.ceil(totalTurnos / limit);

            const medicos = await Medico.listar();

            res.render('secretaria/turnos_inactivos', {
                turnos,
                medicos,
                currentPage: page,
                totalPages,
                totalTurnos,
                limit,
                status: req.query.status || null
            });
        } catch (error) {
            console.error("Error en verTurnosInactivos:", error);
            next(error);
        }
    }


    // Método auxiliar para consolidar turnos que requieren atención inmediata
    async obtenerTurnosParaReubicar() {
        try {
            // 1. Turnos de agendas que fueron dadas de baja (Lo que ya tenías)
            const inactivos = await Turno.getTurnosAgendasNoActivas();

            // 2. Turnos de médicos ausentes para los próximos 30 días
            // Buscamos turnos que coincidan con la tabla de ausencias
            // Nota: Aquí podrías crear un método específico en el modelo Turno para mayor performance
            const turnosAusentes = await Turno.listarTurnosAfectadosPorAusencia();

            // 3. Consolidamos y etiquetamos el motivo
            const urgentes = [
                ...inactivos.map(t => ({ ...t, motivo_urgencia: 'Agenda Eliminada' })),
                ...turnosAusentes.map(t => ({ ...t, motivo_urgencia: 'Profesional Ausente' }))
            ];

            // Ordenamos por fecha más próxima
            return urgentes.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        } catch (error) {
            console.error("Error al obtener turnos urgentes:", error);
            return [];
        }
    }


    async verListaTurnosUrgentes(req, res) {
    try {
        // Ejecutamos ambas búsquedas en paralelo para mayor velocidad
        const [porAgendasInactivas, porAusencias] = await Promise.all([
            Turno.getTurnosAgendasNoActivas(),
            Turno.listarTurnosAfectadosPorAusencia()
        ]);

        // Unimos los arrays
        const todosLosUrgentes = [...porAgendasInactivas, ...porAusencias];

        // Ordenamos por fecha y hora
        todosLosUrgentes.sort((a, b) => {
            const fechaA = new Date(`${a.fecha} ${a.hora}`);
            const fechaB = new Date(`${b.fecha} ${b.hora}`);
            return fechaA - fechaB;
        });

        return todosLosUrgentes;
    } catch (error) {
        console.error("Error al consolidar turnos urgentes:", error);
        return [];
    }
}




}

module.exports = new SecretariaController();