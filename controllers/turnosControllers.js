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
    // LISTADO GENERAL (PARA SECRETARÍA)
    // ============================================
    async getTurnosGeneral(req, res) {
        try {
            // 1. Capturamos todos los filtros, incluyendo especialidad y estado
            const { paciente, profesional, fecha, sucursal, especialidad, estado, page = 1 } = req.query;
            const limit = 200;
            const offset = (parseInt(page) - 1) * limit;

            // 2. Llamamos al modelo con el objeto de filtros completo
            const turnos = await Turno.listarPaginado({
                paciente,
                profesional,
                fecha,
                sucursal,
                especialidad,
                estado
            }, limit, offset);

            // 3. Datos adicionales para la interfaz
            const turnosUrgentes = await Turno.getTurnosAgendasNoActivas();
            const medicos = await Medico.getAll();

            // Opcional: Si necesitas la lista de especialidades para el select, 
            // asegúrate de tener el modelo importado o una consulta aquí.

            // 4. Contar el total considerando los nuevos filtros para la paginación
            const totalTurnos = await Turno.contarTurnos({
                paciente,
                profesional,
                fecha,
                sucursal,
                especialidad,
                estado
            });

            const totalPages = Math.ceil(totalTurnos / limit) || 1;

            // 5. Renderizado con envío de filtros de vuelta a la vista
            res.render('secretaria/turnos', {
                turnos,
                turnosUrgentes,
                medicos,
                filtros: {
                    paciente,
                    profesional,
                    fecha,
                    sucursal,
                    especialidad,
                    estado
                },
                status: req.query.status,
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalTurnos: totalTurnos
            });
        } catch (error) {
            console.error("Error en getTurnosGeneral:", error);
            res.status(500).send("Error al cargar el listado de turnos");
        }
    }

    // LISTAR TURNOS POR AGENDA ESPECÍFICA
    // async get(req, res) {
    //     try {
    //         const { id } = req.params;
    //         if (!id || id === 'undefined') return res.redirect('/agendas');

    //         const turnos = await Turno.getAll(id);

    //         const turnosFormateados = turnos.map(t => ({
    //             ...t,
    //             fecha_formateada: formatearFecha(t.fecha),
    //             fecha_iso: fechaISO(t.fecha),
    //             hora_filtro: t.hora_inicio?.slice(0, 5),
    //             dni: t.paciente_dni ?? null,
    //             tiene_archivo: !!t.archivo_dni,
    //             ruta_archivo: t.archivo_dni ? `/uploads/dnis/${t.archivo_dni}` : null
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




    // async get(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const usuarioLogueado = req.user; // El middleware guarda aquí los datos del token

    //         // ========================================================
    //         // VALIDACIÓN DE PRIVACIDAD
    //         // ========================================================
    //         // Si el usuario es un Paciente (ID 4), no puede ver el listado de una agenda
    //         if (usuarioLogueado && usuarioLogueado.id_rol === 4) {
    //             console.warn(`[SEGURIDAD] Paciente ID ${usuarioLogueado.id_usuario} intentó acceder a la agenda ${id}`);
    //             return res.status(403).render('errors/403', { 
    //                 mensaje: "No tienes permiso para ver el listado completo de turnos." 
    //             });
    //         }

    //         if (!id || id === 'undefined') return res.redirect('/agendas');

    //         const turnos = await Turno.getAll(id);

    //         const turnosFormateados = turnos.map(t => ({
    //             ...t,
    //             fecha_formateada: formatearFecha(t.fecha),
    //             fecha_iso: fechaISO(t.fecha),
    //             hora_filtro: t.hora_inicio?.slice(0, 5),
    //             dni: t.paciente_dni ?? null,
    //             tiene_archivo: !!t.archivo_dni,
    //             ruta_archivo: t.archivo_dni ? `/uploads/dnis/${t.archivo_dni}` : null
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

    // LISTADO POR AGENDA (PROTEGIDO)
    async get(req, res) {
        try {
            const { id } = req.params;
            const usuarioLogueado = req.user;

            // 1. Si es Paciente, REBOTAR. No puede ver el listado general de una agenda.
            if (usuarioLogueado && usuarioLogueado.id_rol === 4) {
                return res.status(403).render('errors/403', { 
                    mensaje: "No tienes permiso para ver el listado de esta agenda." 
                });
            }

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
    // async establecerForm(req, res) {
    //     try {
    //         const { id } = req.params;
    //         if (!id || id === 'undefined') return res.redirect('/agendas');

    //         const turno = await Turno.getById(id);
    //         if (!turno) return res.status(404).send("Turno no encontrado");

    //         turno.fecha_formateada = formatearFecha(turno.fecha);
    //         turno.fecha_input = fechaParaInput(turno.fecha);

    //         res.render("turnos/reservar", { turno });
    //     } catch (error) {
    //         console.error("Error vista reservar:", error);
    //         res.status(500).send("Error interno");
    //     }
    // }

    async establecerForm(req, res) {
        try {
            const { id } = req.params;
            const usuarioLogueado = req.user; // Datos del token

            if (!id || id === 'undefined') return res.redirect('/agendas');

            const turno = await Turno.getById(id);
            if (!turno) return res.status(404).send("Turno no encontrado");

            // ========================================================
            // VALIDACIÓN DE SEGURIDAD: ¿Quién puede ver este formulario?
            // ========================================================
            
            // Si el turno YA TIENE un paciente asignado:
            if (turno.id_paciente !== null) {
                // Si el usuario es un Paciente (Rol 4)
                if (usuarioLogueado.id_rol === 4) {
                    // Y no es EL DUEÑO del turno
                    if (turno.id_paciente !== usuarioLogueado.id_usuario) {
                        console.warn(`[SEGURIDAD] Paciente ${usuarioLogueado.id_usuario} intentó ver turno ajeno: ${id}`);
                        return res.status(403).render('errors/403', { 
                            mensaje: "Este turno ya está ocupado por otro paciente." 
                        });
                    }
                }
            }
            // Si el turno está libre (id_paciente === null), el flujo sigue normal para todos

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

    //         // ========================================================
    //         // 1. VALIDACIÓN: FECHA PASADA
    //         // ========================================================
    //         const hoy = new Date();
    //         hoy.setHours(0, 0, 0, 0);

    //         const [year, month, day] = fecha.split('-').map(Number);
    //         const fechaTurno = new Date(year, month - 1, day);

    //         if (fechaTurno < hoy) {
    //             console.error(`⚠️ Error: Fecha pasada recibida (${fecha})`);
    //             return res.status(400).send("No se pueden agendar turnos en fechas que ya pasaron.");
    //         }

    //         // ========================================================
    //         // 2. VALIDACIÓN DE TURNO DUPLICADO EN EL DÍA
    //         // ========================================================
    //         // Solo validamos si es un turno nuevo (id no definido)
    //         if (!id || id === 'undefined') {
    //             const yaTieneTurno = await Turno.verificarTurnoDia(id_paciente, fecha);
    //             if (yaTieneTurno) {
    //                 console.warn(`🛑 Bloqueo de duplicado: Paciente ${id_paciente} ya tiene turno el ${fecha}`);
    //                 return res.status(400).send(`El paciente ya tiene un turno asignado para el día ${day}/${month}/${year} a las ${yaTieneTurno.hora}. No se permiten dos
    //                     turnos el mismo día para el mismo Medico  y misma especialidad.`);
    //             }
    //         }

    //         // ========================================================
    //         // 3. PROCESAMIENTO DE DATOS
    //         // ========================================================
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

    //         // ========================================================
    //         // 4. PERSISTENCIA (GUARDADO EN BD)
    //         // ========================================================
    //         if (id && id !== 'undefined') {
    //             await Turno.actualizar(id, datosTurno);
    //         } else {
    //             await Turno.create(datosTurno);
    //         }

    //         // Redirección con éxito
    //         res.redirect(agendaIdDestino ? `/turnos/${agendaIdDestino}?status=success` : '/agendas');

    //     } catch (error) {
    //         console.error("Error al guardar reserva:", error);
    //         res.status(500).send("Error al procesar la reserva");
    //     }
   // }



   async reservar(req, res) {
        try {
            const { id } = req.params;
            const { motivo, estado, id_paciente, id_agenda, fecha, hora_inicio } = req.body;
            const usuarioLogueado = req.user; // Obtenido del middleware

            // --- VALIDACIONES DE FECHA Y DUPLICADO --- (Mantén tu código actual aquí)
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const [year, month, day] = fecha.split('-').map(Number);
            const fechaTurno = new Date(year, month - 1, day);
            if (fechaTurno < hoy) return res.status(400).send("Fecha pasada.");

            // --- PROCESAMIENTO ---
            let agendaIdDestino = id_agenda;
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

            // --- GUARDADO ---
            if (id && id !== 'undefined') {
                await Turno.actualizar(id, datosTurno);
            } else {
                await Turno.create(datosTurno);
            }

            // ========================================================
            // REDIRECCIÓN DIFERENCIADA SEGÚN ROL
            // ========================================================
            if (usuarioLogueado && usuarioLogueado.id_rol === 4) {
                // Si es paciente, lo mandamos a SU propia lista de turnos (debes tener esta ruta)
                // O al inicio con un mensaje de éxito.
                return res.redirect('/mis-turnos?status=success'); 
            } else {
                // Si es admin/secretaria, lo mandamos al listado de la agenda
                return res.redirect(agendaIdDestino ? `/turnos/${agendaIdDestino}?status=success` : '/agendas');
            }

        } catch (error) {
            console.error("Error al guardar reserva:", error);
            res.status(500).send("Error al procesar la reserva");
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

    // async validarTurnoDia(req, res) {
    //     try {
    //         const { id_paciente, fecha } = req.query;

    //         if (!id_paciente || !fecha) {
    //             return res.json({ existe: false }); // No hay suficientes datos para validar
    //         }

    //         // Llamamos al método que ya creaste en tu modelo
    //         const turnoExistente = await Turno.verificarTurnoDia(id_paciente, fecha);

    //         if (turnoExistente) {
    //             return res.json({
    //                 existe: true,
    //                 mensaje: `El paciente ya tiene un turno para esta fecha a las ${turnoExistente.hora}.`
    //             });
    //         }

    //         return res.json({ existe: false });
    //     } catch (error) {
    //         console.error("Error en validarTurnoDia:", error);
    //         res.status(500).json({ error: "Error interno de validación" });
    //     }
    // }



    // Dentro de TurnosController.js
    async validarTurnoDia(req, res) {
        try {
            const { id_paciente, fecha } = req.query;
            // Llama a tu modelo (ajusta el nombre del método según tu modelo de Turnos o Pacientes)
            const existe = await Paciente.verificarTurnoExistente(id_paciente, fecha);

            return res.json({
                existe: !!existe,
                msg: existe ? 'Ya tienes un turno agendado para esta fecha.' : ''
            });
        } catch (error) {
            console.error("Error validando duplicado:", error);
            res.status(500).json({ existe: false, error: 'Error de servidor' });
        }
    }




}

module.exports = new TurnosController();