// const Agenda = require('../models/agendasModels');
// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');

// const {
//   obtenerDiaSemana,
//   obtenerFechaFormateada
// } = require('../utils/dateFormatter');

// // =========================
// // HELPERS HORARIOS
// // =========================
// function normalizarHora(hora) {
//   return hora.slice(0, 5); // HH:mm
// }

// function sumarMinutos(hora, minutos) {
//   const [h, m] = hora.split(':').map(Number);
//   const date = new Date(2000, 0, 1, h, m + minutos);
//   return date.toTimeString().slice(0, 5);
// }

// // function generarSlots(agenda) {
// //   const slots = [];

// //   let actual = normalizarHora(agenda.hora_inicio);
// //   const fin = normalizarHora(agenda.hora_fin);

// //   while (actual < fin) {
// //     slots.push(actual);
// //     actual = sumarMinutos(actual, agenda.duracion_turnos);
// //   }

// //   return slots;
// // }


// function generarSlots(agenda) {
//   const slots = [];

//   // convertir HH:mm a minutos
//   const toMinutes = (h) => {
//     const [hh, mm] = h.split(':').map(Number);
//     return hh * 60 + mm;
//   };

//   // convertir minutos a HH:mm
//   const toHour = (m) => {
//     const hh = String(Math.floor(m / 60)).padStart(2, '0');
//     const mm = String(m % 60).padStart(2, '0');
//     return `${hh}:${mm}`;
//   };

//   const inicio = toMinutes(normalizarHora(agenda.hora_inicio));
//   const fin = toMinutes(normalizarHora(agenda.hora_fin));
//   const duracion = Number(agenda.duracion_turnos);

//   // 🔒 validaciones
//   if (!duracion || duracion <= 0) return [];
//   if (inicio >= fin) return [];

//   for (let actual = inicio; actual + duracion <= fin; actual += duracion) {
//     slots.push(toHour(actual));
//   }

//   return slots;
// }


// // =========================
// // CONTROLLER
// // =========================
// class SecretariaController {

//   // =========================
//   // PANEL PRINCIPAL
//   // =========================
//   async index(req, res, next) {
//     try {
//       const especialidades = await Especialidad.getAll();
//       const medicos = await Medico.listar();

//       res.render('secretaria/index', {
//         especialidades,
//         medicos,
//         horarios: [],
//         otrasFechas: [],
//         fechaSeleccionada: null,
//         diaSemana: null,
//         sinTurnosDia: false,
//         sinTurnosSemana: false
//       });

//     } catch (error) {
//       next(error);
//     }
//   }

//   // =========================
//   // DISPONIBILIDAD
//   // =========================
//   // async disponibilidad(req, res, next) {
//   //   try {
//   //     const { id_medico, id_especialidad, fecha } = req.query;

//   //     const especialidades = await Especialidad.getAll();
//   //     const medicos = await Medico.listar();

//   //     // =========================
//   //     // CARGA INICIAL
//   //     // =========================
//   //     if (!id_medico || !fecha) {
//   //       return res.render('secretaria/index', {
//   //         especialidades,
//   //         medicos,
//   //         horarios: [],
//   //         otrasFechas: [],
//   //         fechaSeleccionada: null,
//   //         diaSemana: null,
//   //         sinTurnosDia: false,
//   //         sinTurnosSemana: false
//   //       });
//   //     }

//   //     // =========================
//   //     // BUSCAR AGENDA
//   //     // =========================
//   //     const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
//   //       id_medico,
//   //       id_especialidad,
//   //       fecha
//   //     );

//   //     const fechaDate = new Date(fecha + 'T00:00:00');

//   //     if (!agendas || agendas.length === 0) {
//   //       return res.render('secretaria/index', {
//   //         especialidades,
//   //         medicos,
//   //         horarios: [],
//   //         otrasFechas: [],
//   //         fechaSeleccionada: obtenerFechaFormateada(fechaDate),
//   //         diaSemana: obtenerDiaSemana(fecha),
//   //         sinTurnosDia: false,
//   //         sinTurnosSemana: true
//   //       });
//   //     }

//   //     const agenda = agendas[0];

//   //     // =========================
//   //     // GENERAR SLOTS
//   //     // =========================
//   //     const slots = generarSlots(agenda);

//   //     // =========================
//   //     // TURNOS OCUPADOS (SOLO ESA AGENDA)
//   //     // =========================
//   //     const turnosTomados = await Turno.obtenerHorariosOcupados(
//   //       agenda.id,
//   //       fecha
//   //     );

//   //     // =========================
//   //     // FILTRAR DISPONIBLES
//   //     // =========================
//   //     const horariosDisponibles = slots.filter(
//   //       h => !turnosTomados.includes(h)
//   //     );

//   //     // =========================
//   //     // RENDER FINAL
//   //     // =========================
//   //     return res.render('secretaria/index', {
//   //       especialidades,
//   //       medicos,
//   //       horarios: horariosDisponibles,
//   //       otrasFechas: [],
//   //       fechaSeleccionada: obtenerFechaFormateada(fechaDate),
//   //       diaSemana: obtenerDiaSemana(fecha),
//   //       sinTurnosDia: horariosDisponibles.length === 0,
//   //       sinTurnosSemana: false
//   //     });

//   //   } catch (error) {
//   //     next(error);
//   //   }
//   // }


//   async disponibilidad(req, res, next) {
//     try {
//       const { id_medico, id_especialidad, fecha } = req.query;

//       const especialidades = await Especialidad.getAll();
//       const medicos = await Medico.listar();

//       if (!id_medico || !id_especialidad || !fecha) {
//         return res.render('secretaria/index', {
//           especialidades,
//           medicos,
//           horarios: [],
//           otrasFechas: [],
//           fechaSeleccionada: null,
//           diaSemana: null,
//           sinTurnosDia: false,
//           sinTurnosSemana: false
//         });
//       }

//       const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
//         id_medico,
//         id_especialidad,
//         fecha
//       );

//       const fechaDate = new Date(fecha + 'T00:00:00');

//       if (!agendas || agendas.length === 0) {
//         return res.render('secretaria/index', {
//           especialidades,
//           medicos,
//           horarios: [],
//           otrasFechas: [],
//           fechaSeleccionada: obtenerFechaFormateada(fechaDate),
//           diaSemana: obtenerDiaSemana(fecha),
//           sinTurnosDia: false,
//           sinTurnosSemana: true
//         });
//       }

//       const agenda = agendas[0];

//       // ✅ TRAER TURNOS REALES
//       const turnosDisponibles = await Turno.obtenerTurnosDisponibles(
//         agenda.id,
//         fecha
//       );

//       return res.render('secretaria/index', {
//         especialidades,
//         medicos,
//         horarios: turnosDisponibles, // 👈 objetos reales
//         otrasFechas: [],
//         fechaSeleccionada: obtenerFechaFormateada(fechaDate),
//         diaSemana: obtenerDiaSemana(fecha),
//         sinTurnosDia: turnosDisponibles.length === 0,
//         sinTurnosSemana: false
//       });

//     } catch (error) {
//       next(error);
//     }
//   }


//   // =========================
//   // BUSCAR AGENDAS 
//   // =========================
//   async buscarAgendas(req, res, next) {
//     try {
//       const { especialidad, medico, fecha } = req.query;

//       const agendas = await Agenda.buscarDisponibles({
//         especialidad,
//         medico,
//         fecha
//       });

//       res.render('secretaria/buscarAgendas', { agendas });

//     } catch (error) {
//       next(error);
//     }
//   }

//   // =========================
//   // FORM AGENDAR TURNO
//   // =========================
//   async agendarForm(req, res, next) {
//     try {
//       const { idTurno } = req.params;

//       const turno = await Turno.getById(idTurno);

//       res.render('secretaria/agendarTurno', { turno });

//     } catch (error) {
//       next(error);
//     }
//   }

//   // =========================
//   // GUARDAR TURNO
//   // =========================
//   async agendar(req, res, next) {
//     try {
//       const { idTurno } = req.params;
//       const { id_paciente } = req.body;

//       await Turno.update(idTurno, {
//         estado: 'Reservado',
//         id_paciente
//       });

//       res.redirect('/secretaria');

//     } catch (error) {
//       next(error);
//     }
//   }

//   // =========================
//   // BUSCAR PACIENTE POR DNI (AJAX)
//   // =========================
//   async buscarPacientePorDNI(req, res, next) {
//     try {
//       const { dni } = req.query;

//       const paciente = await Paciente.getByDNI(dni);

//       res.json(paciente || null);

//     } catch (error) {
//       next(error);
//     }
//   }
// }

// module.exports = new SecretariaController();




// const Agenda = require('../models/agendasModels');
// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');

// const {
//     obtenerDiaSemana,
//     obtenerFechaFormateada
// } = require('../utils/dateFormatter');

// // =========================
// // HELPERS HORARIOS
// // =========================
// function normalizarHora(hora) {
//     return hora.slice(0, 5); // HH:mm
// }

// class SecretariaController {

//     // ========================================
//     // 1. VISTA PRINCIPAL (Carga inicial)
//     // ========================================
//     async index(req, res, next) {
//         try {
//             const especialidades = await Especialidad.getAll();
//             const medicos = await Medico.listar();

//             res.render('secretaria/index', {
//                 especialidades,
//                 medicos,
//                 // Variables para evitar errores de undefined en la vista
//                 horarios: [],
//                 fechaSeleccionada: null,
//                 diaSemana: null,
//                 sinTurnosDia: false
//             });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // ========================================
//     // 2. DISPONIBILIDAD (Responde al Fetch del Panel)
//     // ========================================
//     async disponibilidad(req, res, next) {
//         try {
//             const { id_medico, id_especialidad, fecha } = req.query;

//             if (!id_medico || !id_especialidad || !fecha) {
//                 return res.send('<p class="text-center text-muted">Faltan datos de consulta</p>');
//             }

//             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
//                 id_medico,
//                 id_especialidad,
//                 fecha
//             );

//             if (!agendas || agendas.length === 0) {
//                 return res.send('<div class="text-center mt-4"><i class="fa-solid fa-calendar-xmark text-danger fs-1 d-block mb-2"></i><p>El médico no atiende en esta fecha.</p></div>');
//             }

//             const agenda = agendas[0];

//             // Traer turnos libres (que ya existen en la DB para esa agenda y fecha)
//             const turnosDisponibles = await Turno.obtenerTurnosDisponibles(
//                 agenda.id,
//                 fecha
//             );

//             // Generamos el HTML de los botones que el Panel va a "inyectar"
//             if (turnosDisponibles.length === 0) {
//                 return res.send('<p class="text-center text-warning mt-4">No hay turnos disponibles para este día.</p>');
//             }

//             let html = "";
//             turnosDisponibles.forEach(t => {
//                 const hora = normalizarHora(t.hora_inicio);
//                 html += `
//                     <div class="slot-hora" 
//                          data-id="${t.id}" 
//                          onclick="seleccionarSlot(this, '${t.id}', '${hora}')">
//                         <span>${hora}</span>
//                     </div>`;
//             });

//             res.send(html);

//         } catch (error) {
//             console.error("Error en disponibilidad:", error);
//             res.status(500).send("Error al cargar horarios");
//         }
//     }

//     // ========================================
//     // 3. GUARDAR RESERVA (Procesa el Formulario)
//     // ========================================
//     async agendar(req, res, next) {
//         try {
//             const { idTurno } = req.params; // El ID que el JS pondrá en el action
//             const { id_paciente, motivo } = req.body;

//             // req.file lo genera Multer si se subió un archivo
//             const archivo_dni = req.file ? req.file.filename : null;

//             if (!idTurno || !id_paciente) {
//                 return res.status(400).send("Datos incompletos para la reserva");
//             }

//             // Actualizamos el turno que estaba libre con los datos del paciente
//             await Turno.update(idTurno, {
//                 estado: 'Reservado',
//                 id_paciente,
//                 motivo: motivo || 'Turno solicitado en secretaría',
//                 archivo_dni
//             });

//             // Redirigimos al panel con un mensaje de éxito
//             res.redirect('/secretaria?status=success');

//         } catch (error) {
//             console.error("Error al agendar turno:", error);
//             next(error);
//         }
//     }

//     // ========================================
//     // 4. BUSCADORES (Autocomplete)
//     // ========================================
//     async buscarPacientePorDNI(req, res, next) {
//         try {
//             const { q } = req.query; // Cambiado a 'q' para coincidir con tu JS
//             if (!q) return res.json([]);

//             // Asumimos que tienes un método que busque por coincidencia parcial
//             const pacientes = await Paciente.buscar(q); 
//             res.json(pacientes);
//         } catch (error) {
//             res.status(500).json({ error: "Error en búsqueda" });
//         }
//     }

//     async buscarMedicos(req, res, next) {
//         try {
//             const { q } = req.query;
//             const medicos = await Medico.buscar(q); // Método para el autocomplete
//             res.json(medicos);
//         } catch (error) {
//             res.status(500).json({ error: "Error en búsqueda de médicos" });
//         }
//     }
// }

// module.exports = new SecretariaController();

// const Agenda = require('../models/agendasModels');
// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');

// // =========================
// // HELPERS HORARIOS
// // =========================
// function normalizarHora(hora) {
//     if (!hora) return "--:--";
//     return hora.slice(0, 5); // HH:mm
// }

// class SecretariaController {

//     // ========================================
//     // 1. VISTA PRINCIPAL
//     // ========================================
//     async index(req, res, next) {
//         try {
//             // Cargamos datos necesarios para los selects iniciales
//             const especialidades = await Especialidad.getAll();
//             const medicos = await Medico.listar();

//             res.render('secretaria/index', {
//                 especialidades,
//                 medicos,
//                 status: req.query.status || null // Para alertas de éxito
//             });
//         } catch (error) {
//             console.error("Error index secretaria:", error);
//             next(error);
//         }
//     }

//     // ========================================
//     // 2. DISPONIBILIDAD (Responde al Fetch del Panel)
//     // ========================================
//     async disponibilidad(req, res, next) {
//         try {
//             const { id_medico, id_especialidad, fecha } = req.query;

//             if (!id_medico || !id_especialidad || !fecha) {
//                 return res.send('<p class="text-center text-muted">Faltan datos para la consulta.</p>');
//             }

//             // Primero verificamos si el médico tiene una regla de agenda ese día
//             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
//                 id_medico,
//                 id_especialidad,
//                 fecha
//             );

//             if (!agendas || agendas.length === 0) {
//                 return res.send(`
//                     <div class="text-center mt-4">
//                         <i class="fa-solid fa-calendar-xmark text-danger fs-1 d-block mb-2"></i>
//                         <p class="fw-bold">Sin atención</p>
//                         <small>El médico no tiene agenda configurada para esta fecha.</small>
//                     </div>`);
//             }

//             // Si hay agenda, buscamos los turnos "Libres" físicos en la DB
//             const agenda = agendas[0];
//             const turnosDisponibles = await Turno.obtenerTurnosDisponibles(
//                 agenda.id,
//                 fecha
//             );

//             if (!turnosDisponibles || turnosDisponibles.length === 0) {
//                 return res.send(`
//                     <div class="text-center mt-4">
//                         <i class="fa-solid fa-clock text-warning fs-1 d-block mb-2"></i>
//                         <p class="fw-bold">Agenda Completa</p>
//                         <small>No quedan turnos disponibles para este día.</small>
//                     </div>`);
//             }

//             // Construimos los slots que el JavaScript del PUG inyectará
//             let html = "";
//             turnosDisponibles.forEach(t => {
//                 const hora = normalizarHora(t.hora_inicio);
//                 html += `
//                     <div class="slot-hora" data-id="${t.id}">
//                         <span>${hora}</span>
//                     </div>`;
//             });

//             res.send(html);

//         } catch (error) {
//             console.error("Error en disponibilidad:", error);
//             res.status(500).send('<p class="text-danger">Error interno al cargar horarios</p>');
//         }
//     }

//     // ========================================
//     // 3. GUARDAR RESERVA (POST)
//     // ========================================
//     async agendar(req, res, next) {
//         try {
//             const { idTurno } = req.params; 
//             const { id_paciente, motivo } = req.body;

//             // Archivo gestionado por Multer (archivo_dni)
//             const archivo_dni = req.file ? req.file.filename : null;

//             if (!idTurno || !id_paciente) {
//                 return res.status(400).send("Faltan datos obligatorios (Turno o Paciente)");
//             }

//             // Actualizamos el estado del turno
//             await Turno.update(idTurno, {
//                 estado: 'Reservado',
//                 id_paciente,
//                 motivo: motivo || 'Turno solicitado en secretaría',
//                 archivo_dni: archivo_dni
//             });

//             // Éxito: Redirección al panel
//             res.redirect('/secretaria?status=success');

//         } catch (error) {
//             console.error("Error al agendar turno:", error);
//             next(error);
//         }
//     }

//     // ========================================
//     // 4. BUSCADORES (Autocomplete JSON)
//     // ========================================
//     async buscarPacientePorDNI(req, res, next) {
//         try {
//             const { q } = req.query;
//             if (!q) return res.json([]);

//             const pacientes = await Paciente.buscar(q); 
//             res.json(pacientes || []);
//         } catch (error) {
//             console.error("Error búsqueda paciente:", error);
//             res.status(500).json([]);
//         }
//     }

//     async buscarMedicos(req, res, next) {
//         try {
//             const { q } = req.query;
//             if (!q) return res.json([]);

//             const medicos = await Medico.buscar(q); 
//             res.json(medicos || []);
//         } catch (error) {
//             console.error("Error búsqueda médico:", error);
//             res.status(500).json([]);
//         }
//     }
// }

// module.exports = new SecretariaController();

// const Agenda = require('../models/agendasModels');
// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');

// function normalizarHora(hora) {
//     if (!hora) return "--:--";
//     return hora.slice(0, 5); 
// }

// class SecretariaController {

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

//     // ========================================
//     // 2. DISPONIBILIDAD (CON SLOTS VIRTUALES)
//     // ========================================
//     async disponibilidad(req, res, next) {
//         try {
//             const { id_medico, id_especialidad, fecha } = req.query;

//             if (!id_medico || !id_especialidad || !fecha) {
//                 return res.send('<p class="text-center text-muted">Faltan datos para la consulta.</p>');
//             }

//             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);

//             if (!agendas || agendas.length === 0) {
//                 return res.send(`
//                     <div class="text-center mt-4">
//                         <i class="fa-solid fa-calendar-xmark text-danger fs-1 d-block mb-2"></i>
//                         <p class="fw-bold">Sin atención</p>
//                         <small>El médico no tiene agenda configurada para esta fecha.</small>
//                     </div>`);
//             }

//             const agenda = agendas[0];
//             // Obtenemos solo las horas que ya están ocupadas
//             const ocupados = await Turno.obtenerHorariosOcupados(agenda.id, fecha);

//             // --- LÓGICA DE GENERACIÓN DE SLOTS ---
//             let html = "";
//             let [h, m] = agenda.hora_inicio.split(':');
//             let actual = new Date(2000, 0, 1, h, m);
//             let [hFin, mFin] = agenda.hora_fin.split(':');
//             let fin = new Date(2000, 0, 1, hFin, mFin);

//             while (actual < fin) {
//                 const horaStr = actual.toTimeString().slice(0, 5);
                
//                 // Si la hora está en el array de 'ocupados', mostramos slot bloqueado
//                 if (ocupados.includes(horaStr)) {
//                     html += `
//                         <div class="slot-hora ocupado" title="No disponible" style="opacity:0.5; cursor:not-allowed; background:#e9ecef;">
//                             <span>${horaStr}</span>
//                         </div>`;
//                 } else {
//                     // Slot Virtual seleccionable
//                     html += `
//                         <div class="slot-hora" 
//                              data-hora="${horaStr}" 
//                              data-fecha="${fecha}" 
//                              data-agenda="${agenda.id}">
//                             <span>${horaStr}</span>
//                         </div>`;
//                 }
//                 actual.setMinutes(actual.getMinutes() + agenda.duracion_turnos);
//             }

//             res.send(html || '<p class="text-center">No hay horarios disponibles para el rango de agenda.</p>');

//         } catch (error) {
//             console.error("Error en disponibilidad:", error);
//             res.status(500).send('<p class="text-danger">Error al cargar horarios</p>');
//         }
//     }

//     // ========================================
//     // 3. GUARDAR RESERVA (UPSERT)
//     // ========================================
//     async agendar(req, res, next) {
//         try {
//             // Recibimos los datos del slot virtual y del paciente
//             const { id_paciente, motivo, fecha_turno, hora_seleccionada, id_agenda } = req.body;
//             const archivo_dni = req.file ? req.file.filename : null;

//             if (!id_paciente || !fecha_turno || !hora_seleccionada || !id_agenda) {
//                 return res.status(400).send("Faltan datos para procesar la reserva.");
//             }

//             // Usamos la nueva función del modelo que crea o actualiza
//             await Turno.agendarTurnoVirtual({
//                 fecha: fecha_turno,
//                 hora_inicio: hora_seleccionada,
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

//     // ... (Mantener buscadores de pacientes y médicos igual)
// }

// module.exports = new SecretariaController();

const Agenda = require('../models/agendasModels');
const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');

class SecretariaController {

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

    async disponibilidad(req, res, next) {
        try {
            const { id_medico, id_especialidad, fecha } = req.query;

            if (!id_medico || !id_especialidad || !fecha) {
                return res.send('<p class="text-center text-muted">Faltan datos para la consulta.</p>');
            }

            const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha);

            if (!agendas || agendas.length === 0) {
                return res.send(`
                    <div class="text-center mt-4">
                        <i class="fa-solid fa-calendar-xmark text-danger fs-1 d-block mb-2"></i>
                        <p class="fw-bold">Sin atención</p>
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
                        <div class="slot-hora ocupado" title="No disponible" style="opacity:0.5; cursor:not-allowed; background:#e9ecef; width: 85px; border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; text-align: center;">
                            <span>${horaStr}</span>
                        </div>`;
                } else {
                    html += `
                        <div class="slot-hora" 
                             data-hora="${horaStr}" 
                             data-agenda="${agenda.id}"
                             style="width: 85px; border: 2px solid #dee2e6; border-radius: 8px; padding: 12px 5px; text-align: center; cursor: pointer; background: white; font-weight: bold;">
                            <span>${horaStr}</span>
                        </div>`;
                }
                actual.setMinutes(actual.getMinutes() + agenda.duracion_turnos);
            }

            res.send(html || '<p class="text-center">No hay horarios disponibles.</p>');

        } catch (error) {
            console.error("Error en disponibilidad:", error);
            res.status(500).send('<p class="text-danger">Error al cargar horarios</p>');
        }
    }

    async agendar(req, res, next) {
        try {
            // Sincronizado con los atributos 'name' del Pug
            const { id_paciente, motivo, fecha, hora_inicio, id_agenda } = req.body;
            const archivo_dni = req.file ? req.file.filename : null;

            if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
                return res.status(400).send("Error 400: Faltan datos (Paciente, Fecha, Hora o Agenda).");
            }

            await Turno.agendarTurnoVirtual({
                fecha: fecha,
                hora_inicio: hora_inicio,
                id_agenda: id_agenda,
                id_paciente: id_paciente,
                motivo: motivo || 'Turno solicitado en secretaría',
                archivo_dni: archivo_dni
            });

            res.redirect('/secretaria?status=success');

        } catch (error) {
            console.error("Error al agendar turno:", error);
            next(error);
        }
    }

    // Buscadores (Asegúrate de que estos nombres coincidan con tus rutas)
    async buscarPacientePorDNI(req, res) {
        try {
            const query = req.query.q;
            const resultados = await Paciente.buscar(query); // Ajusta a tu modelo
            res.json(resultados);
        } catch (error) { res.status(500).json([]); }
    }

    async buscarMedicos(req, res) {
        try {
            const query = req.query.q;
            const resultados = await Medico.buscar(query); // Ajusta a tu modelo
            res.json(resultados);
        } catch (error) { res.status(500).json([]); }
    }
}

module.exports = new SecretariaController();