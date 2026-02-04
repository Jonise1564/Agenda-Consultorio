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
    // async asignarTurnoRapido(req, res, next) {
    //     let conn;
    //     try {
    //         // 1. Extraemos los datos. Cambiamos 'hora' por 'hora_inicio' para ser consistentes con el modelo Turno
    //         const { esperaId, id_paciente, fecha, hora, id_medico, notificar } = req.query;
    //         const hora_inicio = hora;

    //         const solicitud = await ListaEspera.getById(esperaId);
    //         const datosPaciente = await Paciente.getDatosCompletos(id_paciente);

    //         if (!solicitud || !datosPaciente) {
    //             return res.redirect('/secretaria/lista-espera?status=error_no_existe');
    //         }

    //         conn = await createConnection();
    //         const [agenda] = await conn.query(
    //             `SELECT id FROM agendas 
    //          WHERE id_medico = ? AND id_especialidad = ? 
    //          AND ? BETWEEN fecha_creacion AND fecha_fin 
    //          LIMIT 1`,
    //             [id_medico, solicitud.id_especialidad, fecha]
    //         );

    //         if (!agenda || agenda.length === 0) {
    //             return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
    //         }

    //         // 2. Crear el turno usando el modelo (Asegúrate que Turno.create use 'hora_inicio')
    //         await Turno.create({
    //             fecha: fecha,
    //             hora_inicio: hora_inicio,
    //             motivo: 'Asignado desde Lista de Espera',
    //             id_paciente: id_paciente,
    //             id_agenda: agenda[0].id,
    //             archivo_dni: null
    //         });

    //         // 3. Marcar la solicitud como procesada
    //         await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

    //         // 4. ENVÍO DE MAIL 
    //         console.log("¿Notificar es true?:", notificar); // Log de control
    //         console.log("Email del paciente:", datosPaciente ? datosPaciente.email : 'No encontrado');

    //         if (notificar === 'true' && datosPaciente.email) {
    //             const datosParaMail = {
    //                 nombre: `${datosPaciente.nombre} ${datosPaciente.apellido}`,
    //                 fecha: fecha,
    //                 hora: hora_inicio,
    //                 medico: solicitud.medico_apellido ? `Dr/a. ${solicitud.medico_apellido}` : 'Profesional Designado',
    //                 especialidad: solicitud.especialidad_nombre || 'Consulta',
    //                 motivo: 'Asignación por disponibilidad en lista de espera'
    //             };

    //             // Ejecutamos el envío
    //             await EmailService.enviarConfirmacion(datosPaciente.email, datosParaMail);
    //         }

    //         res.redirect('/secretaria/lista-espera?status=success');

    //     } catch (error) {
    //         console.error("❌ Error al asignar turno:", error);
    //         res.redirect('/secretaria/lista-espera?status=error');
    //     } finally {
    //         if (conn) await conn.end();
    //     }
    // }



    // async asignarTurnoRapido(req, res, next) {
    //     let conn;
    //     try {
    //         // 1. Extraemos los parámetros de la URL
    //         const { esperaId, id_paciente, fecha, hora, id_medico, notificar } = req.query;
    //         const hora_inicio = hora;

    //         // 2. Obtenemos datos de la solicitud y del paciente (incluyendo su email)
    //         const solicitud = await ListaEspera.getById(esperaId);
    //         const datosPaciente = await Paciente.getDatosCompletos(id_paciente);

    //         if (!solicitud || !datosPaciente) {
    //             console.error("❌ No se encontró la solicitud o los datos del paciente");
    //             return res.redirect('/secretaria/lista-espera?status=error_no_existe');
    //         }

    //         // 3. Buscamos la agenda correspondiente
    //         conn = await createConnection();
    //         const [agenda] = await conn.query(
    //             `SELECT id FROM agendas 
    //          WHERE id_medico = ? AND id_especialidad = ? 
    //          AND ? BETWEEN fecha_creacion AND fecha_fin 
    //          LIMIT 1`,
    //             [id_medico, solicitud.id_especialidad, fecha]
    //         );

    //         if (!agenda || agenda.length === 0) {
    //             return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
    //         }

    //         // 4. Creamos el turno en la base de datos
    //         await Turno.create({
    //             fecha: fecha,
    //             hora_inicio: hora_inicio,
    //             motivo: 'Asignado desde Lista de Espera',
    //             id_paciente: id_paciente,
    //             id_agenda: agenda[0].id,
    //             archivo_dni: null
    //         });

    //         // 5. Marcamos la solicitud de lista de espera como 'Turno Asignado'
    //         await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

    //         // 6. LÓGICA DE NOTIFICACIÓN POR EMAIL
    //         console.log(`--- Intento de notificación ---`);
    //         console.log(`> Notificar param: ${notificar}`);
    //         console.log(`> Email destino: ${datosPaciente.email}`);

    //         if (notificar === 'true' && datosPaciente.email) {
    //             const datosParaMail = {
    //                 nombre: `${datosPaciente.nombre} ${datosPaciente.apellido}`,
    //                 fecha: fecha,
    //                 hora: hora_inicio,
    //                 medico: solicitud.medico_apellido ? `Dr/a. ${solicitud.medico_apellido}` : 'Profesional Designado',
    //                 especialidad: solicitud.especialidad_nombre || 'Consulta',
    //                 motivo: 'Asignación por disponibilidad en lista de espera'
    //             };

    //             try {
    //                 // El envío es asíncrono pero lo esperamos para confirmar el log
    //                 await EmailService.enviarConfirmacion(datosPaciente.email, datosParaMail);
    //                 console.log(`✅ Mail enviado con éxito a: ${datosPaciente.email}`);
    //             } catch (mailError) {
    //                 // Si el mail falla, NO lanzamos error al usuario, solo lo registramos
    //                 console.error("❌ Error en EmailService (el turno se creó igual):", mailError.message);
    //             }
    //         } else {
    //             console.log("⚠️ Notificación omitida: Parámetro 'notificar' es false o el paciente no tiene email cargado.");
    //         }

    //         // 7. Redirección final con éxito
    //         res.redirect('/secretaria/lista-espera?status=success');

    //     } catch (error) {
    //         console.error("❌ Error crítico en asignarTurnoRapido:", error);
    //         res.redirect('/secretaria/lista-espera?status=error');
    //     } finally {
    //         if (conn) await conn.end();
    //     }
    // }

    async asignarTurnoRapido(req, res, next) {
        let conn;
        try {
            // 1. Extraemos los parámetros de la URL
            // Notar que 'hora' se recibe del query y se asigna a hora_inicio
            const { esperaId, id_paciente, fecha, hora, id_medico, notificar } = req.query;
            const hora_inicio = hora;

            // 2. Obtenemos datos de la solicitud y del paciente
            // IMPORTANTE: Estos métodos deben traer médico_apellido, especialidad_nombre y email
            const solicitud = await ListaEspera.getById(esperaId);
            const datosPaciente = await Paciente.getDatosCompletos(id_paciente);

            if (!solicitud || !datosPaciente) {
                console.error("❌ No se encontró la solicitud o los datos del paciente");
                return res.redirect('/secretaria/lista-espera?status=error_no_existe');
            }

            // 3. Buscamos la agenda correspondiente para obtener el id_agenda
            conn = await createConnection();
            const [agenda] = await conn.query(
                `SELECT id FROM agendas 
             WHERE id_medico = ? AND id_especialidad = ? 
             AND ? BETWEEN fecha_creacion AND fecha_fin 
             LIMIT 1`,
                [id_medico, solicitud.id_especialidad, fecha]
            );

            if (!agenda || agenda.length === 0) {
                console.error("❌ No se encontró una agenda activa para este médico/especialidad");
                return res.redirect('/secretaria/lista-espera?status=error_sin_agenda');
            }

            // 4. Creamos el turno en la base de datos
            await Turno.create({
                fecha: fecha,
                hora_inicio: hora_inicio,
                motivo: 'Asignado desde Lista de Espera',
                id_paciente: id_paciente,
                id_agenda: agenda[0].id,
                archivo_dni: null
            });

            // 5. Marcamos la solicitud de lista de espera como finalizada
            await ListaEspera.updateEstado(esperaId, 'Turno Asignado');

            // 6. LÓGICA DE NOTIFICACIÓN POR EMAIL
            console.log(`--- Procesando notificación ---`);
            console.log(`> Notificar: ${notificar} | Email: ${datosPaciente.email}`);

            // Verificamos que se solicite notificar y que el paciente tenga correo
            if (notificar === 'true' && datosPaciente.email) {
                const datosParaMail = {
                    nombre: `${datosPaciente.nombre} ${datosPaciente.apellido}`,
                    fecha: fecha,
                    hora: hora_inicio,
                    // Usamos los alias definidos en el JOIN de tu modelo ListaEspera
                    medico: solicitud.medico_apellido ? `Dr/a. ${solicitud.medico_apellido}` : 'Profesional Designado',
                    especialidad: solicitud.especialidad_nombre || 'Consulta General',
                    motivo: 'Asignación por disponibilidad en lista de espera'
                };

                try {
                    // Envío asíncrono
                    await EmailService.enviarConfirmacion(datosPaciente.email, datosParaMail);
                    console.log(`✅ Mail enviado con éxito a: ${datosPaciente.email}`);
                } catch (mailError) {
                    // Logueamos el error pero no interrumpimos la experiencia del usuario
                    console.error("❌ Error en EmailService (el turno se creó igual):", mailError.message);
                }
            } else {
                console.log("⚠️ Notificación omitida (parámetro false o falta email).");
            }

            // 7. Redirección al éxito
            res.redirect('/secretaria/lista-espera?status=success');

        } catch (error) {
            console.error("❌ Error crítico en asignarTurnoRapido:", error);
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
            // El PUG envía ?paciente=X&medico=Y&especialidad=Z
            const { paciente, medico, especialidad } = req.query;

            if (!paciente || !medico || !especialidad) {
                return res.json({ existe: false });
            }

            const existe = await ListaEspera.verificarSiExiste(paciente, medico, especialidad);
            res.json({ existe: !!existe });
        } catch (error) {
            res.status(500).json({ existe: false, error: error.message });
        }
    }


    // Guarda un nuevo registro
    async store(req, res, next) {
        try {
            const { id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones } = req.body;

            if (!id_paciente || !id_medico || !id_especialidad) {
                return res.status(400).send("Error: Faltan datos obligatorios.");
            }

            // --- BLOQUEO DE SEGURIDAD EN BACKEND ---
            const duplicado = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
            if (duplicado) {
                // Si el frontend falló o fue ignorado, el backend detiene la inserción
                console.log("⚠️ Intento de duplicado bloqueado en backend para paciente:", id_paciente);
                return res.redirect('/secretaria/lista-espera?status=duplicado');
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
            res.redirect('/secretaria/lista-espera?status=success');
        } catch (error) {
            console.error("Error al guardar en Lista de Espera:", error);
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