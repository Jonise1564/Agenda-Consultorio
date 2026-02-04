const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');
const Medico = require('../models/medicosModels'); // Necesario para el modal de traslado

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================
function formatearFecha(fecha) {
    if (!fecha) return '';
    const f = new Date(fecha);
    return `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`;
}

function fechaISO(fecha) {
    if (!fecha) return '';
    const f = new Date(fecha);
    return f.toISOString().split('T')[0];
}

function fechaParaInput(fecha) {
    if (!fecha) return '';
    const f = new Date(fecha);
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
}

class TurnosController {

    // ============================================
    // NUEVO: LISTADO GENERAL (PARA SECRETARÍA)
    // Este maneja el filtro de Profesional, Paciente y Fecha
    // ============================================
    async getTurnosGeneral(req, res) {
        try {
            // Capturamos los datos del formulario GET del PUG
            const { paciente, profesional, fecha } = req.query;

            // Llamamos al método que ya existe en tu modelo
            const turnos = await Turno.listarConFiltros({
                paciente,
                profesional,
                fecha
            });

            // Traemos médicos para que el modal de traslado tenga opciones
            const medicos = await Medico.getAll();

            res.render('secretaria/turnos', {
                turnos,
                medicos,
                filtros: { paciente, profesional, fecha }, // Mantiene los textos en los inputs
                status: req.query.status
            });
        } catch (error) {
            console.error("Error en getTurnosGeneral:", error);
            res.status(500).send("Error al cargar el listado de turnos");
        }
    }

    // LISTAR TURNOS POR AGENDA ESPECÍFICA
    async get(req, res) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') return res.redirect('/agendas');

            const turnos = await Turno.getAll(id);

            const turnosFormateados = turnos.map(t => ({
                ...t,
                fecha_formateada: formatearFecha(t.fecha),
                fecha_iso: fechaISO(t.fecha),
                hora_filtro: t.hora_inicio?.slice(0, 5),
                dni: t.paciente_dni ?? null,
                tiene_archivo: !!t.archivo_dni,
                ruta_archivo: t.archivo_dni ? `/uploads/dnis/${t.archivo_dni}` : null
            }));

            res.render('turnos/index', {
                turnos: turnosFormateados,
                id_agenda: id
            });
        } catch (error) {
            console.error("Error GET Turnos:", error);
            res.status(500).send("Error al cargar los turnos");
        }
    }

    // FORMULARIO RESERVAR
    async establecerForm(req, res) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') return res.redirect('/agendas');

            const turno = await Turno.getById(id);
            if (!turno) return res.status(404).send("Turno no encontrado");

            turno.fecha_formateada = formatearFecha(turno.fecha);
            turno.fecha_input = fechaParaInput(turno.fecha);

            res.render("turnos/reservar", { turno });
        } catch (error) {
            console.error("Error vista reservar:", error);
            res.status(500).send("Error interno");
        }
    }

    // GUARDAR RESERVA 
    // async reservar(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const { motivo, estado, id_paciente, id_agenda, fecha, hora_inicio } = req.body;

    //         let agendaIdDestino = id_agenda;
    //         if (!agendaIdDestino && id !== 'undefined') {
    //             const tActual = await Turno.getById(id);
    //             agendaIdDestino = tActual ? tActual.id_agenda : null;
    //         }

    //         const archivo_dni = req.file ? req.file.filename : null;

    //         const datosTurno = {
    //             fecha,
    //             hora_inicio,
    //             motivo,
    //             estado: estado || 'pendiente',
    //             id_paciente: id_paciente || null,
    //             id_agenda: agendaIdDestino,
    //             ...(archivo_dni && { archivo_dni })
    //         };

    //         if (id && id !== 'undefined') {
    //             // Ojo: verifica si tu modelo usa 'update' o 'actualizar'
    //             await Turno.actualizar(id, datosTurno);
    //         } else {
    //             await Turno.create(datosTurno);
    //         }

    //         res.redirect(agendaIdDestino ? `/turnos/${agendaIdDestino}` : '/agendas');

    //     } catch (error) {
    //         console.error("Error al guardar reserva:", error);
    //         res.status(500).send("Error al procesar la reserva");
    //     }
    // }

async reservar(req, res) {
        let conn;
        try {
            const { id } = req.params;
            const { motivo, estado, id_paciente, id_agenda, fecha, hora_inicio } = req.body;

            // 1. VALIDACIÓN CRÍTICA: ¿Es un día no laborable/feriado?
            conn = await createConnection();
            const [feriado] = await conn.query(
                'SELECT descripcion FROM FERIADOS WHERE fecha = ?', 
                [fecha]
            );

            if (feriado.length > 0) {
                // Si es feriado, bloqueamos la reserva
                console.warn(`🛑 Intento de reserva en día no laborable: ${fecha} (${feriado[0].descripcion})`);
                
                // Si es una petición AJAX podrías devolver JSON, 
                // pero como parece ser un form tradicional, redirigimos con error.
                return res.status(400).render('principal/error', {
                    error: `El día ${formatearFecha(fecha)} es feriado (${feriado[0].descripcion}) y no se permiten reservas.`,
                    page: 'error'
                });
            }

            // 2. Lógica normal de búsqueda de agenda
            let agendaIdDestino = id_agenda;
            if (!agendaIdDestino && id !== 'undefined') {
                const tActual = await Turno.getById(id);
                agendaIdDestino = tActual ? tActual.id_agenda : null;
            }

            const archivo_dni = req.file ? req.file.filename : null;

            const datosTurno = {
                fecha,
                hora_inicio,
                motivo,
                estado: estado || 'pendiente',
                id_paciente: id_paciente || null,
                id_agenda: agendaIdDestino,
                ...(archivo_dni && { archivo_dni })
            };

            // 3. Guardado en BD
            if (id && id !== 'undefined') {
                await Turno.actualizar(id, datosTurno);
            } else {
                await Turno.create(datosTurno);
            }

            res.redirect(agendaIdDestino ? `/turnos/${agendaIdDestino}?status=success` : '/agendas');

        } catch (error) {
            console.error("Error al guardar reserva:", error);
            res.status(500).send("Error al procesar la reserva");
        } finally {
            if (conn) conn.end(); // Cerramos la conexión manual de la validación
        }
    }

    // ELIMINAR
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id || id === 'undefined') return res.status(400).json({ ok: false, error: "ID inválido" });

            const eliminado = await Turno.delete(id);
            return res.json({ ok: eliminado });
        } catch (error) {
            console.error("Error eliminando turno:", error);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    }
}

module.exports = new TurnosController();