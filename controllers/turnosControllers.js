// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');

// // Función para formatear fecha (DD/MM/YYYY)
// function formatearFecha(fecha) {
//     const f = new Date(fecha);
//     const dia = String(f.getDate()).padStart(2, '0');
//     const mes = String(f.getMonth() + 1).padStart(2, '0');
//     const año = f.getFullYear();
//     return `${dia}/${mes}/${año}`;
// }

// // Fecha en formato compatible con <input type="date">
// function fechaParaInput(fecha) {
//     const f = new Date(fecha);
//     const dia = String(f.getDate()).padStart(2, "0");
//     const mes = String(f.getMonth() + 1).padStart(2, "0");
//     const año = f.getFullYear();
//     return `${año}-${mes}-${dia}`;
// }


// class TurnosController {

//     // Mostrar todos los turnos de una agenda
//     async get(req, res) {
//         try {
//             const { id } = req.params; // id agenda
//             const turnos = await Turno.getAll(id);

//             // Añadir fecha formateada para mostrar en la tabla
//             const turnosFormateados = turnos.map(t => ({
//                 ...t,
//                 fecha_formateada: formatearFecha(t.fecha)
//             }));

//             res.render('turnos/index', {
//                 turnos: turnosFormateados,
//                 id_agenda: id
//             });

//         } catch (error) {
//             console.error("Error GET Turnos:", error);
//             res.status(500).send("Error al cargar los turnos");
//         }
//     }

//     // Mostrar formulario para reservar un turno
// async reservarForm(req, res) {
//     try {
//         const { id } = req.params;

//         const turno = await Turno.getById(id);
//         if (!turno) return res.status(404).send("Turno no encontrado");

//         turno.fecha_formateada = formatearFecha(turno.fecha);
//         turno.fecha_input = fechaParaInput(turno.fecha);   // ← OK AHORA SÍ

//         const pacientes = await Paciente.getAll();

//         res.render("turnos/reservar", {
//             turno,
//             pacientes
//         });

//     } catch (error) {
//         console.error("Error cargar vista reservar:", error);
//         res.status(500).send("Error al cargar la vista de reserva");
//     }
// }


//     // Procesar reserva
//     async reservar(req, res) {
//         try {
//             const { id } = req.params;
//             const { motivo, estado, id_paciente } = req.body;

//             await Turno.update(id, {
//                 fecha: req.body.fecha,
//                 hora_inicio: req.body.hora_inicio,
//                 motivo,
//                 estado,
//                 id_paciente
//             });

//             res.redirect('/turnos/' + req.body.id_agenda);

//         } catch (error) {
//             console.error("Error al reservar turno:", error);
//             res.status(500).send("Error al reservar turno");
//         }
//     }

//     // Eliminar turno
//     async delete(req, res) {
//         try {
//             const { id } = req.params;
//             const { id_agenda } = req.query;

//             await Turno.delete(id);

//             res.redirect("/turnos/" + id_agenda);

//         } catch (error) {
//             console.error("Error eliminando turno:", error);
//             res.status(500).send("Error al eliminar el turno");
//         }
//     }

// }

// module.exports = new TurnosController();
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
    // async get(req, res) {
    //     try {
    //         const { id } = req.params; 
    //         const turnos = await Turno.getAll(id);

    //         const turnosFormateados = turnos.map(t => ({
    //             ...t,
    //             fecha_formateada: formatearFecha(t.fecha)
    //         }));

    //         res.render('turnos/index', {
    //             turnos: turnosFormateados,
    //             id_agenda: id
    //         });

    //     } catch (error) {
    //         console.error("Error GET Turnos:", error);
    //         res.status(500).send("Error al cargar los turnos");
    //     }
    // }
    async get(req, res) {
    try {
        const { id } = req.params; 
        const turnos = await Turno.getAll(id);

        // Traer todos los pacientes activos para poder mapear nombres, apellidos y DNI
        const pacientes = await Paciente.getAll();

        const turnosFormateados = turnos.map(t => {
            // Buscar paciente del turno
            const paciente = pacientes.find(p => p.id_paciente === t.id_paciente);
            return {
                ...t,
                fecha_formateada: formatearFecha(t.fecha),
                paciente_nombre: paciente ? `${paciente.nombre} ${paciente.apellido}` : null,
                dni: paciente ? paciente.dni : null
            };
        });

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

        // Traer turno
        const turno = await Turno.getById(id);
        if (!turno) return res.status(404).send("Turno no encontrado");

        turno.fecha_formateada = formatearFecha(turno.fecha);
        turno.fecha_input = fechaParaInput(turno.fecha);

        // Traer pacientes activos con DNI y nombre
        const pacientes = await Paciente.getAll(); // ya trae nombre, apellido y dni

        // Si el turno ya tiene paciente asignado, buscar sus datos completos
        if (turno.id_paciente) {
            const pacienteCompleto = pacientes.find(p => p.id_paciente === turno.id_paciente);
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
            const { id_agenda } = req.query;

            await Turno.delete(id);
            res.redirect("/turnos/" + id_agenda);

        } catch (error) {
            console.error("Error eliminando turno:", error);
            res.status(500).send("Error al eliminar el turno");
        }
    }

}

module.exports = new TurnosController();

