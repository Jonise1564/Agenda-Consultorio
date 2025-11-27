// const Turno = require('../models/turnosModels');
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');
// const { obtenerHoraFormateada } = require('../utils/timeFormatter');

// class TurnosController {

//     // =======================================
//     // LISTAR TURNOS POR AGENDA
//     // =======================================
//     async get(req, res, next) {
//         try {
//             const { id } = req.params;
//             const turnos = await Turno.getAll(id);

//             const turnosFormateado = turnos.map(turno => ({
//                 ...turno,
//                 hora_inicio: obtenerHoraFormateada(turno.hora_inicio),
//                 fecha: obtenerFechaFormateada(new Date(turno.fecha))
//             }));

//             res.render('turnos/index', { 
//                 turnos: turnosFormateado, 
//                 mensaje: req.query.mensaje,
//                 id_agenda: id
//             });

//         } catch (error) {
//             console.error('Error al obtener turnos:', error);
//             next(error);
//         }
//     }

//     // =======================================
//     // FORMULARIO CREAR
//     // =======================================
//     async createForm(req, res, next) {
//         try {
//             const { id } = req.params;
//             res.render('turnos/create', { id_agenda: id });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // =======================================
//     // GUARDAR NUEVO TURNO
//     // =======================================
//     async store(req, res, next) {
//         try {
//             const { fecha, hora_inicio, motivo, id_paciente, id_agenda } = req.body;

//             await Turno.create({
//                 fecha,
//                 hora_inicio,
//                 motivo,
//                 id_paciente,
//                 id_agenda
//             });

//             res.redirect(`/turnos/${id_agenda}?mensaje=Turno creado correctamente`);
//         } catch (error) {
//             console.error('Error creando turno:', error);
//             next(error);
//         }
//     }

//     // =======================================
//     // FORM EDITAR
//     // =======================================
//     async editForm(req, res, next) {
//         try {
//             const { id } = req.params;
//             const turno = await Turno.getById(id);

//             res.render('turnos/edit', { turno });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // =======================================
//     // ACTUALIZAR
//     // =======================================
//     async update(req, res, next) {
//         try {
//             const { id } = req.params;
//             const { fecha, hora_inicio, motivo, id_paciente, estado, id_agenda } = req.body;

//             await Turno.update(id, {
//                 fecha,
//                 hora_inicio,
//                 motivo,
//                 id_paciente,
//                 estado
//             });

//             res.redirect(`/turnos/${id_agenda}?mensaje=Turno actualizado`);
//         } catch (error) {
//             next(error);
//         }
//     }

//     // =======================================
//     // ELIMINAR
//     // =======================================
//     async delete(req, res, next) {
//         try {
//             const { id } = req.params;
//             await Turno.delete(id);

//             res.json({ success: true });
//         } catch (error) {
//             next(error);
//         }
//     }

//     // =======================================
//     // RESERVAR (CAMBIAR ESTADO)
//     // =======================================
//     async reservar(req, res, next) {
//         try {
//             const { id } = req.params;

//             await Turno.updateEstado(id, "Reservado");

//             res.redirect("back");
//         } catch (error) {
//             next(error);
//         }
//     }
// }





// module.exports = new TurnosController();

const Turno = require('../models/turnosModels');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');
const { obtenerHoraFormateada } = require('../utils/timeFormatter');

class TurnosController {

    // =======================================
    // LISTAR TURNOS POR AGENDA
    // =======================================
    async get(req, res, next) {
        try {
            const { id } = req.params;
            const turnos = await Turno.getAll(id);

            const turnosFormateado = turnos.map(turno => ({
                ...turno,
                hora_inicio: obtenerHoraFormateada(turno.hora_inicio),
                fecha: obtenerFechaFormateada(new Date(turno.fecha))
            }));

            res.render('turnos/index', { 
                turnos: turnosFormateado, 
                mensaje: req.query.mensaje,
                id_agenda: id
            });

        } catch (error) {
            console.error('Error al obtener turnos:', error);
            next(error);
        }
    }

    // =======================================
    // FORMULARIO CREAR
    // =======================================
    async createForm(req, res, next) {
        try {
            const { id } = req.params;
            res.render('turnos/create', { id_agenda: id });
        } catch (error) {
            next(error);
        }
    }

    // =======================================
    // GUARDAR NUEVO TURNO
    // =======================================
    async store(req, res, next) {
        try {
            const { fecha, hora_inicio, motivo, id_paciente, id_agenda } = req.body;

            await Turno.create({
                fecha,
                hora_inicio,
                motivo,
                id_paciente,
                id_agenda
            });

            res.redirect(`/turnos/${id_agenda}?mensaje=Turno creado correctamente`);
        } catch (error) {
            console.error('Error creando turno:', error);
            next(error);
        }
    }

    // =======================================
    // FORM EDITAR
    // =======================================
    async editForm(req, res, next) {
        try {
            const { id } = req.params;
            const turno = await Turno.getById(id);

            res.render('turnos/edit', { turno });
        } catch (error) {
            next(error);
        }
    }

    // =======================================
    // ACTUALIZAR
    // =======================================
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { fecha, hora_inicio, motivo, id_paciente, estado, id_agenda } = req.body;

            await Turno.update(id, {
                fecha,
                hora_inicio,
                motivo,
                id_paciente,
                estado
            });

            res.redirect(`/turnos/${id_agenda}?mensaje=Turno actualizado`);
        } catch (error) {
            next(error);
        }
    }

    // =======================================
    // ELIMINAR
    // =======================================
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await Turno.delete(id);

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // =======================================
    // RESERVAR (CAMBIAR ESTADO SIMPLE)
    // =======================================
    async reservar(req, res, next) {
        try {
            const { id } = req.params;

            await Turno.updateEstado(id, "Reservado");

            res.redirect("back");
        } catch (error) {
            next(error);
        }
    }

    // =======================================
    // RESERVAR FORMULARIO (VER DATOS)
    // =======================================
    async reservarForm(req, res, next) {
        try {
            const { id } = req.params;
            const turno = await Turno.getById(id);

            res.render("turnos/reservar", { turno });

        } catch (error) {
            next(error);
        }
    }

    // =======================================
    // RESERVAR → GUARDAR CAMBIOS
    // =======================================
    async reservarStore(req, res, next) {
        try {
            const { id, motivo, estado, id_paciente, id_agenda } = req.body;

            await Turno.update(id, {
                motivo,
                estado,
                id_paciente,
                fecha: null,        // NO modificar fecha
                hora_inicio: null   // NO modificar hora
            });

            res.redirect(`/turnos/${id_agenda}?nombreUpdate=1`);
        } catch (error) {
            console.error("Error al reservar turno:", error);
            next(error);
        }
    }
}

module.exports = new TurnosController();

