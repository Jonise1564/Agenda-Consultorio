
const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');

// ------------------------------
// FORMATOS DE FECHA
// ------------------------------
function formatearFecha(fecha) {
    const f = new Date(fecha);
    const dia = String(f.getDate()).padStart(2, '0');
    const mes = String(f.getMonth() + 1).padStart(2, '0');
    const año = f.getFullYear();
    return `${dia}/${mes}/${año}`;
}

function fechaISO(fecha) {
    // return new Date(fecha).toISOString().split('T')[0];
        const f = new Date(fecha);
    const y = f.getFullYear();
    const m = String(f.getMonth() + 1).padStart(2, '0');
    const d = String(f.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;

}

function fechaParaInput(fecha) {
    const f = new Date(fecha);
    const dia = String(f.getDate()).padStart(2, "0");
    const mes = String(f.getMonth() + 1).padStart(2, "0");
    const año = f.getFullYear();
    return `${año}-${mes}-${dia}`;
}

class TurnosController {

    // ========================================
    // LISTAR TURNOS DE UNA AGENDA
    // ========================================
    async get(req, res) {
        try {
            const { id } = req.params;
            const turnos = await Turno.getAll(id);

            // const turnosFormateados = turnos.map(t => ({
            //     ...t,
            //     fecha_formateada: formatearFecha(t.fecha), // visible
            //     fecha_iso: fechaISO(t.fecha),              // filtros
            //     hora_inicio: t.hora_inicio,                // original
            //     hora_filtro: t.hora_inicio?.slice(0, 5),   // filtros
            //     dni: t.paciente_dni ?? null
            // }));
            const turnosFormateados = turnos.map(t => ({
                ...t,
                fecha_formateada: formatearFecha(t.fecha),
                fecha_iso: fechaISO(t.fecha),      // ← CORRECTO
                hora_filtro: t.hora_inicio?.slice(0, 5),
                dni: t.paciente_dni ?? null
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

    // ========================================
    // FORMULARIO RESERVAR TURNO
    // ========================================
    async reservarForm(req, res) {
        try {
            const { id } = req.params;
            const turno = await Turno.getById(id);
            if (!turno) return res.status(404).send("Turno no encontrado");

            turno.fecha_formateada = formatearFecha(turno.fecha);
            turno.fecha_input = fechaParaInput(turno.fecha);

            const pacientes = await Paciente.getAll();

            if (turno.id_paciente) {
                const pacienteCompleto = pacientes.find(
                    p => p.id_paciente === turno.id_paciente
                );
                if (pacienteCompleto) {
                    turno.paciente_nombre = pacienteCompleto.nombre;
                    turno.paciente_apellido = pacienteCompleto.apellido;
                    turno.dni = pacienteCompleto.dni;
                }
            }

            res.render("turnos/reservar", {
                turno,
                pacientes
            });

        } catch (error) {
            console.error("Error cargar vista reservar:", error);
            res.status(500).send("Error al cargar la vista de reserva");
        }
    }

    // ========================================
    // GUARDAR RESERVA
    // ========================================
    async reservar(req, res) {
        try {
            const { id } = req.params;
            const { motivo, estado, id_paciente } = req.body;

            await Turno.update(id, {
                fecha: req.body.fecha,
                hora_inicio: req.body.hora_inicio,
                motivo,
                estado,
                id_paciente
            });

            res.redirect('/turnos/' + req.body.id_agenda);

        } catch (error) {
            console.error("Error al reservar turno:", error);
            res.status(500).send("Error al reservar turno");
        }
    }

    // ========================================
    // ELIMINAR TURNO
    // ========================================
    async delete(req, res) {
        try {
            const { id } = req.params;
            await Turno.delete(id);
            return res.json({ ok: true });
        } catch (error) {
            console.error("Error eliminando turno:", error);
            return res.status(500).json({
                ok: false,
                error: "Error al eliminar el turno"
            });
        }
    }
}

module.exports = new TurnosController();
