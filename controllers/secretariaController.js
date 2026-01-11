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

    // Buscadores
    async buscarPacientePorDNI(req, res) {
        try {
            const query = req.query.q;
            const resultados = await Paciente.buscar(query);
            res.json(resultados);
        } catch (error) { res.status(500).json([]); }
    }

    async buscarMedicos(req, res) {
        try {
            const query = req.query.q;
            const resultados = await Medico.buscar(query);
            res.json(resultados);
        } catch (error) { res.status(500).json([]); }
    }

    // Nueva vista: Lista general de turnos con filtros
    // async verListaTurnos(req, res, next) {
    //     try {
    //         const { paciente, profesional } = req.query;


    //         const turnos = await Turno.listarConFiltros({
    //             paciente: paciente || null,
    //             profesional: profesional || null
    //         });

    //         const medicos = await Medico.listar(); // Para el modal de traslado

    //         res.render('secretaria/lista_turnos', {
    //             turnos,
    //             medicos,
    //             filtros: { paciente, profesional }
    //         });
    //     } catch (error) {
    //         console.error("Error en verListaTurnos:", error);
    //         next(error);
    //     }
    // }

async verListaTurnos(req, res, next) {
        try {
            // 1. Capturamos también el parámetro 'fecha' desde la URL
            const { paciente, profesional, fecha } = req.query;

            // 2. Pasamos 'fecha' al modelo
            const turnos = await Turno.listarConFiltros({
                paciente: paciente || null,
                profesional: profesional || null,
                fecha: fecha || null  // <--- Agregado aquí
            });

            const medicos = await Medico.listar(); 

            // 3. Enviamos 'fecha' de vuelta a la vista para que el input no se vacíe
            res.render('secretaria/lista_turnos', {
                turnos,
                medicos,
                filtros: { paciente, profesional, fecha } // <--- Agregado aquí
            });
        } catch (error) {
            console.error("Error en verListaTurnos:", error);
            next(error);
        }
    }





    // Acción masiva: Transferir todos los turnos de un médico a otro
    async transferirAgenda(req, res, next) {
        try {
            const { id_medico_origen, id_medico_destino, fecha, id_especialidad } = req.body;

            if (id_medico_origen === id_medico_destino) {
                return res.redirect('/secretaria?status=error_mismo_medico');
            }

            // Esta lógica debe ejecutarse en el modelo para asegurar la integridad
            const resultado = await Turno.transferirMasivo({
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





}

module.exports = new SecretariaController();