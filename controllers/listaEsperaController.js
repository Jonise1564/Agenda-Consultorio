const createConnection = require('../config/configDb');
const ListaEspera = require('../models/listaEsperaModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');
const Paciente = require('../models/pacientesModels');
const Turno = require('../models/turnosModels');
const EmailService = require('../services/emailService'); // Ruta ajustada

class ListaEsperaController {

    //Muestra la lista de pacientes en espera y busca huecos disponibles
    async index(req, res, next) {
        try {
            const espera = await ListaEspera.getPendientes();

            const esperaConHuecos = await Promise.all(espera.map(async (item) => {
                const hueco = await Turno.buscarPrimerHuecoLibre(item.id_medico, item.id_especialidad);
                return {
                    ...item,
                    hueco_disponible: hueco
                };
            }));

            res.render('secretaria/lista_espera/index', { espera: esperaConHuecos });
        } catch (error) {
            console.error("Error en index ListaEspera:", error);
            next(error);
        }
    }


    // Procesa la asignación de un turno desde la lista de espera con notificación
    async asignarTurnoRapido(req, res, next) {
        let conn;
        try {
            // 1. Extraemos y limpiamos los parámetros
            const { esperaId, id_paciente, fecha, hora, id_medico, notificar } = req.query;

            // Convertimos a números para evitar errores de comparación en el SQL
            const pId = parseInt(id_paciente);
            const mId = parseInt(id_medico);
            const eId = parseInt(esperaId);

            conn = await createConnection();
            await conn.beginTransaction();

            // 2. Obtenemos datos de la solicitud (para sacar la especialidad)
            const solicitud = await ListaEspera.getById(eId);
            const datosPaciente = await Paciente.getDatosCompletos(pId);

            if (!solicitud || !datosPaciente) {
                await conn.rollback();
                console.error("❌ No existe la solicitud o el paciente");
                return res.redirect('/secretaria/lista-espera?status=error_no_existe');
            }

            // --- VERIFICACIÓN DE SEGURIDAD REFORZADA ---
            // Buscamos si el paciente YA TIENE un turno para este médico y especialidad
            const [turnoPrevio] = await conn.query(
                `SELECT t.id FROM turnos t
             INNER JOIN agendas a ON t.id_agenda = a.id
             WHERE t.id_paciente = ? 
             AND a.id_medico = ? 
             AND a.id_especialidad = ?
             AND t.fecha >= CURDATE()
             AND t.estado IN ('Confirmado', 'Pendiente')
             LIMIT 1`,
                [pId, mId, solicitud.id_especialidad]
            );

            // Si la consulta devuelve algo, es que ya tiene turno. BLOQUEAMOS.
            if (turnoPrevio.length > 0) {
                await conn.rollback();
                console.warn(`⚠️ Bloqueo: El paciente ${pId} ya tiene turno con médico ${mId}`);
                return res.redirect('/secretaria/lista-espera?status=error_ya_tiene_turno');
            }

            // 3. Buscamos la agenda para la fecha solicitada
            const [agenda] = await conn.query(
                `SELECT id FROM agendas 
             WHERE id_medico = ? AND id_especialidad = ? 
             AND ? BETWEEN fecha_creacion AND fecha_fin 
             LIMIT 1`,
                [mId, solicitud.id_especialidad, fecha]
            );

            if (!agenda || agenda.length === 0) {
                await conn.rollback();
                return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
            }

            // 4. Creamos el turno
            await conn.query(
                `INSERT INTO turnos (fecha, hora_inicio, motivo, id_paciente, id_agenda, estado) 
             VALUES (?, ?, ?, ?, ?, 'Confirmado')`,
                [fecha, hora, 'Asignado desde Lista de Espera', pId, agenda[0].id]
            );

            // 5. Actualizamos la lista de espera
            await conn.query(
                `UPDATE lista_espera SET estado = 'Turno Asignado' WHERE id = ?`,
                [eId]
            );

            // Confirmamos cambios
            await conn.commit();

            // 6. Notificación (Opcional, no bloquea la redirección)
            if (notificar === 'true' && datosPaciente.email) {
                EmailService.enviarConfirmacion(datosPaciente.email, {
                    nombre: `${datosPaciente.nombre} ${datosPaciente.apellido}`,
                    fecha: fecha,
                    hora: hora,
                    medico: `Dr/a. ${solicitud.medico_apellido}`,
                    especialidad: solicitud.especialidad_nombre
                }).catch(e => console.error("Error envío mail:", e));
            }

            res.redirect('/secretaria/lista-espera?status=success');

        } catch (error) {
            if (conn) await conn.rollback();
            console.error("❌ Error en asignarTurnoRapido:", error);
            res.redirect('/secretaria/lista-espera?status=error');
        } finally {
            if (conn) await conn.end();
        }
    }







    //Muestra el formulario para agregar a la lista de espera
    async create(req, res, next) {
        try {
            const { id_medico, id_especialidad, id_paciente } = req.query;

            const [medicos, especialidades, pacienteData] = await Promise.all([
                Medico.getProfesionalesParaAgendas(),
                typeof Especialidad.getAll === 'function' ? Especialidad.getAll() : Especialidad.listar(),
                id_paciente ? Paciente.getDatosCompletos(id_paciente) : null
            ]);

            res.render('secretaria/lista_espera/crear', {
                medicos,
                especialidades,
                id_medico: id_medico || '',
                id_especialidad: id_especialidad || '',
                id_paciente: id_paciente || '',
                paciente: pacienteData
            });
        } catch (error) {
            console.error("Error en create ListaEspera:", error.message);
            next(error);
        }
    }


    // Verifica duplicados
    async verificarDuplicado(req, res, next) {
        try {
            const { paciente, medico, especialidad } = req.query;

            if (!paciente || !medico || !especialidad) {
                return res.json({ existe: false });
            }

            const verificacion = await ListaEspera.verificarSiExiste(paciente, medico, especialidad);

            // CORRECCIÓN: Validamos las propiedades internas del objeto
            const existeRealmente = verificacion.enLista || verificacion.tieneTurno;

            res.json({
                existe: existeRealmente,
                enLista: verificacion.enLista,
                tieneTurno: verificacion.tieneTurno
            });
        } catch (error) {
            console.error("Error en verificación:", error);
            res.status(500).json({ existe: false, error: error.message });
        }
    }


    // Guarda un nuevo registro
    async store(req, res, next) {
        try {
            // 1. EXTRAER SOLO LO NECESARIO
            const { id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones } = req.body;

            // 2. FORZAR TIPOS DE DATOS
            const pId = parseInt(id_paciente);
            const mId = parseInt(id_medico);
            const eId = parseInt(id_especialidad);

            if (isNaN(pId) || isNaN(mId) || isNaN(eId)) {
                return res.status(400).send("Error: Los identificadores deben ser numéricos.");
            }

            // 3. VALIDACIÓN DE INTEGRIDAD
            const [pacienteExiste, medicoExiste] = await Promise.all([
                Paciente.getById(pId),
                Medico.obtenerPorId(mId)
            ]);

            if (!pacienteExiste || !medicoExiste) {
                return res.status(404).send("Error: El paciente o médico seleccionado no es válido.");
            }

            // 4. BLOQUEO DE DUPLICADOS Y TURNOS EXISTENTES (Lógica actualizada)
            const verificacion = await ListaEspera.verificarSiExiste(pId, mId, eId);

            // Si ya tiene un turno agendado, prioridad absoluta al turno
            if (verificacion.tieneTurno) {
                console.log("⚠️ Bloqueo: El paciente ya tiene un turno activo para este médico.");
                return res.redirect('/secretaria/lista-espera?status=error_ya_tiene_turno');
            }

            // Si ya está en la lista de espera
            if (verificacion.enLista) {
                console.log("⚠️ Duplicado bloqueado: El paciente ya está en lista de espera.");
                return res.redirect('/secretaria/lista-espera?status=duplicado');
            }

            // 5. SANITIZACIÓN Y CREACIÓN
            const data = {
                id_paciente: pId,
                id_medico: mId,
                id_especialidad: eId,
                prioridad: ['Alta', 'Media', 'Baja'].includes(prioridad) ? prioridad : 'Media',
                motivo_prioridad: motivo_prioridad ? motivo_prioridad.toString().substring(0, 255) : null,
                observaciones: observaciones ? observaciones.toString().substring(0, 500) : null,
                id_usuario_creador: (req.user && req.user.id) ? req.user.id : 1
            };

            await ListaEspera.create(data);
            res.redirect('/secretaria/lista-espera?status=success');

        } catch (error) {
            console.error("❌ Error crítico en store ListaEspera:", error);
            next(error);
        }
    }

    async actualizarEstado(req, res, next) {
        try {
            const { id } = req.params;
            const { nuevo_estado } = req.body;
            await ListaEspera.updateEstado(id, nuevo_estado);
            res.redirect('/secretaria/lista-espera');
        } catch (error) { next(error); }
    }

    async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await ListaEspera.delete(id);
            res.redirect('/secretaria/lista-espera');
        } catch (error) { next(error); }
    }
}

module.exports = new ListaEsperaController();