// const createConnection = require('../config/configDb');
// const ListaEspera = require('../models/listaEsperaModels');
// const Medico = require('../models/medicosModels');
// const Especialidad = require('../models/especialidadesModels');
// const Paciente = require('../models/pacientesModels');
// const Turno = require('../models/turnosModels');
// //const EmailService = require('../../services/EmailService');

// class ListaEsperaController {

//     /**
//      * Muestra la lista de pacientes en espera y busca huecos disponibles
//      */
//     async index(req, res, next) {
//         try {
//             // 1. Obtener la lista de pacientes en espera
//             const espera = await ListaEspera.getPendientes();

//             // 2. Cruzar con la agenda para buscar huecos disponibles
//             const esperaConHuecos = await Promise.all(espera.map(async (item) => {
//                 // Buscamos el primer hueco libre para este médico y especialidad
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

//     /**
//      * Procesa la asignación de un turno desde la lista de espera
//     */
//     // async asignarTurnoRapido(req, res, next) {
//     //     let conn;
//     //     try {
//     //         const { esperaId, fecha, hora, medicoId } = req.query;

//     //         // 1. Obtener la solicitud de la lista de espera
//     //         const solicitud = await ListaEspera.getById(esperaId);
//     //         if (!solicitud) {
//     //             return res.redirect('/secretaria/lista-espera?status=error_no_existe');
//     //         }

//     //         // 2. Obtener la conexión para buscar la agenda
//     //         conn = await createConnection();

//     //         // Buscamos la agenda activa para ese médico, especialidad y que la fecha esté en rango
//     //         const [agenda] = await conn.query(
//     //             `SELECT id FROM agendas 
//     //              WHERE id_medico = ? AND id_especialidad = ? 
//     //              AND ? BETWEEN fecha_creacion AND fecha_fin 
//     //              LIMIT 1`,
//     //             [medicoId, solicitud.id_especialidad, fecha]
//     //         );

//     //         if (!agenda || agenda.length === 0) {
//     //             return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
//     //         }

//     //         // 3. Crear el turno usando el modelo Turno
//     //         await Turno.create({
//     //             fecha: fecha,
//     //             hora_inicio: hora,
//     //             motivo: 'Asignado desde Lista de Espera',
//     //             id_paciente: solicitud.id_paciente,
//     //             id_agenda: agenda[0].id,
//     //             archivo_dni: null
//     //         });

//     //         // 4. Marcar la solicitud como Turno Asignado    
//     //         await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

//     //         // 5. Redirigir con éxito
//     //         res.redirect('/secretaria/lista-espera?status=asignado_success');

//     //     } catch (error) {
//     //         console.error("Error al asignar turno:", error);
//     //         next(error);
//     //     } finally {
//     //         if (conn) await conn.end();
//     //     }
//     // }
// async asignarTurnoRapido(req, res, next) {
//         let conn;
//         try {
//             // AJUSTE: Mapeamos los nombres que vienen del PUG
//             // El log decía: esperaId, id_paciente, fecha, hora, id_medico
//             const { esperaId, id_paciente, fecha, hora, id_medico } = req.query;

//             // 1. Obtener la solicitud de la lista de espera
//             const solicitud = await ListaEspera.getById(esperaId);
//             if (!solicitud) {
//                 return res.redirect('/secretaria/lista-espera?status=error_no_existe');
//             }

//             // 2. Obtener la conexión para buscar la agenda
//             conn = await createConnection();

//             // Buscamos la agenda activa
//             // USAMOS id_medico (que viene de req.query) y solicitud.id_especialidad
//             const [agenda] = await conn.query(
//                 `SELECT id FROM agendas 
//                  WHERE id_medico = ? AND id_especialidad = ? 
//                  AND ? BETWEEN fecha_creacion AND fecha_fin 
//                  LIMIT 1`,
//                 [id_medico, solicitud.id_especialidad, fecha]
//             );

//             // Si falla aquí, es porque la fecha no entra en el rango de la tabla 'agendas'
//             if (!agenda || agenda.length === 0) {
//                 console.log("Agenda no encontrada para médico:", id_medico, "Especialidad:", solicitud.id_especialidad, "Fecha:", fecha);
//                 return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
//             }

//             // 3. Crear el turno usando el modelo Turno
//             await Turno.create({
//                 fecha: fecha,
//                 hora_inicio: hora,
//                 motivo: 'Asignado desde Lista de Espera',
//                 id_paciente: id_paciente, // Usamos el ID que viene por URL
//                 id_agenda: agenda[0].id,
//                 archivo_dni: null
//             });

//             // 4. Marcar la solicitud como Turno Asignado     
//             await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

//             // 5. ENVIAR NOTIFICACIÓN (Opcional - aquí llamarías a tu servicio de mail)
//             if (req.query.notificar === 'true') {
//                 console.log(`Simulando envío de mail a paciente ID: ${id_paciente}`);
//                 // Aquí podrías llamar a: MailService.enviarConfirmacion(id_paciente, fecha, hora);
//             }

//             // 6. Redirigir con éxito
//             res.redirect('/secretaria/lista-espera?status=asignado_success');

//         } catch (error) {
//             console.error("Error al asignar turno:", error);
//             next(error);
//         } finally {
//             if (conn) await conn.end();
//         }
//     }




//     /**
//      * Muestra el formulario para agregar a la lista de espera
//      */
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

//     /**
//      * Verifica si un paciente ya está en la lista para evitar duplicados (AJAX)
//      */
//     async verificarDuplicado(req, res, next) {
//         try {
//             const { id_paciente, id_medico, id_especialidad } = req.query;

//             if (!id_paciente || !id_medico || !id_especialidad) {
//                 return res.json({ existe: false });
//             }

//             const existe = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
//             res.json({ existe: !!existe });
//         } catch (error) {
//             console.error("Error al verificar duplicado:", error);
//             res.status(500).json({ existe: false, error: error.message });
//         }
//     }

//     /**
//      * Guarda un nuevo registro en la lista de espera
//      */
//     async store(req, res, next) {
//         try {
//             const { id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones } = req.body;

//             if (!id_paciente || !id_medico || !id_especialidad) {
//                 return res.status(400).send("Error: Faltan datos obligatorios.");
//             }

//             const duplicado = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
//             if (duplicado) {
//                 return res.status(400).send("Error: El paciente ya tiene un registro activo.");
//             }

//             const data = {
//                 id_paciente,
//                 id_medico,
//                 id_especialidad,
//                 prioridad: prioridad || 'Media',
//                 motivo_prioridad: motivo_prioridad || null,
//                 observaciones: observaciones || null,
//                 id_usuario_creador: (req.user && req.user.id) ? req.user.id : 1
//             };

//             await ListaEspera.create(data);
//             res.redirect('/secretaria/lista-espera');

//         } catch (error) {
//             console.error("Error al guardar en Lista de Espera:", error);
//             next(error);
//         }
//     }

//     /**
//      * Cambia el estado manualmente (Ej: a 'Cancelado')
//      */
//     async actualizarEstado(req, res, next) {
//         try {
//             const { id } = req.params;
//             const { nuevo_estado } = req.body;
//             await ListaEspera.updateEstado(id, nuevo_estado);
//             res.redirect('/secretaria/lista-espera');
//         } catch (error) { next(error); }
//     }

//     /**
//      * Borrado físico/lógico según el modelo
//      */
//     async eliminar(req, res, next) {
//         try {
//             const { id } = req.params;
//             await ListaEspera.delete(id);
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
const EmailService = require('../services/emailService'); // Ruta ajustada

class ListaEsperaController {

    /**
     * Muestra la lista de pacientes en espera y busca huecos disponibles
     */
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

    /**
     * Procesa la asignación de un turno desde la lista de espera con notificación
    */
    // async asignarTurnoRapido(req, res, next) {
    //     let conn;
    //     try {
    //         const { esperaId, id_paciente, fecha, hora, id_medico, notificar } = req.query;

    //         // 1. Obtener datos de la solicitud y del paciente
    //         const solicitud = await ListaEspera.getById(esperaId);
    //         const datosPaciente = await Paciente.getDatosCompletos(id_paciente);

    //         if (!solicitud || !datosPaciente) {
    //             return res.redirect('/secretaria/lista-espera?status=error_no_existe');
    //         }

    //         // 2. Obtener la conexión y buscar la agenda activa
    //         conn = await createConnection();
    //         const [agenda] = await conn.query(
    //             `SELECT id FROM agendas 
    //              WHERE id_medico = ? AND id_especialidad = ? 
    //              AND ? BETWEEN fecha_creacion AND fecha_fin 
    //              LIMIT 1`,
    //             [id_medico, solicitud.id_especialidad, fecha]
    //         );

    //         if (!agenda || agenda.length === 0) {
    //             return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
    //         }

    //         // 3. Crear el turno
    //         await Turno.create({
    //             fecha: fecha,
    //             hora_inicio: hora,
    //             motivo: 'Asignado desde Lista de Espera',
    //             id_paciente: id_paciente,
    //             id_agenda: agenda[0].id,
    //             archivo_dni: null
    //         });

    //         // 4. Marcar la solicitud como procesada
    //         await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

    //         // 5. ENVIAR NOTIFICACIÓN REAL vía EmailService
    //         if (notificar === 'true' && datosPaciente.email) {
    //             const datosParaMail = {
    //                 nombre: datosPaciente.nombre || datosPaciente.apellido,
    //                 fecha: fecha, // YYYY-MM-DD para el ICS
    //                 hora: hora,
    //                 medico: solicitud.medico_nombre || 'Profesional Designado',
    //                 especialidad: solicitud.especialidad_nombre || 'Consulta General',
    //                 motivo: 'Asignación por disponibilidad en lista de espera'
    //             };

    //             // Llamada a tu función enviarConfirmacion
    //             await EmailService.enviarConfirmacion(datosPaciente.email, datosParaMail);
    //             console.log(`✅ Mail enviado a ${datosPaciente.email}`);
    //         }

    //         res.redirect('/secretaria/lista-espera?status=asignado_success');

    //     } catch (error) {
    //         console.error("Error al asignar turno:", error);
    //         next(error);
    //     } finally {
    //         if (conn) await conn.end();
    //     }
    // }
async asignarTurnoRapido(req, res, next) {
    let conn;
    try {
        // 1. Extraemos los datos. Cambiamos 'hora' por 'hora_inicio' para ser consistentes con el modelo Turno
        const { esperaId, id_paciente, fecha, hora, id_medico, notificar } = req.query;
        const hora_inicio = hora; 

        const solicitud = await ListaEspera.getById(esperaId);
        const datosPaciente = await Paciente.getDatosCompletos(id_paciente);

        if (!solicitud || !datosPaciente) {
            return res.redirect('/secretaria/lista-espera?status=error_no_existe');
        }

        conn = await createConnection();
        const [agenda] = await conn.query(
            `SELECT id FROM agendas 
             WHERE id_medico = ? AND id_especialidad = ? 
             AND ? BETWEEN fecha_creacion AND fecha_fin 
             LIMIT 1`,
            [id_medico, solicitud.id_especialidad, fecha]
        );

        if (!agenda || agenda.length === 0) {
            return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
        }

        // 2. Crear el turno usando el modelo (Asegúrate que Turno.create use 'hora_inicio')
        await Turno.create({
            fecha: fecha,
            hora_inicio: hora_inicio,
            motivo: 'Asignado desde Lista de Espera',
            id_paciente: id_paciente,
            id_agenda: agenda[0].id,
            archivo_dni: null
        });

        // 3. Marcar la solicitud como procesada
        await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

        // 4. ENVÍO DE MAIL 
        if (notificar === 'true' && datosPaciente.email) {
            const datosParaMail = {
                nombre: `${datosPaciente.nombre} ${datosPaciente.apellido}`,
                fecha: fecha, 
                hora: hora_inicio,
                medico: solicitud.medico_apellido ? `Dr/a. ${solicitud.medico_apellido}` : 'Profesional Designado',
                especialidad: solicitud.especialidad_nombre || 'Consulta',
                motivo: 'Asignación por disponibilidad en lista de espera'
            };

            // Ejecutamos el envío
            await EmailService.enviarConfirmacion(datosPaciente.email, datosParaMail);
        }

        res.redirect('/secretaria/lista-espera?status=success');

    } catch (error) {
        console.error("❌ Error al asignar turno:", error);
        res.redirect('/secretaria/lista-espera?status=error');
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
     * Verifica duplicados (AJAX)
     */
    async verificarDuplicado(req, res, next) {
        try {
            const { id_paciente, id_medico, id_especialidad } = req.query;
            if (!id_paciente || !id_medico || !id_especialidad) return res.json({ existe: false });

            const existe = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
            res.json({ existe: !!existe });
        } catch (error) {
            res.status(500).json({ existe: false, error: error.message });
        }
    }

    /**
     * Guarda un nuevo registro
     */
    async store(req, res, next) {
        try {
            const { id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones } = req.body;

            if (!id_paciente || !id_medico || !id_especialidad) {
                return res.status(400).send("Error: Faltan datos obligatorios.");
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