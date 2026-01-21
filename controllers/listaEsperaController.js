// const ListaEspera = require('../models/listaEsperaModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');
// const Paciente = require('../models/pacientesModels');
// const Turno = require('../models/turnosModels');


// class ListaEsperaController {

//     // async index(req, res, next) {
//     //     try {
//     //         const espera = await ListaEspera.getPendientes();
//     //         res.render('secretaria/lista_espera/index', { espera });
//     //     } catch (error) { next(error); }
//     // }



//     async index(req, res, next) {
//         try {
//             // 1. Obtener la lista de pacientes en espera
//             const espera = await ListaEspera.getPendientes();

//             // 2. Cruzar con la agenda para buscar huecos disponibles
//             const esperaConHuecos = await Promise.all(espera.map(async (item) => {
//                 // Buscamos el primer hueco libre para este médico y especialidad
//                 // Debes tener este método en tu modelo de Turno (ver paso 2 abajo)
//                 const hueco = await Turno.buscarPrimerHuecoLibre(item.id_medico, item.id_especialidad);

//                 return {
//                     ...item,
//                     hueco_disponible: hueco // Retorna { fecha, hora } o null
//                 };
//             }));

//             res.render('secretaria/lista_espera/index', { espera: esperaConHuecos });
//         } catch (error) {
//             console.error("Error en index ListaEspera:", error);
//             next(error);
//         }
//     }

//     // ---  PROCESAR ASIGNACIÓN DESDE LISTA DE ESPERA ---
//     // async asignarTurnoRapido(req, res, next) {
//     //     try {
//     //         const { esperaId, fecha, hora, medicoId } = req.query;

//     //         // 1. Obtener datos de la solicitud (para tener el ID del paciente)
//     //         const solicitud = await ListaEspera.getById(esperaId);

//     //         if (!solicitud) {
//     //             return res.redirect('/secretaria/lista-espera?status=error_no_existe');
//     //         }

//     //         // 2. Crear el turno en la tabla de turnos
//     //         // Ajusta los nombres de campos según tu base de datos
//     //         await Turno.crear({
//     //             id_paciente: solicitud.id_paciente,
//     //             id_medico: medicoId,
//     //             id_especialidad: solicitud.id_especialidad,
//     //             fecha: fecha,
//     //             hora: hora,
//     //             estado: 'Reservado'
//     //         });

//     //         // 3. Quitar de la lista de espera (ya cumplió su propósito)
//     //         await ListaEspera.delete(esperaId);

//     //         res.redirect('/secretaria/lista-espera?status=asignado_success');
//     //     } catch (error) {
//     //         console.error("Error al asignar turno desde espera:", error);
//     //         res.redirect('/secretaria/lista-espera?status=error');
//     //     }
//     // }

//     // async asignarTurnoRapido(req, res, next) {
//     //     try {
//     //         const { esperaId, fecha, hora, medicoId } = req.query;

//     //         // 1. Obtener la solicitud de la lista de espera
//     //         const solicitud = await ListaEspera.getById(esperaId);
//     //         if (!solicitud) {
//     //             return res.redirect('/secretaria/lista-espera?status=error_no_existe');
//     //         }

//     //         // 2. IMPORTANTE: Necesitamos el ID de la agenda para este médico y especialidad
//     //         // Buscamos la agenda activa que corresponde
//     //         const [agenda] = await db.query(
//     //             "SELECT id FROM agendas WHERE id_medico = ? AND id_especialidad = ? AND fecha_fin >= ? LIMIT 1",
//     //             [medicoId, solicitud.id_especialidad, fecha]
//     //         );

//     //         if (!agenda || agenda.length === 0) {
//     //             return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
//     //         }

//     //         // 3. Crear el turno
//     //         await Turno.create({
//     //             fecha: fecha,
//     //             hora_inicio: hora,
//     //             motivo: 'Asignado desde Lista de Espera',
//     //             id_paciente: solicitud.id_paciente,
//     //             id_agenda: agenda[0].id, // Usamos el ID que encontramos
//     //             archivo_dni: null
//     //         });

//     //         // 4. Marcar como Atendido o Eliminar de la lista
//     //         await ListaEspera.updateEstado(esperaId, 'Atendido');

//     //         res.redirect('/secretaria/lista-espera?status=asignado_success');
//     //     } catch (error) {
//     //         console.error("Error al asignar turno:", error);
//     //         next(error);
//     //     }
//     // }
//     async asignarTurnoRapido(req, res, next) {
//         let conn;
//         try {
//             const { esperaId, fecha, hora, medicoId } = req.query;

//             // 1. Obtener la solicitud de la lista de espera
//             const solicitud = await ListaEspera.getById(esperaId);
//             if (!solicitud) {
//                 return res.redirect('/secretaria/lista-espera?status=error_no_existe');
//             }

//             // 2. Obtener la conexión para buscar la agenda
//             conn = await createConnection();

//             // Buscamos la agenda activa para ese médico, especialidad y fecha
//             const [agenda] = await conn.query(
//                 `SELECT id FROM agendas 
//              WHERE id_medico = ? AND id_especialidad = ? 
//              AND ? BETWEEN fecha_creacion AND fecha_fin 
//              LIMIT 1`,
//                 [medicoId, solicitud.id_especialidad, fecha]
//             );

//             if (!agenda || agenda.length === 0) {
//                 return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
//             }

//             // 3. Crear el turno usando el modelo Turno
//             // (Turno.create ya maneja su propia conexión internamente)
//             await Turno.create({
//                 fecha: fecha,
//                 hora_inicio: hora,
//                 motivo: 'Asignado desde Lista de Espera',
//                 id_paciente: solicitud.id_paciente,
//                 id_agenda: agenda[0].id,
//                 archivo_dni: null
//             });

//             // 4. Marcar la solicitud como atendida o eliminarla
//             await ListaEspera.updateEstado(esperaId, 'Atendido');

//             // 5. Redirigir con éxito
//             res.redirect('/secretaria/lista-espera?status=asignado_success');

//         } catch (error) {
//             console.error("Error al asignar turno:", error);
//             next(error);
//         } finally {
//             if (conn) await conn.end(); // Siempre cerrar la conexión manual
//         }
//     }

//     async create(req, res, next) {
//         try {
//             const { id_medico, id_especialidad, id_paciente } = req.query;

//             const [medicos, especialidades, pacienteData] = await Promise.all([
//                 Medico.getProfesionalesParaAgendas(),
//                 typeof Especialidad.getAll === 'function' ? Especialidad.getAll() : Especialidad.listar(),
//                 id_paciente ? Paciente.getDatosCompletos(id_paciente) : null
//             ]);

//             res.render('secretaria/lista_espera/crear', {
//                 medicos,
//                 especialidades,
//                 id_medico: id_medico || '',
//                 id_especialidad: id_especialidad || '',
//                 id_paciente: id_paciente || '',
//                 paciente: pacienteData
//             });
//         } catch (error) {
//             console.error("Error en create ListaEspera:", error.message);
//             next(error);
//         }
//     }

//     // ---  MÉTODO PARA VALIDACIÓN  ---
//     async verificarDuplicado(req, res, next) {
//         try {
//             const { id_paciente, id_medico, id_especialidad } = req.query;

//             if (!id_paciente || !id_medico || !id_especialidad) {
//                 return res.json({ existe: false });
//             }

//             // Usamos un método del modelo para buscar duplicados activos
//             const existe = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);

//             res.json({ existe: !!existe });
//         } catch (error) {
//             console.error("Error al verificar duplicado:", error);
//             res.status(500).json({ existe: false, error: error.message });
//         }
//     }

//     async store(req, res, next) {
//         try {
//             const { id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones } = req.body;

//             if (!id_paciente || !id_medico || !id_especialidad) {
//                 return res.status(400).send("Error: Faltan datos obligatorios.");
//             }

//             // SEGURIDAD NIVEL SERVIDOR: Volver a verificar antes de insertar
//             const duplicado = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
//             if (duplicado) {
//                 return res.status(400).send("Error: El paciente ya tiene un registro activo en la lista de espera para este profesional.");
//             }

//             const data = {
//                 id_paciente,
//                 id_medico,
//                 id_especialidad,
//                 prioridad: prioridad || 'Media',
//                 motivo_prioridad: motivo_prioridad || null,
//                 observaciones: observaciones || null,
//                 id_usuario_creador: (req.session && req.session.id_usuario) ? req.session.id_usuario : 1
//             };

//             await ListaEspera.create(data);
//             res.redirect('/secretaria/lista-espera');

//         } catch (error) {
//             console.error("Error al guardar en Lista de Espera:", error);
//             next(error);
//         }
//     }

//     async eliminar(req, res, next) {
//         try {
//             const { id } = req.params;
//             await ListaEspera.delete(id);
//             res.redirect('/secretaria/lista-espera');
//         } catch (error) { next(error); }
//     }

//     async actualizarEstado(req, res, next) {
//         try {
//             const { id } = req.params;
//             const { nuevo_estado } = req.body;
//             await ListaEspera.updateEstado(id, nuevo_estado);
//             res.redirect('/secretaria/lista-espera');
//         } catch (error) { next(error); }
//     }
// }

// module.exports = new ListaEsperaController();

const createConnection = require('../config/configDb');
const ListaEspera = require('../models/listaEsperaModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');
const Paciente = require('../models/pacientesModels');
const Turno = require('../models/turnosModels');

class ListaEsperaController {

    /**
     * Muestra la lista de pacientes en espera y busca huecos disponibles
     */
    async index(req, res, next) {
        try {
            // 1. Obtener la lista de pacientes en espera
            const espera = await ListaEspera.getPendientes();

            // 2. Cruzar con la agenda para buscar huecos disponibles
            const esperaConHuecos = await Promise.all(espera.map(async (item) => {
                // Buscamos el primer hueco libre para este médico y especialidad
                const hueco = await Turno.buscarPrimerHuecoLibre(item.id_medico, item.id_especialidad);

                return {
                    ...item,
                    hueco_disponible: hueco // Retorna { fecha, hora } o null
                };
            }));

            res.render('secretaria/lista_espera/index', { espera: esperaConHuecos });
        } catch (error) {
            console.error("Error en index ListaEspera:", error);
            next(error);
        }
    }

    /**
     * Procesa la asignación de un turno desde la lista de espera
     */
    async asignarTurnoRapido(req, res, next) {
        let conn;
        try {
            const { esperaId, fecha, hora, medicoId } = req.query;

            // 1. Obtener la solicitud de la lista de espera
            const solicitud = await ListaEspera.getById(esperaId);
            if (!solicitud) {
                return res.redirect('/secretaria/lista-espera?status=error_no_existe');
            }

            // 2. Obtener la conexión para buscar la agenda
            conn = await createConnection();

            // Buscamos la agenda activa para ese médico, especialidad y que la fecha esté en rango
            const [agenda] = await conn.query(
                `SELECT id FROM agendas 
                 WHERE id_medico = ? AND id_especialidad = ? 
                 AND ? BETWEEN fecha_creacion AND fecha_fin 
                 LIMIT 1`,
                [medicoId, solicitud.id_especialidad, fecha]
            );

            if (!agenda || agenda.length === 0) {
                return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
            }

            // 3. Crear el turno usando el modelo Turno
            await Turno.create({
                fecha: fecha,
                hora_inicio: hora,
                motivo: 'Asignado desde Lista de Espera',
                id_paciente: solicitud.id_paciente,
                id_agenda: agenda[0].id,
                archivo_dni: null
            });

            // 4. Marcar la solicitud como Turno Asignado    
            await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

            // 5. Redirigir con éxito
            res.redirect('/secretaria/lista-espera?status=asignado_success');

        } catch (error) {
            console.error("Error al asignar turno:", error);
            next(error);
        } finally {
            if (conn) await conn.end(); 
        }
    }

    /**
     * Muestra el formulario para agregar a la lista de espera
     */
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

    /**
     * Verifica si un paciente ya está en la lista para evitar duplicados (AJAX)
     */
    async verificarDuplicado(req, res, next) {
        try {
            const { id_paciente, id_medico, id_especialidad } = req.query;

            if (!id_paciente || !id_medico || !id_especialidad) {
                return res.json({ existe: false });
            }

            const existe = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
            res.json({ existe: !!existe });
        } catch (error) {
            console.error("Error al verificar duplicado:", error);
            res.status(500).json({ existe: false, error: error.message });
        }
    }

    /**
     * Guarda un nuevo registro en la lista de espera
     */
    async store(req, res, next) {
        try {
            const { id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones } = req.body;

            if (!id_paciente || !id_medico || !id_especialidad) {
                return res.status(400).send("Error: Faltan datos obligatorios.");
            }

            const duplicado = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
            if (duplicado) {
                return res.status(400).send("Error: El paciente ya tiene un registro activo.");
            }

            const data = {
                id_paciente,
                id_medico,
                id_especialidad,
                prioridad: prioridad || 'Media',
                motivo_prioridad: motivo_prioridad || null,
                observaciones: observaciones || null,
                id_usuario_creador: (req.user && req.user.id) ? req.user.id : 1
            };

            await ListaEspera.create(data);
            res.redirect('/secretaria/lista-espera');

        } catch (error) {
            console.error("Error al guardar en Lista de Espera:", error);
            next(error);
        }
    }

    /**
     * Cambia el estado manualmente (Ej: a 'Cancelado')
     */
    async actualizarEstado(req, res, next) {
        try {
            const { id } = req.params;
            const { nuevo_estado } = req.body;
            await ListaEspera.updateEstado(id, nuevo_estado);
            res.redirect('/secretaria/lista-espera');
        } catch (error) { next(error); }
    }

    /**
     * Borrado físico/lógico según el modelo
     */
    async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await ListaEspera.delete(id);
            res.redirect('/secretaria/lista-espera');
        } catch (error) { next(error); }
    }
}

module.exports = new ListaEsperaController();