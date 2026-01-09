
// // const Turno = require('../models/turnosModels');
// // const Paciente = require('../models/pacientesModels');

// // // ------------------------------
// // // FORMATOS DE FECHA
// // // ------------------------------
// // function formatearFecha(fecha) {
// //     const f = new Date(fecha);
// //     const dia = String(f.getDate()).padStart(2, '0');
// //     const mes = String(f.getMonth() + 1).padStart(2, '0');
// //     const año = f.getFullYear();
// //     return `${dia}/${mes}/${año}`;
// // }

// // function fechaISO(fecha) {
// //     // return new Date(fecha).toISOString().split('T')[0];
// //         const f = new Date(fecha);
// //     const y = f.getFullYear();
// //     const m = String(f.getMonth() + 1).padStart(2, '0');
// //     const d = String(f.getDate()).padStart(2, '0');
// //     return `${y}-${m}-${d}`;

// // }

// // function fechaParaInput(fecha) {
// //     const f = new Date(fecha);
// //     const dia = String(f.getDate()).padStart(2, "0");
// //     const mes = String(f.getMonth() + 1).padStart(2, "0");
// //     const año = f.getFullYear();
// //     return `${año}-${mes}-${dia}`;
// // }

// // class TurnosController {

// //     // ========================================
// //     // LISTAR TURNOS DE UNA AGENDA
// //     // ========================================
// //     async get(req, res) {
// //         try {
// //             const { id } = req.params;
// //             const turnos = await Turno.getAll(id);

// //             // const turnosFormateados = turnos.map(t => ({
// //             //     ...t,
// //             //     fecha_formateada: formatearFecha(t.fecha), // visible
// //             //     fecha_iso: fechaISO(t.fecha),              // filtros
// //             //     hora_inicio: t.hora_inicio,                // original
// //             //     hora_filtro: t.hora_inicio?.slice(0, 5),   // filtros
// //             //     dni: t.paciente_dni ?? null
// //             // }));
// //             const turnosFormateados = turnos.map(t => ({
// //                 ...t,
// //                 fecha_formateada: formatearFecha(t.fecha),
// //                 fecha_iso: fechaISO(t.fecha),      // ← CORRECTO
// //                 hora_filtro: t.hora_inicio?.slice(0, 5),
// //                 dni: t.paciente_dni ?? null
// //             }));

// //             res.render('turnos/index', {
// //                 turnos: turnosFormateados,
// //                 id_agenda: id
// //             });

// //         } catch (error) {
// //             console.error("Error GET Turnos:", error);
// //             res.status(500).send("Error al cargar los turnos");
// //         }
// //     }

// //     // ========================================
// //     // FORMULARIO RESERVAR TURNO
// //     // ========================================
// //     async reservarForm(req, res) {
// //         try {
// //             const { id } = req.params;
// //             const turno = await Turno.getById(id);
// //             if (!turno) return res.status(404).send("Turno no encontrado");

// //             turno.fecha_formateada = formatearFecha(turno.fecha);
// //             turno.fecha_input = fechaParaInput(turno.fecha);

// //             const pacientes = await Paciente.getAll();

// //             if (turno.id_paciente) {
// //                 const pacienteCompleto = pacientes.find(
// //                     p => p.id_paciente === turno.id_paciente
// //                 );
// //                 if (pacienteCompleto) {
// //                     turno.paciente_nombre = pacienteCompleto.nombre;
// //                     turno.paciente_apellido = pacienteCompleto.apellido;
// //                     turno.dni = pacienteCompleto.dni;
// //                 }
// //             }

// //             res.render("turnos/reservar", {
// //                 turno,
// //                 pacientes
// //             });

// //         } catch (error) {
// //             console.error("Error cargar vista reservar:", error);
// //             res.status(500).send("Error al cargar la vista de reserva");
// //         }
// //     }

// //     // ========================================
// //     // GUARDAR RESERVA
// //     // ========================================
// //     // async reservar(req, res) {
// //     //     try {
// //     //         const { id } = req.params;
// //     //         const { motivo, estado, id_paciente } = req.body;

// //     //         await Turno.update(id, {
// //     //             fecha: req.body.fecha,
// //     //             hora_inicio: req.body.hora_inicio,
// //     //             motivo,
// //     //             estado,
// //     //             id_paciente
// //     //         });

// //     //         res.redirect('/turnos/' + req.body.id_agenda);

// //     //     } catch (error) {
// //     //         console.error("Error al reservar turno:", error);
// //     //         res.status(500).send("Error al reservar turno");
// //     //     }
// //     // }

// //     async reservar(req, res) {
// //         try {
// //             const { id } = req.params; // El ID del turno si estás editando uno existente
// //             const { motivo, estado, id_paciente, id_agenda, fecha, hora_inicio } = req.body;

// //             // req.file contiene la información del archivo subido por Multer
// //             const archivo_dni = req.file ? req.file.filename : null;

// //             // Creamos un objeto con los datos, incluyendo la imagen
// //             const datosTurno = {
// //                 fecha,
// //                 hora_inicio,
// //                 motivo,
// //                 estado: estado || 'pendiente',
// //                 id_paciente,
// //                 id_agenda,
// //                 archivo_dni // <--- Nuevo campo
// //             };

// //             if (id) {
// //                 // Si existe ID, actualizamos (usando el método update que ya tienes)
// //                 // Deberías actualizar tu modelo Turno.update para recibir archivo_dni
// //                 await Turno.update(id, datosTurno);
// //             } else {
// //                 // Si no existe ID, es un turno nuevo (el caso de la secretaria)
// //                 await Turno.create(datosTurno);
// //             }

// //             // Redireccionamos a la agenda correspondiente
// //             res.redirect('/turnos/' + id_agenda);

// //         } catch (error) {
// //             console.error("Error al guardar reserva con imagen:", error);
// //             res.status(500).send("Error al procesar la reserva");
// //         }
// //     }


// //     // ========================================
// //     // ELIMINAR TURNO
// //     // ========================================
// //     async delete(req, res) {
// //         try {
// //             const { id } = req.params;
// //             await Turno.delete(id);
// //             return res.json({ ok: true });
// //         } catch (error) {
// //             console.error("Error eliminando turno:", error);
// //             return res.status(500).json({
// //                 ok: false,
// //                 error: "Error al eliminar el turno"
// //             });
// //         }
// //     }
// // }

// // module.exports = new TurnosController();


// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');

// // ========================================
// // FUNCIONES DE UTILIDAD (FORMATOS)
// // ========================================
// function formatearFecha(fecha) {
//     const f = new Date(fecha);
//     const dia = String(f.getDate()).padStart(2, '0');
//     const mes = String(f.getMonth() + 1).padStart(2, '0');
//     const año = f.getFullYear();
//     return `${dia}/${mes}/${año}`;
// }

// function fechaISO(fecha) {
//     const f = new Date(fecha);
//     const y = f.getFullYear();
//     const m = String(f.getMonth() + 1).padStart(2, '0');
//     const d = String(f.getDate()).padStart(2, '0');
//     return `${y}-${m}-${d}`;
// }

// function fechaParaInput(fecha) {
//     const f = new Date(fecha);
//     const dia = String(f.getDate()).padStart(2, "0");
//     const mes = String(f.getMonth() + 1).padStart(2, "0");
//     const año = f.getFullYear();
//     return `${año}-${mes}-${dia}`;
// }

// class TurnosController {

//     // ========================================
//     // LISTAR TURNOS DE UNA AGENDA
//     // ========================================
//     async get(req, res) {
//         try {
//             const { id } = req.params;
//             const turnos = await Turno.getAll(id);

//             const turnosFormateados = turnos.map(t => ({
//                 ...t,
//                 fecha_formateada: formatearFecha(t.fecha),
//                 fecha_iso: fechaISO(t.fecha),
//                 hora_filtro: t.hora_inicio?.slice(0, 5),
//                 dni: t.paciente_dni ?? null,
//                 // Agregamos info para la vista sobre el archivo
//                 tiene_archivo: !!t.archivo_dni,
//                 ruta_archivo: t.archivo_dni ? `/uploads/dnis/${t.archivo_dni}` : null
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

//     // ========================================
//     // FORMULARIO RESERVAR TURNO (VISTA)
//     // ========================================
//     async establecerForm(req, res) {
//         try {
//             const { id } = req.params; // ID del turno (si existe uno libre en la grilla)
//             const turno = await Turno.getById(id);
            
//             if (!turno) return res.status(404).send("Turno no encontrado");

//             turno.fecha_formateada = formatearFecha(turno.fecha);
//             turno.fecha_input = fechaParaInput(turno.fecha);

//             const pacientes = await Paciente.getAll();

//             // Si el turno ya tiene un paciente (edición), buscamos sus datos
//             if (turno.id_paciente) {
//                 const pac = pacientes.find(p => p.id_paciente === turno.id_paciente);
//                 if (pac) {
//                     turno.paciente_nombre = pac.nombre;
//                     turno.paciente_apellido = pac.apellido;
//                     turno.dni = pac.dni;
//                 }
//             }

//             res.render("turnos/reservar", {
//                 turno,
//                 pacientes
//             });

//         } catch (error) {
//             console.error("Error cargar vista reservar:", error);
//             res.status(500).send("Error al cargar la vista de reserva");
//         }
//     }

//     // ========================================
//     // GUARDAR RESERVA (PROCESAR FORMULARIO + ARCHIVO)
//     // ========================================
//     async reservar(req, res) {
//         try {
//             const { id } = req.params; // ID del registro a actualizar
//             const { motivo, estado, id_paciente, id_agenda, fecha, hora_inicio } = req.body;

//             // req.file viene gracias a Multer configurado en las rutas
//             const archivo_dni = req.file ? req.file.filename : null;

//             const datosTurno = {
//                 fecha,
//                 hora_inicio,
//                 motivo,
//                 estado: estado || 'pendiente',
//                 id_paciente: id_paciente || null,
//                 id_agenda,
//                 archivo_dni 
//             };

//             // Si hay ID, actualizamos el registro existente
//             if (id && id !== 'undefined') {
//                 await Turno.update(id, datosTurno);
//             } else {
//                 // Si no hay ID, creamos un registro nuevo
//                 await Turno.create(datosTurno);
//             }

//             // Redirección segura a la agenda correspondiente
//             const redireccion = id_agenda ? `/turnos/${id_agenda}` : '/turnos';
//             res.redirect(redireccion);

//         } catch (error) {
//             console.error("Error al guardar reserva:", error);
//             res.status(500).send("Error al procesar la reserva");
//         }
//     }

//     // ========================================
//     // ELIMINAR TURNO
//     // ========================================
//     async delete(req, res) {
//         try {
//             const { id } = req.params;
//             const eliminado = await Turno.delete(id);
            
//             if (eliminado) {
//                 return res.json({ ok: true });
//             } else {
//                 return res.status(404).json({ ok: false, error: "Turno no encontrado" });
//             }
//         } catch (error) {
//             console.error("Error eliminando turno:", error);
//             return res.status(500).json({ ok: false, error: "Error al eliminar el turno" });
//         }
//     }
// }

// module.exports = new TurnosController();


const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');

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

    // LISTAR TURNOS
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

            const pacientes = await Paciente.getAll();

            if (turno.id_paciente) {
                const pac = pacientes.find(p => p.id_paciente === turno.id_paciente);
                if (pac) {
                    turno.paciente_nombre = pac.nombre;
                    turno.paciente_apellido = pac.apellido;
                    turno.dni = pac.dni;
                }
            }

            res.render("turnos/reservar", { turno, pacientes });
        } catch (error) {
            console.error("Error vista reservar:", error);
            res.status(500).send("Error al cargar la vista");
        }
    }

    // GUARDAR RESERVA (POST)
    async reservar(req, res) {
        try {
            const { id } = req.params; // ID del turno (o 'undefined' si es nuevo)
            const { motivo, estado, id_paciente, id_agenda, fecha, hora_inicio } = req.body;

            // Validación de seguridad para la redirección posterior
            const agendaIdDestino = id_agenda || (id !== 'undefined' ? await Turno.getAgendaIdByTurnoId(id) : null);

            // Archivo subido
            const archivo_dni = req.file ? req.file.filename : null;

            const datosTurno = {
                fecha,
                hora_inicio,
                motivo,
                estado: estado || 'pendiente',
                id_paciente: id_paciente || null,
                id_agenda: agendaIdDestino,
                // Solo actualizamos el archivo si se subió uno nuevo
                ...(archivo_dni && { archivo_dni }) 
            };

            if (id && id !== 'undefined') {
                await Turno.update(id, datosTurno);
                console.log(`Turno ${id} actualizado correctamente`);
            } else {
                if (!agendaIdDestino) throw new Error("Falta id_agenda para crear un turno nuevo");
                await Turno.create(datosTurno);
            }

            // Redirección segura para evitar el error 404 /undefined
            if (agendaIdDestino && agendaIdDestino !== 'undefined') {
                res.redirect(`/turnos/${agendaIdDestino}`);
            } else {
                res.redirect('/agendas'); // Fallback si todo falla
            }

        } catch (error) {
            console.error("Error al guardar reserva:", error);
            res.status(500).send("Error al procesar la reserva: " + error.message);
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