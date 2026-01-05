const Agenda = require('../models/agendasModels');
const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');

const {
  obtenerDiaSemana,
  obtenerFechaFormateada
} = require('../utils/dateFormatter');

// =========================
// HELPERS HORARIOS
// =========================
function normalizarHora(hora) {
  return hora.slice(0, 5); // HH:mm
}

function sumarMinutos(hora, minutos) {
  const [h, m] = hora.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m + minutos);
  return date.toTimeString().slice(0, 5);
}

function generarSlots(agenda) {
  const slots = [];

  let actual = normalizarHora(agenda.hora_inicio);
  const fin = normalizarHora(agenda.hora_fin);

  while (actual < fin) {
    slots.push(actual);
    actual = sumarMinutos(actual, agenda.duracion_turnos);
  }

  return slots;
}

// =========================
// CONTROLLER
// =========================
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
        fechaSeleccionada: null,
        diaSemana: null,
        sinTurnosDia: false,
        sinTurnosSemana: false
      });

    } catch (error) {
      next(error);
    }
  }

  // =========================
  // DISPONIBILIDAD
  // =========================
  async disponibilidad(req, res, next) {
    try {
      const { id_medico, id_especialidad, fecha } = req.query;

      const especialidades = await Especialidad.getAll();
      const medicos = await Medico.listar();

      // =========================
      // CARGA INICIAL
      // =========================
      if (!id_medico || !fecha) {
        return res.render('secretaria/index', {
          especialidades,
          medicos,
          horarios: [],
          otrasFechas: [],
          fechaSeleccionada: null,
          diaSemana: null,
          sinTurnosDia: false,
          sinTurnosSemana: false
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

      const fechaDate = new Date(fecha + 'T00:00:00');

      if (!agendas || agendas.length === 0) {
        return res.render('secretaria/index', {
          especialidades,
          medicos,
          horarios: [],
          otrasFechas: [],
          fechaSeleccionada: obtenerFechaFormateada(fechaDate),
          diaSemana: obtenerDiaSemana(fecha),
          sinTurnosDia: false,
          sinTurnosSemana: true
        });
      }

      const agenda = agendas[0];

      // =========================
      // GENERAR SLOTS
      // =========================
      const slots = generarSlots(agenda);

      // =========================
      // TURNOS OCUPADOS (SOLO ESA AGENDA)
      // =========================
      const turnosTomados = await Turno.obtenerHorariosOcupados(
        agenda.id,
        fecha
      );

      // =========================
      // FILTRAR DISPONIBLES
      // =========================
      const horariosDisponibles = slots.filter(
        h => !turnosTomados.includes(h)
      );

      // =========================
      // RENDER FINAL
      // =========================
      return res.render('secretaria/index', {
        especialidades,
        medicos,
        horarios: horariosDisponibles,
        otrasFechas: [],
        fechaSeleccionada: obtenerFechaFormateada(fechaDate),
        diaSemana: obtenerDiaSemana(fecha),
        sinTurnosDia: horariosDisponibles.length === 0,
        sinTurnosSemana: false
      });

    } catch (error) {
      next(error);
    }
  }

  // =========================
  // BUSCAR AGENDAS (LEGACY)
  // =========================
  async buscarAgendas(req, res, next) {
    try {
      const { especialidad, medico, fecha } = req.query;

      const agendas = await Agenda.buscarDisponibles({
        especialidad,
        medico,
        fecha
      });

      res.render('secretaria/buscarAgendas', { agendas });

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

      res.render('secretaria/agendarTurno', { turno });

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
