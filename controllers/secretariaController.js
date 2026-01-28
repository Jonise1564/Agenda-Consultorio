const Agenda = require('../models/agendasModels');
const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');
const EmailService = require('../services/emailService');

class SecretariaController {

    //  Panel Principal de Secretaría
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

    //  Vista de Ausencias
    async verAusencias(req, res, next) {
        try {
            const ausencias = await Agenda.listarAusencias();
            const medicos = await Medico.listar();
            res.render('secretaria/lista_ausencias', { ausencias, medicos });
        } catch (error) { next(error); }
    }

    //  Consulta de slots horarios (RETORNA JSON)
    async disponibilidad(req, res, next) {
        try {
            const { id_medico, id_especialidad, fecha } = req.query;

            if (!id_medico || !id_especialidad || !fecha) {
                return res.status(400).json({ error: 'Faltan datos para la consulta' });
            }

            // A) Verificar Feriado
            const feriadoDesc = await Agenda.esFeriado(fecha);
            if (feriadoDesc) {
                return res.json({ status: 'feriado', motivo: feriadoDesc });
            }

            // B) Verificar Ausencia
            const ausencia = await Agenda.obtenerAusencia(id_medico, fecha);
            if (ausencia) {
                return res.json({
                    status: 'ausencia',
                    tipo: ausencia.tipo,
                    descripcion: ausencia.descripcion
                });
            }

            // C) Obtener Agendas Planificadas
            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);
            if (!agendas || agendas.length === 0) {
                return res.json({ status: 'sin_agenda' });
            }

            const agenda = agendas[0];
            const ocupados = await Turno.obtenerHorariosOcupados(agenda.id, fecha);

            // D) Construir array de horarios
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

    // // Listado de Turnos con Filtros
    // async verListaTurnos(req, res, next) {
    //     try {
    //         const { paciente, profesional, fecha, status } = req.query;
    //         const turnos = await Turno.listarConFiltros({
    //             paciente: paciente || null,
    //             profesional: profesional || null,
    //             fecha: fecha || null
    //         });
    //         const medicos = await Medico.listar();
    //         res.render('secretaria/lista_turnos', {
    //             turnos,
    //             medicos,
    //             status: status || null,
    //             filtros: { paciente, profesional, fecha }
    //         });
    //     } catch (error) { next(error); }
    // }

    // Listado de Turnos con Filtros y Detección de Ausencias
    // async verListaTurnos(req, res, next) {
    //     try {
    //         const { paciente, profesional, fecha, status } = req.query;

    //         // 1. Obtener los turnos filtrados
    //         const turnos = await Turno.listarConFiltros({
    //             paciente: paciente || null,
    //             profesional: profesional || null,
    //             fecha: fecha || null
    //         });

    //         // 2. Enriquecer cada turno con la información de ausencia
    //         // Usamos Promise.all para que las consultas a la DB sean eficientes
    //         const turnosConEstado = await Promise.all(turnos.map(async (t) => {
    //             // Verificamos si para el id_medico y la fecha_turno hay una ausencia
    //             const ausencia = await Agenda.obtenerAusencia(t.id_medico, t.fecha_turno);

    //             return {
    //                 ...t,
    //                 medicoAusente: !!ausencia, // true si existe ausencia
    //                 motivoAusencia: ausencia ? ausencia.tipo : null
    //             };
    //         }));

    //         const medicos = await Medico.listar();

    //         res.render('secretaria/lista_turnos', {
    //             turnos: turnosConEstado, // Pasamos el array enriquecido
    //             medicos,
    //             status: status || null,
    //             filtros: { paciente, profesional, fecha }
    //         });
    //     } catch (error) {
    //         console.error("Error en verListaTurnos:", error);
    //         next(error);
    //     }
    // }

    // async verListaTurnos(req, res, next) {
    //     try {
    //         const { paciente, profesional, fecha, status } = req.query;

    //         // 1. Obtener los turnos filtrados desde el modelo
    //         const turnos = await Turno.listarConFiltros({
    //             paciente: paciente || null,
    //             profesional: profesional || null,
    //             fecha: fecha || null
    //         });

    //         // 2. Enriquecer cada turno con la información de ausencia médica
    //         const turnosConEstado = await Promise.all(turnos.map(async (t) => {
    //             let medicoAusente = false;
    //             let motivoAusencia = null;

    //             try {
    //                 if (t.id_medico && t.fecha) {
    //                     // Formateamos la fecha a YYYY-MM-DD para la consulta SQL (evita problemas de zona horaria)
    //                     const fechaSql = new Date(t.fecha).toISOString().split('T')[0];

    //                     // Consultamos si el médico tiene una ausencia registrada en esa fecha
    //                     const ausencia = await Agenda.obtenerAusencia(t.id_medico, fechaSql);

    //                     if (ausencia) {
    //                         medicoAusente = true;
    //                         motivoAusencia = ausencia.tipo; // Ejemplo: 'Vacaciones', 'Congreso', etc.
    //                     }
    //                 }
    //             } catch (err) {
    //                 console.error(`Error validando ausencia para turno ${t.id}:`, err);
    //                 // Si falla la validación de ausencia, el turno sigue su flujo normal para no bloquear la vista
    //             }

    //             return {
    //                 ...t,
    //                 medicoAusente,
    //                 motivoAusencia
    //             };
    //         }));

    //         // 3. Obtener lista de médicos (necesaria para el modal de Traslado)
    //         const medicos = await Medico.listar();

    //         // 4. Renderizar la vista con los datos enriquecidos
    //         res.render('secretaria/lista_turnos', {
    //             turnos: turnosConEstado,
    //             medicos,
    //             status: status || null,
    //             filtros: {
    //                 paciente: paciente || '',
    //                 profesional: profesional || '',
    //                 fecha: fecha || ''
    //             }
    //         });

    //     } catch (error) {
    //         console.error("Error crítico en verListaTurnos:", error);
    //         next(error);
    //     }
    // }


    async verListaTurnos(req, res, next) {
        try {
            const { paciente, profesional, fecha, status } = req.query;

            // 1. Lógica de Paginación 
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const filtros = {
                paciente: paciente || null,
                profesional: profesional || null,
                fecha: fecha || null
            };

            // 2. Obtener datos paginados y total de registros
            // Asegúrate de usar los nuevos métodos listarPaginado y contarTurnos en el modelo
            const turnos = await Turno.listarPaginado(filtros, limit, offset);
            const totalTurnos = await Turno.contarTurnos(filtros);
            const totalPages = Math.ceil(totalTurnos / limit);

            // 3. Enriquecer con ausencias 
            const turnosConEstado = await Promise.all(turnos.map(async (t) => {
                let medicoAusente = false;
                let motivoAusencia = null;

                try {
                    if (t.id_medico && t.fecha) {
                        const fechaSql = new Date(t.fecha).toISOString().split('T')[0];
                        const ausencia = await Agenda.obtenerAusencia(t.id_medico, fechaSql);
                        if (ausencia) {
                            medicoAusente = true;
                            motivoAusencia = ausencia.tipo;
                        }
                    }
                } catch (err) {
                    console.error(`Error validando ausencia para turno ${t.id}:`, err);
                }

                return {
                    ...t,
                    medicoAusente,
                    motivoAusencia
                };
            }));

            // 4. Datos adicionales para la vista
            const medicos = await Medico.listar();

            res.render('secretaria/lista_turnos', {
                turnos: turnosConEstado,
                medicos,
                status: status || null,
                // Variables de paginación
                currentPage: page,
                totalPages,
                totalTurnos,
                limit,
                // Filtros para persistencia en los links de paginación
                filtros: {
                    paciente: paciente || '',
                    profesional: profesional || '',
                    fecha: fecha || ''
                }
            });

        } catch (error) {
            console.error("Error crítico en verListaTurnos:", error);
            next(error);
        }
    }






    //  Proceso de agendar (CON VALIDACIÓN DE FECHA)
    // async agendar(req, res, next) {
    //     try {
    //         const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
    //         const archivo_dni = req.file ? req.file.filename : null;

    //         // Validación de campos obligatorios
    //         if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
    //             return res.status(400).send("Error: Faltan datos obligatorios.");
    //         }

    //         // --- VALIDACIÓN DE FECHA PASADA ---
    //         const hoy = new Date();
    //         hoy.setHours(0, 0, 0, 0); // Solo comparar por día
    //         const fechaSeleccionada = new Date(fecha + 'T00:00:00'); // Evitar problemas de zona horaria

    //         if (fechaSeleccionada < hoy) {
    //             return res.status(400).send("No se pueden agendar turnos en fechas anteriores a hoy.");
    //         }
    //         // ----------------------------------

    //         await Turno.agendarTurnoVirtual({
    //             fecha,
    //             hora_inicio,
    //             id_agenda,
    //             id_paciente,
    //             motivo: motivo || 'Turno solicitado en secretaría',
    //             archivo_dni
    //         });

    //         res.redirect('/secretaria?status=success');
    //     } catch (error) { next(error); }
    // }






    // Proceso de agendar con Notificación Automática
    // async agendar(req, res, next) {
    //     try {
    //         const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
    //         const archivo_dni = req.file ? req.file.filename : null;

    //         // 1. Validación de campos obligatorios
    //         if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
    //             return res.status(400).send("Error: Faltan datos obligatorios.");
    //         }

    //         // 2. Validación de fecha pasada
    //         const hoy = new Date();
    //         hoy.setHours(0, 0, 0, 0); 
    //         const fechaSeleccionada = new Date(fecha + 'T00:00:00'); 

    //         if (fechaSeleccionada < hoy) {
    //             return res.status(400).send("No se pueden agendar turnos en fechas anteriores a hoy.");
    //         }

    //         // 3. Guardar el turno en la Base de Datos
    //         await Turno.agendarTurnoVirtual({
    //             fecha,
    //             hora_inicio,
    //             id_agenda,
    //             id_paciente,
    //             motivo: motivo || 'Turno solicitado en secretaría',
    //             archivo_dni
    //         });

    //         // 4. NOTIFICACIÓN AUTOMÁTICA (En segundo plano)
    //         // Usamos un bloque try/catch interno para que si falla el mail, no se caiga el sistema
    //         try {
    //             // Buscamos los datos del paciente para obtener su email
    //             const datosPaciente = await Paciente.getById(id_paciente);
                
    //             if (datosPaciente && datosPaciente.email) {
    //                 // Disparamos el servicio de email (no usamos await aquí si no queremos que la secretaria espere)
    //                 EmailService.enviarConfirmacion(datosPaciente.email, {
    //                     nombre: datosPaciente.nombre || 'Paciente',
    //                     fecha: fecha,
    //                     hora: hora_inicio,
    //                     motivo: motivo || 'Consulta médica'
    //                 }).then(() => {
    //                     console.log(`✅ Mail enviado con éxito a: ${datosPaciente.email}`);
    //                 }).catch(err => {
    //                     console.error("❌ Error en el envío de Nodemailer:", err.message);
    //                 });
    //             } else {
    //                 console.log("⚠️ No se envió correo: El paciente no tiene email registrado.");
    //             }
    //         } catch (errorPaciente) {
    //             console.error("⚠️ Error al obtener datos del paciente para el mail:", errorPaciente.message);
    //         }

    //         // 5. Respuesta final a la secretaria
    //         res.redirect('/secretaria?status=success');

    //     } catch (error) { 
    //         console.error("Error crítico en agendar:", error);
    //         next(error); 
    //     }
    // }

    // async agendar(req, res, next) {
    //     try {
    //         const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
    //         const archivo_dni = req.file ? req.file.filename : null;

    //         // 1. Validación de campos obligatorios
    //         if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
    //             return res.status(400).send("Error: Faltan datos obligatorios.");
    //         }

    //         // 2. Validación de fecha pasada
    //         const hoy = new Date();
    //         hoy.setHours(0, 0, 0, 0); 
    //         const fechaSeleccionada = new Date(fecha + 'T00:00:00'); 

    //         if (fechaSeleccionada < hoy) {
    //             return res.status(400).send("No se pueden agendar turnos en fechas anteriores a hoy.");
    //         }

    //         // 3. Guardar el turno en la Base de Datos
    //         await Turno.agendarTurnoVirtual({
    //             fecha,
    //             hora_inicio,
    //             id_agenda,
    //             id_paciente,
    //             motivo: motivo || 'Turno solicitado en secretaría',
    //             archivo_dni
    //         });

    //         // 4. NOTIFICACIÓN AUTOMÁTICA
    //         try {
    //             // Buscamos datos del paciente
    //             const datosPaciente = await Paciente.getById(id_paciente);
                
    //             // BUSCAMOS DATOS DEL MÉDICO Y ESPECIALIDAD (Usando el id_agenda)
    //             // Asumimos que Agenda tiene un método para traer nombres legibles
    //             const detallesAgenda = await Agenda.getById(id_agenda); 

    //             if (datosPaciente && datosPaciente.email) {
    //                 EmailService.enviarConfirmacion(datosPaciente.email, {
    //                     nombre: datosPaciente.nombre || 'Paciente',
    //                     fecha: fecha,
    //                     hora: hora_inicio,
    //                     motivo: motivo || 'Consulta médica',
    //                     medico: detallesAgenda ? `${detallesAgenda.medico_nombre} ${detallesAgenda.medico_apellido}` : 'A confirmar',
    //                     especialidad: detallesAgenda ? detallesAgenda.especialidad_nombre : 'General'
    //                 }).then(() => {
    //                     console.log(`✅ Mail enviado con éxito a: ${datosPaciente.email}`);
    //                 }).catch(err => {
    //                     console.error("❌ Error en el envío de Nodemailer:", err.message);
    //                 });
    //             } else {
    //                 console.log("⚠️ No se envió correo: El paciente no tiene email registrado.");
    //             }
    //         } catch (errorNotificacion) {
    //             console.error("⚠️ Error al preparar datos de notificación:", errorNotificacion.message);
    //         }

    //         // 5. Respuesta final
    //         res.redirect('/secretaria?status=success');

    //     } catch (error) { 
    //         console.error("Error crítico en agendar:", error);
    //         next(error); 
    //     }
    // }



    async agendar(req, res, next) {
        try {
            const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
            const archivo_dni = req.file ? req.file.filename : null;

            // 1. Validación de campos obligatorios
            if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
                return res.status(400).send("Error: Faltan datos obligatorios.");
            }

            // 2. Validación de fecha pasada
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); 
            const fechaSeleccionada = new Date(fecha + 'T00:00:00'); 

            if (fechaSeleccionada < hoy) {
                return res.status(400).send("No se pueden agendar turnos en fechas anteriores a hoy.");
            }

            // 3. Guardar el turno en la Base de Datos
            await Turno.agendarTurnoVirtual({
                fecha,
                hora_inicio,
                id_agenda,
                id_paciente,
                motivo: motivo || 'Turno solicitado en secretaría',
                archivo_dni
            });

            // 4. NOTIFICACIÓN AUTOMÁTICA
            try {
                // Obtenemos datos del paciente (Email, Nombre)
                const datosPaciente = await Paciente.getById(id_paciente);
                
                // Obtenemos detalles de la agenda (Nombre médico, Especialidad) 
                // usando el método getAgendaById que ya tienes en tu modelo
                const detallesAgenda = await Agenda.getAgendaById(id_agenda);

                if (datosPaciente && datosPaciente.email) {
                    EmailService.enviarConfirmacion(datosPaciente.email, {
                        nombre: datosPaciente.nombre,
                        fecha: fecha,
                        hora: hora_inicio,
                        motivo: motivo || 'Consulta médica',
                        medico: detallesAgenda ? `Dr/a. ${detallesAgenda.nombre_medico} ${detallesAgenda.apellido_medico}` : 'Médico a asignar',
                        especialidad: detallesAgenda ? detallesAgenda.especialidad : 'General'
                    }).then(() => {
                        console.log(`✅ Mail enviado con éxito a: ${datosPaciente.email}`);
                    }).catch(err => {
                        console.error("❌ Error en el envío de Nodemailer:", err.message);
                    });
                } else {
                    console.log("⚠️ No se envió correo: El paciente no tiene email registrado o no existe.");
                }
            } catch (errorNotificacion) {
                console.error("⚠️ Error al preparar datos de notificación:", errorNotificacion.message);
            }

            // 5. Respuesta final
            res.redirect('/secretaria?status=success');

        } catch (error) { 
            console.error("Error crítico en agendar:", error);
            next(error); 
        }
    }

    //  Buscadores (Autocomplete)
    async buscarPacientePorDNI(req, res, next) {
        try {
            const resultados = await Paciente.buscar(req.query.q);
            res.json(resultados);
        } catch (error) { res.status(500).json([]); }
    }

    async buscarMedicos(req, res, next) {
        try {
            const resultados = await Medico.buscar(req.query.q);
            res.json(resultados);
        } catch (error) { res.status(500).json([]); }
    }

    // Proceso para grabar la ausencia en la DB
    async registrarAusencia(req, res, next) {
        try {
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;

            // Validación de fechas
            const inicio = new Date(fecha_inicio);
            const fin = new Date(fecha_fin);

            if (fin < inicio) {
                // Podrías redirigir con un error o enviar un mensaje
                return res.status(400).send("La fecha de fin no puede ser anterior a la de inicio.");
            }

            if (!id_medico || !fecha_inicio || !fecha_fin || !tipo) {
                return res.status(400).send("Faltan datos obligatorios.");
            }

            // Guardar en la base de datos
            await Agenda.registrarAusencia({
                id_medico,
                fecha_inicio,
                fecha_fin,
                tipo,
                descripcion: descripcion || ''
            });

            // Redirigir a la lista de ausencias con éxito
            res.redirect('/secretaria/ausencias?status=success');

        } catch (error) {
            console.error("Error en registrarAusencia:", error);
            next(error);
        }
    }

    // 4. Proceso para eliminar (habilitar agenda nuevamente)
    async eliminarAusencia(req, res, next) {
        try {
            const { id } = req.params;

            // Asegúrate de que Agenda.eliminarAusencia exista en tu modelo
            await Agenda.eliminarAusencia(id);

            res.redirect('/secretaria/ausencias?status=deleted');
        } catch (error) {
            console.error("Error al eliminar ausencia:", error);
            next(error);
        }
    }

    // 5. Proceso para actualizar una ausencia desde el modal
    async actualizarAusencia(req, res, next) {
        try {
            const { id } = req.params;
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;

            // Validación de fechas
            const inicio = new Date(fecha_inicio);
            const fin = new Date(fecha_fin);

            if (fin < inicio) {
                return res.status(400).send("La fecha de fin no puede ser anterior a la de inicio.");
            }

            if (!id || !id_medico || !fecha_inicio || !fecha_fin || !tipo) {
                return res.status(400).send("Faltan datos obligatorios para la actualización.");
            }

            // Llamada al modelo para actualizar

            await Agenda.actualizarAusencia(id, {
                id_medico,
                fecha_inicio,
                fecha_fin,
                tipo,
                descripcion: descripcion || ''
            });

            res.redirect('/secretaria/ausencias?status=success');

        } catch (error) {
            console.error("Error en actualizarAusencia:", error);
            next(error);
        }
    }

    // TRASLADO: Proceso de mover un turno individual con VALIDACIÓN de solapamiento
    async trasladarTurnoIndividual(req, res) {
        try {
            const { id_turno, id_medico_destino, nueva_fecha, nueva_hora } = req.body;

            console.log("Iniciando validación de traslado para:", { id_medico_destino, nueva_fecha, nueva_hora });

            // 1. Buscamos la agenda del médico destino para esa fecha
            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
                id_medico_destino,
                null,
                nueva_fecha
            );

            if (!agendas || agendas.length === 0) {
                return res.redirect('/secretaria/turnos?status=error_no_agenda');
            }

            const agendaDestino = agendas[0];

            // 2. VALIDACIÓN CLAVE: Verificar si el horario ya está ocupado en la agenda destino

            const ocupados = await Turno.obtenerHorariosOcupados(agendaDestino.id, nueva_fecha);

            if (ocupados.includes(nueva_hora)) {
                console.log(`⚠️ Solapamiento detectado: El horario ${nueva_hora} ya está ocupado.`);
                return res.redirect('/secretaria/turnos?status=error_turno_ocupado');
            }

            // 3. Si el horario está libre, procedemos con la actualización
            await Turno.actualizar(id_turno, {
                fecha: nueva_fecha,
                hora_inicio: nueva_hora,
                id_agenda: agendaDestino.id,
                id_medico: id_medico_destino,
                estado: 'Reservado'
            });

            res.redirect('/secretaria/turnos?status=traslado_success');

        } catch (error) {
            console.error("Error en trasladarTurnoIndividual:", error);
            res.status(500).send("Error interno al procesar el traslado");
        }
    }

    // Acción masiva: Transferir todos los turnos de un médico a otro
    async transferirAgenda(req, res, next) {
        try {
            const { id_medico_origen, id_medico_destino, fecha, id_especialidad } = req.body;

            if (id_medico_origen === id_medico_destino) {
                return res.redirect('/secretaria?status=error_mismo_medico');
            }

            await Turno.transferirMasivo({
                origen: id_medico_origen,
                destino: id_medico_destino,
                fecha: fecha,
                especialidad: id_especialidad
            });

            res.redirect('/secretaria?status=transfer_success');
        } catch (error) {
            console.error("Error en transferirAgenda:", error);
            next(error);
        }
    }


    // Actualizar Estado y Observaciones de un Turno
    async actualizarEstadoTurno(req, res, next) {
        try {
            const { id_turno, estado, observaciones } = req.body;

            if (!id_turno || !estado) {
                return res.redirect('/secretaria/turnos?status=error');
            }

            // Llamada al modelo Turno para actualizar solo estos campos
            // o usa el método actualizar existente si es genérico.
            await Turno.actualizar(id_turno, {
                estado: estado,
                observaciones: observaciones || ''
            });

            res.redirect('/secretaria/turnos?status=edit_success');
        } catch (error) {
            console.error("Error en actualizarEstadoTurno:", error);
            res.redirect('/secretaria/turnos?status=error');
        }
    }



}

module.exports = new SecretariaController();