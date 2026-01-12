// // const Agenda = require('../models/agendasModels');
// // const Turno = require('../models/turnosModels');
// // const Paciente = require('../models/pacientesModels');
// // const Medico = require('../models/medicosModels');
// // const Especialidad = require('../models/especialidadesModels');

// // class SecretariaController {

// //     // Panel Principal de Secretaría
// //     async index(req, res, next) {
// //         try {
// //             const especialidades = await Especialidad.getAll();
// //             const medicos = await Medico.listar();
// //             res.render('secretaria/index', {
// //                 especialidades,
// //                 medicos,
// //                 status: req.query.status || null
// //             });
// //         } catch (error) {
// //             next(error);
// //         }
// //     }

// //     // Consulta de slots horarios disponibles (AJAX)
// //     async disponibilidad(req, res, next) {
// //         try {
// //             const { id_medico, id_especialidad, fecha } = req.query;

// //             if (!id_medico || !id_especialidad || !fecha) {
// //                 return res.send('<p class="text-center text-muted">Faltan datos para la consulta.</p>');
// //             }

// //             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);

// //             if (!agendas || agendas.length === 0) {
// //                 return res.send(`
// //                     <div class="text-center mt-4">
// //                         <i class="fa-solid fa-calendar-xmark text-danger fs-1 d-block mb-2"></i>
// //                         <p class="fw-bold">Sin atención</p>
// //                         <small>El médico no tiene agenda configurada para esta fecha.</small>
// //                     </div>`);
// //             }

// //             const agenda = agendas[0];
// //             const ocupados = await Turno.obtenerHorariosOcupados(agenda.id, fecha);

// //             let html = "";
// //             let [h, m] = agenda.hora_inicio.split(':');
// //             let actual = new Date(2000, 0, 1, h, m);
// //             let [hFin, mFin] = agenda.hora_fin.split(':');
// //             let fin = new Date(2000, 0, 1, hFin, mFin);

// //             while (actual < fin) {
// //                 const horaStr = actual.toTimeString().slice(0, 5);

// //                 if (ocupados.includes(horaStr)) {
// //                     html += `
// //                         <div class="slot-hora ocupado" title="No disponible" 
// //                         style="opacity:0.5; cursor:not-allowed; background:#e9ecef; width: 85px;
// //                          border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; text-align: center;">
// //                             <span>${horaStr}</span>
// //                         </div>`;
// //                 } else {
// //                     html += `
// //                         <div class="slot-hora" 
// //                              data-hora="${horaStr}" 
// //                              data-agenda="${agenda.id}"
// //                              style="width: 85px; border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; 
// //                              text-align: center; cursor: pointer; background: white; font-weight: bold;">
// //                             <span>${horaStr}</span>
// //                         </div>`;
// //                 }
// //                 actual.setMinutes(actual.getMinutes() + agenda.duracion_turnos);
// //             }

// //             res.send(html || '<p class="text-center">No hay horarios disponibles.</p>');

// //         } catch (error) {
// //             console.error("Error en disponibilidad:", error);
// //             res.status(500).send('<p class="text-danger">Error al cargar horarios</p>');
// //         }
// //     }

// //     // Proceso de agendar un nuevo turno
// //     async agendar(req, res, next) {
// //         try {
// //             const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
// //             const archivo_dni = req.file ? req.file.filename : null;

// //             if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
// //                 return res.status(400).send("Error 400: Faltan datos (Paciente, Fecha, Hora o Agenda).");
// //             }

// //             await Turno.agendarTurnoVirtual({
// //                 fecha: fecha,
// //                 hora_inicio: hora_inicio,
// //                 id_agenda: id_agenda,
// //                 id_paciente: id_paciente,
// //                 motivo: motivo || 'Turno solicitado en secretaría',
// //                 archivo_dni: archivo_dni
// //             });

// //             res.redirect('/secretaria?status=success');

// //         } catch (error) {
// //             console.error("Error al agendar turno:", error);
// //             next(error);
// //         }
// //     }

// //     // Buscadores AJAX
// //     async buscarPacientePorDNI(req, res, next) {
// //         try {
// //             const query = req.query.q;
// //             const resultados = await Paciente.buscar(query);
// //             res.json(resultados);
// //         } catch (error) {
// //             res.status(500).json([]);
// //         }
// //     }

// //     async buscarMedicos(req, res, next) {
// //         try {
// //             const query = req.query.q;
// //             const resultados = await Medico.buscar(query);
// //             res.json(resultados);
// //         } catch (error) {
// //             res.status(500).json([]);
// //         }
// //     }

// //     // LISTADO DE TURNOS:  captura status y pasa fecha
// //     async verListaTurnos(req, res, next) {
// //         try {
// //             const { paciente, profesional, fecha, status } = req.query;

// //             const turnos = await Turno.listarConFiltros({
// //                 paciente: paciente || null,
// //                 profesional: profesional || null,
// //                 fecha: fecha || null
// //             });

// //             const medicos = await Medico.listar();

// //             res.render('secretaria/lista_turnos', {
// //                 turnos,
// //                 medicos,
// //                 status: status || null,
// //                 filtros: { paciente, profesional, fecha }
// //             });
// //         } catch (error) {
// //             console.error("Error en verListaTurnos:", error);
// //             next(error);
// //         }
// //     }

// //     // TRASLADO: Proceso de mover un turno individual
// //     // async trasladarTurnoIndividual(req, res) {
// //     //     try {
// //     //         // Recibimos id_medico_destino (que ahora debe ser el ID numérico)
// //     //         const { id_turno, id_medico_destino, nueva_fecha, nueva_hora } = req.body;

// //     //         console.log("Datos recibidos para traslado:", {
// //     //             id_turno,
// //     //             id_medico: id_medico_destino,
// //     //             fecha: nueva_fecha
// //     //         });

// //     //         // 1. Buscamos la agenda del médico destino para esa fecha
// //     //         // Usamos el modelo Agenda que ya tiene el pool de conexión interno
// //     //         const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
// //     //             id_medico_destino,
// //     //             null,
// //     //             nueva_fecha
// //     //         );

// //     //         if (!agendas || agendas.length === 0) {
// //     //             console.log("No se encontró agenda para el médico ID:", id_medico_destino);
// //     //             return res.redirect('/secretaria/turnos?status=error_no_agenda');
// //     //         }

// //     //         const agendaDestino = agendas[0];

// //     //         // 2. Actualizamos el turno usando el modelo Turno
// //     //         await Turno.actualizar(id_turno, {
// //     //             fecha: nueva_fecha,
// //     //             hora_inicio: nueva_hora,
// //     //             id_agenda: agendaDestino.id,
// //     //             id_medico: id_medico_destino,
// //     //             estado: 'Reservado'
// //     //         });

// //     //         res.redirect('/secretaria/turnos?status=traslado_success');

// //     //     } catch (error) {
// //     //         console.error("Error en trasladarTurnoIndividual:", error);
// //     //         res.status(500).send("Error interno al procesar el traslado");
// //     //     }
// //     // }


// //     // TRASLADO: Proceso de mover un turno individual con VALIDACIÓN de solapamiento
// //     async trasladarTurnoIndividual(req, res) {
// //         try {
// //             const { id_turno, id_medico_destino, nueva_fecha, nueva_hora } = req.body;

// //             console.log("Iniciando validación de traslado para:", { id_medico_destino, nueva_fecha, nueva_hora });

// //             // 1. Buscamos la agenda del médico destino para esa fecha
// //             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
// //                 id_medico_destino,
// //                 null,
// //                 nueva_fecha
// //             );

// //             if (!agendas || agendas.length === 0) {
// //                 return res.redirect('/secretaria/turnos?status=error_no_agenda');
// //             }

// //             const agendaDestino = agendas[0];

// //             // 2. VALIDACIÓN CLAVE: Verificar si el horario ya está ocupado en la agenda destino
// //             // Usamos el método que ya tienes definido en tu modelo Turno
// //             const ocupados = await Turno.obtenerHorariosOcupados(agendaDestino.id, nueva_fecha);

// //             if (ocupados.includes(nueva_hora)) {
// //                 console.log(`⚠️ Solapamiento detectado: El horario ${nueva_hora} ya está ocupado.`);
// //                 return res.redirect('/secretaria/turnos?status=error_turno_ocupado');
// //             }

// //             // 3. Si el horario está libre, procedemos con la actualización
// //             await Turno.actualizar(id_turno, {
// //                 fecha: nueva_fecha,
// //                 hora_inicio: nueva_hora,
// //                 id_agenda: agendaDestino.id,
// //                 id_medico: id_medico_destino,
// //                 estado: 'Reservado'
// //             });

// //             res.redirect('/secretaria/turnos?status=traslado_success');

// //         } catch (error) {
// //             console.error("Error en trasladarTurnoIndividual:", error);
// //             res.status(500).send("Error interno al procesar el traslado");
// //         }
// //     }

// //     // Acción masiva: Transferir todos los turnos de un médico a otro
// //     async transferirAgenda(req, res, next) {
// //         try {
// //             const { id_medico_origen, id_medico_destino, fecha, id_especialidad } = req.body;

// //             if (id_medico_origen === id_medico_destino) {
// //                 return res.redirect('/secretaria?status=error_mismo_medico');
// //             }

// //             await Turno.transferirMasivo({
// //                 origen: id_medico_origen,
// //                 destino: id_medico_destino,
// //                 fecha: fecha,
// //                 especialidad: id_especialidad
// //             });

// //             res.redirect('/secretaria?status=transfer_success');
// //         } catch (error) {
// //             console.error("Error en transferirAgenda:", error);
// //             next(error);
// //         }
// //     }
// // }

// // module.exports = new SecretariaController();






// const Agenda = require('../models/agendasModels');
// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');

// class SecretariaController {

//     // Panel Principal de Secretaría
//     async index(req, res, next) {
//         try {
//             const especialidades = await Especialidad.getAll();
//             const medicos = await Medico.listar();
//             res.render('secretaria/index', {
//                 especialidades,
//                 medicos,
//                 status: req.query.status || null
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // Consulta de slots horarios disponibles (AJAX) con Validación Jerárquica
//     async disponibilidad(req, res, next) {
//         try {
//             const { id_medico, id_especialidad, fecha } = req.query;

//             if (!id_medico || !id_especialidad || !fecha) {
//                 return res.send('<p class="text-center text-muted">Faltan datos para la consulta.</p>');
//             }

//             // 1. CAPA PRIORITARIA: Verificar Feriado Global
//             const feriadoDesc = await Agenda.esFeriado(fecha);
//             if (feriadoDesc) {
//                 return res.send(`
//                     <div class="text-center mt-4">
//                         <i class="fa-solid fa-star-of-life text-danger fs-1 d-block mb-2"></i>
//                         <p class="fw-bold mb-0">FERIADO: ${feriadoDesc}</p>
//                         <small class="text-muted">La institución permanece cerrada.</small>
//                     </div>`);
//             }

//             // 2. CAPA MÉDICA: Verificar Ausencia (Vacaciones, Imprevistos)
//             const ausencia = await Agenda.obtenerAusencia(id_medico, fecha);
//             if (ausencia) {
//                 const icon = ausencia.tipo === 'Vacaciones' ? 'fa-umbrella-beach' : 'fa-user-slash';
//                 return res.send(`
//                     <div class="text-center mt-4 text-warning">
//                         <i class="fa-solid ${icon} fs-1 d-block mb-2"></i>
//                         <p class="fw-bold mb-0">${ausencia.tipo.toUpperCase()}</p>
//                         <small class="text-muted">${ausencia.descripcion || 'El profesional no atiende en esta fecha.'}</small>
//                     </div>`);
//             }

//             // 3. CAPA AGENDA: Obtener agenda vigente (Valida fecha_creacion, fecha_fin e id_dia)
//             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);

//             if (!agendas || agendas.length === 0) {
//                 return res.send(`
//                     <div class="text-center mt-4">
//                         <i class="fa-solid fa-calendar-xmark text-danger fs-1 d-block mb-2"></i>
//                         <p class="fw-bold">Sin atención / No planificado</p>
//                         <small>El médico no tiene agenda configurada para esta fecha.</small>
//                     </div>`);
//             }

//             const agenda = agendas[0];
//             const ocupados = await Turno.obtenerHorariosOcupados(agenda.id, fecha);

//             let html = "";
//             let [h, m] = agenda.hora_inicio.split(':');
//             let actual = new Date(2000, 0, 1, h, m);
//             let [hFin, mFin] = agenda.hora_fin.split(':');
//             let fin = new Date(2000, 0, 1, hFin, mFin);

//             while (actual < fin) {
//                 const horaStr = actual.toTimeString().slice(0, 5);

//                 if (ocupados.includes(horaStr)) {
//                     html += `
//                         <div class="slot-hora ocupado" title="No disponible" 
//                         style="opacity:0.5; cursor:not-allowed; background:#e9ecef; width: 85px;
//                          border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; text-align: center;">
//                             <span>${horaStr}</span>
//                         </div>`;
//                 } else {
//                     html += `
//                         <div class="slot-hora" 
//                              data-hora="${horaStr}" 
//                              data-agenda="${agenda.id}"
//                              style="width: 85px; border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; 
//                              text-align: center; cursor: pointer; background: white; font-weight: bold;">
//                             <span>${horaStr}</span>
//                         </div>`;
//                 }
//                 actual.setMinutes(actual.getMinutes() + agenda.duracion_turnos);
//             }

//             res.send(html || '<p class="text-center">No hay intervalos disponibles.</p>');

//         } catch (error) {
//             console.error("Error en disponibilidad:", error);
//             res.status(500).send('<p class="text-danger">Error al cargar horarios</p>');
//         }
//     }

//     // Proceso de agendar un nuevo turno
//     async agendar(req, res, next) {
//         try {
//             const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
//             const archivo_dni = req.file ? req.file.filename : null;

//             if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
//                 return res.status(400).send("Error 400: Faltan datos (Paciente, Fecha, Hora o Agenda).");
//             }

//             // Validación de seguridad extra: evitar bypass por consola
//             const feriado = await Agenda.esFeriado(fecha);
//             const ausencia = await Agenda.obtenerAusencia(null, fecha); // Ajustar si id_medico es necesario aquí

//             if (feriado || ausencia) {
//                 return res.status(400).send("No se pueden agendar turnos en días bloqueados.");
//             }

//             await Turno.agendarTurnoVirtual({
//                 fecha: fecha,
//                 hora_inicio: hora_inicio,
//                 id_agenda: id_agenda,
//                 id_paciente: id_paciente,
//                 motivo: motivo || 'Turno solicitado en secretaría',
//                 archivo_dni: archivo_dni
//             });

//             res.redirect('/secretaria?status=success');

//         } catch (error) {
//             console.error("Error al agendar turno:", error);
//             next(error);
//         }
//     }

//     // Buscadores AJAX
//     async buscarPacientePorDNI(req, res, next) {
//         try {
//             const query = req.query.q;
//             const resultados = await Paciente.buscar(query);
//             res.json(resultados);
//         } catch (error) {
//             res.status(500).json([]);
//         }
//     }

//     async buscarMedicos(req, res, next) {
//         try {
//             const query = req.query.q;
//             const resultados = await Medico.buscar(query);
//             res.json(resultados);
//         } catch (error) {
//             res.status(500).json([]);
//         }
//     }

//     // LISTADO DE TURNOS
//     async verListaTurnos(req, res, next) {
//         try {
//             const { paciente, profesional, fecha, status } = req.query;

//             const turnos = await Turno.listarConFiltros({
//                 paciente: paciente || null,
//                 professional: profesional || null,
//                 fecha: fecha || null
//             });

//             const medicos = await Medico.listar();

//             res.render('secretaria/lista_turnos', {
//                 turnos,
//                 medicos,
//                 status: status || null,
//                 filtros: { paciente, profesional, fecha }
//             });
//         } catch (error) {
//             console.error("Error en verListaTurnos:", error);
//             next(error);
//         }
//     }

//     // TRASLADO: Proceso de mover un turno individual con VALIDACIÓN de solapamiento
//     async trasladarTurnoIndividual(req, res) {
//         try {
//             const { id_turno, id_medico_destino, nueva_fecha, nueva_hora } = req.body;

//             // 1. Buscamos la agenda del médico destino para esa fecha
//             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
//                 id_medico_destino,
//                 null,
//                 nueva_fecha
//             );

//             if (!agendas || agendas.length === 0) {
//                 return res.redirect('/secretaria/turnos?status=error_no_agenda');
//             }

//             const agendaDestino = agendas[0];

//             // 2. Verificar si el horario ya está ocupado en el destino
//             const ocupados = await Turno.obtenerHorariosOcupados(agendaDestino.id, nueva_fecha);

//             if (ocupados.includes(nueva_hora)) {
//                 return res.redirect('/secretaria/turnos?status=error_turno_ocupado');
//             }

//             // 3. Proceder con la actualización
//             await Turno.actualizar(id_turno, {
//                 fecha: nueva_fecha,
//                 hora_inicio: nueva_hora,
//                 id_agenda: agendaDestino.id,
//                 id_medico: id_medico_destino,
//                 estado: 'Reservado'
//             });

//             res.redirect('/secretaria/turnos?status=traslado_success');

//         } catch (error) {
//             console.error("Error en trasladarTurnoIndividual:", error);
//             res.status(500).send("Error interno al procesar el traslado");
//         }
//     }

//     // Acción masiva: Transferir todos los turnos de un médico a otro
//     async transferirAgenda(req, res, next) {
//         try {
//             const { id_medico_origen, id_medico_destino, fecha, id_especialidad } = req.body;

//             if (id_medico_origen === id_medico_destino) {
//                 return res.redirect('/secretaria?status=error_mismo_medico');
//             }

//             await Turno.transferirMasivo({
//                 origen: id_medico_origen,
//                 destino: id_medico_destino,
//                 fecha: fecha,
//                 especialidad: id_especialidad
//             });

//             res.redirect('/secretaria?status=transfer_success');
//         } catch (error) {
//             console.error("Error en transferirAgenda:", error);
//             next(error);
//         }
//     }

//     // Registrar ausencia del médico (Vacaciones, Licencias, etc.)
//     async registrarAusencia(req, res, next) {
//         try {
//             const inicio = new Date(fecha_inicio);
//             const fin = new Date(fecha_fin);

//             if (fin < inicio) {
//                 return res.status(400).send("La fecha de fin no puede ser anterior a la de inicio.");
//             }
//             const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;

//             if (!id_medico || !fecha_inicio || !fecha_fin || !tipo) {
//                 return res.status(400).send("Faltan datos obligatorios para registrar la ausencia.");
//             }

//             // Llamamos al modelo Agenda para persistir la ausencia
//             // Nota: Debes asegurarte de que Agenda.registrarAusencia exista en tu modelo
//             await Agenda.registrarAusencia({
//                 id_medico,
//                 fecha_inicio,
//                 fecha_fin,
//                 tipo,
//                 descripcion: descripcion || ''
//             });

//             console.log(`Ausencia registrada: Médico ${id_medico} del ${fecha_inicio} al ${fecha_fin}`);

//             // Redireccionamos con un status para mostrar un mensaje de éxito
//             res.redirect('/secretaria?status=ausencia_success');

//         } catch (error) {
//             console.error("Error en registrarAusencia:", error);
//             next(error);
//         }
//     }

// }

// module.exports = new SecretariaController();




const Agenda = require('../models/agendasModels');
const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');

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
        } catch (error) {
            next(error);
        }
    }

    // Consulta de slots horarios disponibles (AJAX)
    async disponibilidad(req, res, next) {
        try {
            const { id_medico, id_especialidad, fecha } = req.query;

            if (!id_medico || !id_especialidad || !fecha) {
                return res.send('<p class="text-center text-muted">Faltan datos para la consulta.</p>');
            }

            // 1. CAPA PRIORITARIA: Verificar Feriado Global
            const feriadoDesc = await Agenda.esFeriado(fecha);
            if (feriadoDesc) {
                return res.send(`
                    <div class="text-center mt-4">
                        <i class="fa-solid fa-star-of-life text-danger fs-1 d-block mb-2"></i>
                        <p class="fw-bold mb-0">FERIADO: ${feriadoDesc}</p>
                        <small class="text-muted">La institución permanece cerrada.</small>
                    </div>`);
            }

            // 2. CAPA MÉDICA: Verificar Ausencia
            const ausencia = await Agenda.obtenerAusencia(id_medico, fecha);
            if (ausencia) {
                const icon = ausencia.tipo === 'Vacaciones' ? 'fa-umbrella-beach' : 'fa-user-slash';
                return res.send(`
                    <div class="text-center mt-4 text-warning">
                        <i class="fa-solid ${icon} fs-1 d-block mb-2"></i>
                        <p class="fw-bold mb-0">${ausencia.tipo.toUpperCase()}</p>
                        <small class="text-muted">${ausencia.descripcion || 'El profesional no atiende en esta fecha.'}</small>
                    </div>`);
            }

            // 3. CAPA AGENDA
            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);

            if (!agendas || agendas.length === 0) {
                return res.send(`
                    <div class="text-center mt-4">
                        <i class="fa-solid fa-calendar-xmark text-danger fs-1 d-block mb-2"></i>
                        <p class="fw-bold">Sin atención / No planificado</p>
                        <small>El médico no tiene agenda configurada para esta fecha.</small>
                    </div>`);
            }

            const agenda = agendas[0];
            const ocupados = await Turno.obtenerHorariosOcupados(agenda.id, fecha);

            let html = "";
            let [h, m] = agenda.hora_inicio.split(':');
            let actual = new Date(2000, 0, 1, h, m);
            let [hFin, mFin] = agenda.hora_fin.split(':');
            let fin = new Date(2000, 0, 1, hFin, mFin);

            while (actual < fin) {
                const horaStr = actual.toTimeString().slice(0, 5);

                if (ocupados.includes(horaStr)) {
                    html += `
                        <div class="slot-hora ocupado" title="No disponible" 
                        style="opacity:0.5; cursor:not-allowed; background:#e9ecef; width: 85px;
                         border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; text-align: center;">
                            <span>${horaStr}</span>
                        </div>`;
                } else {
                    html += `
                        <div class="slot-hora" 
                             data-hora="${horaStr}" 
                             data-agenda="${agenda.id}"
                             style="width: 85px; border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; 
                             text-align: center; cursor: pointer; background: white; font-weight: bold;">
                            <span>${horaStr}</span>
                        </div>`;
                }
                actual.setMinutes(actual.getMinutes() + agenda.duracion_turnos);
            }

            res.send(html || '<p class="text-center">No hay intervalos disponibles.</p>');

        } catch (error) {
            console.error("Error en disponibilidad:", error);
            res.status(500).send('<p class="text-danger">Error al cargar horarios</p>');
        }
    }

    // Proceso de agendar un nuevo turno
    async agendar(req, res, next) {
        try {
            const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
            const archivo_dni = req.file ? req.file.filename : null;

            if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
                return res.status(400).send("Error 400: Faltan datos.");
            }

            await Turno.agendarTurnoVirtual({
                fecha,
                hora_inicio,
                id_agenda,
                id_paciente,
                motivo: motivo || 'Turno solicitado en secretaría',
                archivo_dni
            });

            res.redirect('/secretaria?status=success');
        } catch (error) {
            next(error);
        }
    }

    // Buscadores AJAX
    async buscarPacientePorDNI(req, res, next) {
        try {
            const resultados = await Paciente.buscar(req.query.q);
            res.json(resultados);
        } catch (error) {
            res.status(500).json([]);
        }
    }

    async buscarMedicos(req, res, next) {
        try {
            const resultados = await Medico.buscar(req.query.q);
            res.json(resultados);
        } catch (error) {
            res.status(500).json([]);
        }
    }

    // LISTADO DE TURNOS
    async verListaTurnos(req, res, next) {
        try {
            const { paciente, profesional, fecha, status } = req.query;
            const turnos = await Turno.listarConFiltros({
                paciente: paciente || null,
                professional: profesional || null,
                fecha: fecha || null
            });
            const medicos = await Medico.listar();

            res.render('secretaria/lista_turnos', {
                turnos,
                medicos,
                status: status || null,
                filtros: { paciente, profesional, fecha }
            });
        } catch (error) {
            next(error);
        }
    }

    // TRASLADO INDIVIDUAL
    async trasladarTurnoIndividual(req, res) {
        try {
            const { id_turno, id_medico_destino, nueva_fecha, nueva_hora } = req.body;
            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico_destino, null, nueva_fecha);

            if (!agendas || agendas.length === 0) {
                return res.redirect('/secretaria/turnos?status=error_no_agenda');
            }

            const agendaDestino = agendas[0];
            const ocupados = await Turno.obtenerHorariosOcupados(agendaDestino.id, nueva_fecha);

            if (ocupados.includes(nueva_hora)) {
                return res.redirect('/secretaria/turnos?status=error_turno_ocupado');
            }

            await Turno.actualizar(id_turno, {
                fecha: nueva_fecha,
                hora_inicio: nueva_hora,
                id_agenda: agendaDestino.id,
                id_medico: id_medico_destino,
                estado: 'Reservado'
            });

            res.redirect('/secretaria/turnos?status=traslado_success');
        } catch (error) {
            res.status(500).send("Error interno al procesar el traslado");
        }
    }

    // TRANSFERENCIA MASIVA
    async transferirAgenda(req, res, next) {
        try {
            const { id_medico_origen, id_medico_destino, fecha, id_especialidad } = req.body;
            if (id_medico_origen === id_medico_destino) {
                return res.redirect('/secretaria?status=error_mismo_medico');
            }
            await Turno.transferirMasivo({
                origen: id_medico_origen,
                destino: id_medico_destino,
                fecha,
                especialidad: id_especialidad
            });
            res.redirect('/secretaria?status=transfer_success');
        } catch (error) {
            next(error);
        }
    }

    // REGISTRAR AUSENCIA (CORREGIDO)
    async registrarAusencia(req, res, next) {
        try {
            // 1. Primero extraemos los datos del cuerpo
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;

            // 2. Validamos que existan
            if (!id_medico || !fecha_inicio || !fecha_fin || !tipo) {
                return res.status(400).send("Faltan datos obligatorios.");
            }

            // 3. Ahora que fecha_inicio y fecha_fin existen, creamos los objetos Date
            const inicio = new Date(fecha_inicio);
            const fin = new Date(fecha_fin);

            if (fin < inicio) {
                return res.status(400).send("La fecha de fin no puede ser anterior a la de inicio.");
            }

            // 4. Guardamos en la base de datos
            await Agenda.registrarAusencia({
                id_medico,
                fecha_inicio,
                fecha_fin,
                tipo,
                descripcion: descripcion || ''
            });

            res.redirect('/secretaria?status=ausencia_success');

        } catch (error) {
            console.error("Error en registrarAusencia:", error);
            next(error);
        }
    }
}

module.exports = new SecretariaController();