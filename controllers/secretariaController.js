// // const Agenda = require('../models/agendasModels');
// // const Turno = require('../models/turnosModels');
// // const Paciente = require('../models/pacientesModels');
// // const Medico = require('../models/medicosModels');
// // const Especialidad = require('../models/especialidadesModels');
// // // console.log(' secretariaController cargado');


// // class SecretariaController {

// //     // =========================
// //     // PANEL PRINCIPAL
// //     // =========================
// //     async index(req, res) {
// //         const especialidades = await Especialidad.getAll();
// //        const medicos = await Medico.listar();

// //         res.render('secretaria/index', {
// //             especialidades,
// //             medicos
// //         });
// //     }

// //     // =========================
// //     // BUSCAR AGENDAS
// //     // =========================
// //     async buscarAgendas(req, res) {
// //         const { especialidad, medico, fecha } = req.query;

// //         const agendas = await Agenda.buscarDisponibles({
// //             especialidad,
// //             medico,
// //             fecha
// //         });

// //         res.render('secretaria/buscarAgendas', {
// //             agendas
// //         });
// //     }

// //     // =========================
// //     // FORM AGENDAR TURNO
// //     // =========================
// //     async agendarForm(req, res) {
// //         const { idTurno } = req.params;

// //         const turno = await Turno.getById(idTurno);

// //         res.render('secretaria/agendarTurno', {
// //             turno
// //         });
// //     }

// //     // =========================
// //     // GUARDAR TURNO
// //     // =========================
// //     async agendar(req, res) {
// //         const { idTurno } = req.params;
// //         const { id_paciente } = req.body;

// //         await Turno.update(idTurno, {
// //             estado: 'Reservado',
// //             id_paciente
// //         });

// //         res.redirect('/secretaria');
// //     }

// //     // =========================
// //     // BUSCAR PACIENTE POR DNI
// //     // =========================
// //     async buscarPacientePorDNI(req, res) {
// //         const { dni } = req.query;

// //         const paciente = await Paciente.getByDNI(dni);

// //         res.json(paciente || null);
// //     }
// // }

// // module.exports = new SecretariaController();



// const Agenda = require('../models/agendasModels');
// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');

// const { obtenerDiaSemana } = require('../utils/dateFormatter');

// // =========================
// // Helpers horarios
// // =========================
// function sumarMinutos(hora, minutos) {
//     const [h, m] = hora.split(':').map(Number);
//     const date = new Date(2000, 0, 1, h, m + minutos);
//     return date.toTimeString().slice(0, 5);
// }

// function generarSlots(agenda) {
//     const slots = [];
//     let actual = agenda.hora_inicio;

//     while (actual < agenda.hora_fin) {
//         slots.push(actual);
//         actual = sumarMinutos(actual, agenda.duracion_turnos);
//     }

//     return slots;
// }

// class SecretariaController {

//     // =========================
//     // PANEL PRINCIPAL
//     // =========================
//     // async index(req, res, next) {
//     //     try {
//     //         const especialidades = await Especialidad.getAll();
//     //         const medicos = await Medico.listar();

//     //         res.render('secretaria/index', {
//     //             especialidades,
//     //             medicos,
//     //             horarios: [],
//     //             otrasFechas: [],
//     //             sinTurnosDia: false,
//     //             sinTurnosSemana: false
//     //         });

//     //     } catch (error) {
//     //         next(error);
//     //     }
//     // }


//     async index(req, res, next) {
//     try {
//         const especialidades = await Especialidad.getAll();
//         const medicos = await Medico.listar();

//         res.render('secretaria/index', {
//             especialidades,
//             medicos,
//             horarios: [],
//             otrasFechas: [],
//             sinTurnosDia: false,
//             sinTurnosSemana: false
//         });

//     } catch (error) {
//         next(error);
//     }
// }

//     // =========================
//     // DISPONIBILIDAD (AGENDA → HORARIOS)
//     // =========================
//     async disponibilidad(req, res, next) {
//         try {
//             const { medico, especialidad, fecha } = req.query;

//             const especialidades = await Especialidad.getAll();
//             const medicos = await Medico.listar();

//             if (!medico || !fecha) {
//                 return res.render('secretaria/index', {
//                     especialidades,
//                     medicos,
//                     horarios: [],
//                     otrasFechas: []
//                 });
//             }

//             // 1️⃣ Buscar agenda válida
//             const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
//                 medico,
//                 especialidad,
//                 fecha
//             );

//             // ❌ No hay agenda en la semana
//             if (!agendas.length) {
//                 return res.render('secretaria/index', {
//                     especialidades,
//                     medicos,
//                     sinTurnosSemana: true,
//                     fechaSeleccionada: fecha
//                 });
//             }

//             const agenda = agendas[0];

//             // 2️⃣ Generar slots teóricos
//             const slots = generarSlots(agenda);

//             // 3️⃣ Turnos ocupados
//             const turnosTomados = await Turno.obtenerHorariosOcupados(
//                 medico,
//                 fecha
//             );

//             // 4️⃣ Filtrar disponibles
//             const horariosDisponibles = slots.filter(
//                 h => !turnosTomados.includes(h)
//             );

//             // 5️⃣ Otras fechas con agenda
//             const otrasFechas = await Agenda.obtenerOtrasFechasDisponibles(
//                 medico,
//                 fecha
//             );

//             res.render('secretaria/index', {
//                 especialidades,
//                 medicos,
//                 horarios: horariosDisponibles,
//                 otrasFechas,
//                 fechaSeleccionada: fecha,
//                 diaSemana: obtenerDiaSemana(fecha),
//                 doctorSeleccionado: medico,
//                 sinTurnosDia: horariosDisponibles.length === 0
//             });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // =========================
//     // BUSCAR AGENDAS (vista legacy)
//     // =========================
//     async buscarAgendas(req, res, next) {
//         try {
//             const { especialidad, medico, fecha } = req.query;

//             const agendas = await Agenda.buscarDisponibles({
//                 especialidad,
//                 medico,
//                 fecha
//             });

//             res.render('secretaria/buscarAgendas', {
//                 agendas
//             });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // =========================
//     // FORM AGENDAR TURNO
//     // =========================
//     async agendarForm(req, res, next) {
//         try {
//             const { idTurno } = req.params;

//             const turno = await Turno.getById(idTurno);

//             res.render('secretaria/agendarTurno', {
//                 turno
//             });

//         } catch (error) {
//             next(error);
//         }
//     }

//     // =========================
//     // GUARDAR TURNO
//     // =========================
//     async agendar(req, res, next) {
//         try {
//             const { idTurno } = req.params;
//             const { id_paciente } = req.body;

//             await Turno.update(idTurno, {
//                 estado: 'Reservado',
//                 id_paciente
//             });

//             res.redirect('/secretaria');

//         } catch (error) {
//             next(error);
//         }
//     }

//     // =========================
//     // BUSCAR PACIENTE POR DNI
//     // =========================
//     async buscarPacientePorDNI(req, res, next) {
//         try {
//             const { dni } = req.query;

//             const paciente = await Paciente.getByDNI(dni);

//             res.json(paciente || null);

//         } catch (error) {
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


const { obtenerDiaSemana } = require('../utils/dateFormatter');

// =========================
// Helpers horarios
// =========================
function sumarMinutos(hora, minutos) {
    const [h, m] = hora.split(':').map(Number);
    const date = new Date(2000, 0, 1, h, m + minutos);
    return date.toTimeString().slice(0, 5);
}

function generarSlots(agenda) {
    const slots = [];
    let actual = agenda.hora_inicio;

    while (actual < agenda.hora_fin) {
        slots.push(actual);
        actual = sumarMinutos(actual, agenda.duracion_turnos);
    }

    return slots;
}

class SecretariaController {

    // =========================
    // PANEL PRINCIPAL
    // =========================
    async index(req, res, next) {
        try {
            const especialidades = await Especialidad.getAll();
            const medicos = await Medico.listar();

            res.render('secretaria/index', {
                especialidades,
                medicos,
                horarios: [],
                otrasFechas: [],
                sinTurnosDia: false,
                sinTurnosSemana: false
            });

        } catch (error) {
            next(error);
        }
    }

    // =========================
    // DISPONIBILIDAD (AGENDA → HORARIOS)
    // =========================
    // async disponibilidad(req, res, next) {
    //     try {
    //         // 🔑 IMPORTANTE: nombres iguales al form
    //         const {
    //             id_medico,
    //             id_especialidad,
    //             fecha
    //         } = req.query;

    //         console.log('QUERY RECIBIDA:', req.query);

    //         const especialidades = await Especialidad.getAll();
    //         const medicos = await Medico.listar();

    //         if (!id_medico || !fecha) {
    //             return res.render('secretaria/index', {
    //                 especialidades,
    //                 medicos,
    //                 horarios: [],
    //                 otrasFechas: []
    //             });
    //         }

    //         // 1️⃣ Buscar agenda válida
    //         const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
    //             id_medico,
    //             id_especialidad,
    //             fecha
    //         );

    //         // ❌ No hay agenda en la semana
    //         if (!agendas.length) {
    //             return res.render('secretaria/index', {
    //                 especialidades,
    //                 medicos,
    //                 sinTurnosSemana: true,
    //                 fechaSeleccionada: fecha
    //             });
    //         }

    //         const agenda = agendas[0];

    //         // 2️⃣ Generar slots teóricos
    //         const slots = generarSlots(agenda);

    //         // 3️⃣ Turnos ocupados
    //         const turnosTomados = await Turno.obtenerHorariosOcupados(
    //             id_medico,
    //             fecha
    //         );

    //         // 4️⃣ Filtrar disponibles
    //         const horariosDisponibles = slots.filter(
    //             h => !turnosTomados.includes(h)
    //         );

    //         // 5️⃣ Otras fechas con agenda
    //         const otrasFechas = await Agenda.obtenerOtrasFechasDisponibles(
    //             id_medico,
    //             fecha
    //         );

    //         // 6️⃣ Render
    //         res.render('secretaria/index', {
    //             especialidades,
    //             medicos,
    //             horarios: horariosDisponibles,
    //             otrasFechas,
    //             fechaSeleccionada: fecha,
    //             diaSemana: obtenerDiaSemana(fecha),
    //             doctorSeleccionado: id_medico,
    //             sinTurnosDia: horariosDisponibles.length === 0,
    //             sinTurnosSemana: false
    //         });

    //     } catch (error) {
    //         next(error);
    //     }
    // }

    async disponibilidad(req, res, next) {
  try {
    const { id_medico, id_especialidad, fecha } = req.query;

    const especialidades = await Especialidad.getAll();
    const medicos = await Medico.listar();

    // =========================
    // CARGA INICIAL (sin búsqueda)
    // =========================
    if (!id_medico || !fecha) {
      return res.render('secretaria/index', {
        especialidades,
        medicos,
        horarios: [],
        otrasFechas: [],
        sinTurnosDia: false,
        sinTurnosSemana: false,
        fechaSeleccionada: null
      });
    }

    // =========================
    // BUSCAR AGENDA
    // =========================
    const agendas = await Agenda.obtenerAgendaPorMedicoYFecha(
      id_medico,
      id_especialidad,
      fecha
    );

    // ❌ No hay agenda en esa semana
    if (!agendas || agendas.length === 0) {
      return res.render('secretaria/index', {
        especialidades,
        medicos,
        horarios: [],
        otrasFechas: [],
        sinTurnosSemana: true,
        sinTurnosDia: false,
        fechaSeleccionada: fecha
      });
    }

    const agenda = agendas[0];

    // =========================
    // GENERAR HORARIOS
    // =========================
    const slots = generarSlots(agenda);

    const turnosTomados = await Turno.obtenerHorariosOcupados(
      id_medico,
      fecha
    );

    const horariosDisponibles = slots.filter(
      h => !turnosTomados.includes(h)
    );

    // =========================
    // RESULTADO FINAL
    // =========================
    return res.render('secretaria/index', {
      especialidades,
      medicos,
      horarios: horariosDisponibles,
      otrasFechas: [],
      fechaSeleccionada: fecha,
      diaSemana: obtenerDiaSemana(fecha),
      sinTurnosDia: horariosDisponibles.length === 0,
      sinTurnosSemana: false
    });

  } catch (error) {
    next(error);
  }
}

    // =========================
    // BUSCAR AGENDAS (VISTA LEGACY)
    // =========================
    async buscarAgendas(req, res, next) {
        try {
            const { especialidad, medico, fecha } = req.query;

            const agendas = await Agenda.buscarDisponibles({
                especialidad,
                medico,
                fecha
            });

            res.render('secretaria/buscarAgendas', {
                agendas
            });

        } catch (error) {
            next(error);
        }
    }

    // =========================
    // FORM AGENDAR TURNO
    // =========================
    async agendarForm(req, res, next) {
        try {
            const { idTurno } = req.params;

            const turno = await Turno.getById(idTurno);

            res.render('secretaria/agendarTurno', {
                turno
            });

        } catch (error) {
            next(error);
        }
    }

    // =========================
    // GUARDAR TURNO
    // =========================
    async agendar(req, res, next) {
        try {
            const { idTurno } = req.params;
            const { id_paciente } = req.body;

            await Turno.update(idTurno, {
                estado: 'Reservado',
                id_paciente
            });

            res.redirect('/secretaria');

        } catch (error) {
            next(error);
        }
    }

    // =========================
    // BUSCAR PACIENTE POR DNI (AJAX)
    // =========================
    async buscarPacientePorDNI(req, res, next) {
        try {
            const { dni } = req.query;

            const paciente = await Paciente.getByDNI(dni);

            res.json(paciente || null);

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SecretariaController();


