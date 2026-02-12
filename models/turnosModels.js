const createConnection = require('../config/configDb');

class Turno {
    constructor(id, fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda) {
        this.id = id;
        this.fecha = fecha;
        this.hora_inicio = hora_inicio;
        this.motivo = motivo;
        this.estado = estado;
        this.orden = orden;
        this.id_paciente = id_paciente;
        this.id_agenda = id_agenda;
    }

    // ============================================
    // OBTENER TODOS LOS TURNOS DE UNA AGENDA
    // ============================================
    static async getAll(id_agenda) {
        let conn;
        try {
            conn = await createConnection();
            const [turnos] = await conn.query(`
                SELECT 
                    t.id, t.fecha, t.hora_inicio, t.estado, t.orden, t.motivo, t.archivo_dni,
                    p.nombre AS paciente_nombre,
                    p.apellido AS paciente_apellido,
                    p.dni AS paciente_dni,
                    m.id_medico,
                    mp.nombre AS medico_nombre,
                    mp.apellido AS medico_apellido
                FROM turnos t
                LEFT JOIN pacientes pa ON t.id_paciente = pa.id
                LEFT JOIN personas p ON pa.id_persona = p.id
                INNER JOIN agendas a ON t.id_agenda = a.id
                INNER JOIN medicos m ON a.id_medico = m.id_medico
                INNER JOIN personas mp ON m.id_persona = mp.id
                WHERE t.id_agenda = ?
                ORDER BY t.fecha, t.hora_inicio, t.orden;
            `, [id_agenda]);
            return turnos;
        } catch (error) {
            console.error('Error fetching turnos:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // OBTENER TURNO POR ID
    // ============================================
    static async getById(id) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT 
                    t.*,
                    per.nombre AS paciente_nombre,
                    per.apellido AS paciente_apellido,
                    per.dni AS dni
                FROM turnos t
                LEFT JOIN pacientes p ON t.id_paciente = p.id
                LEFT JOIN personas per ON p.id_persona = per.id
                WHERE t.id = ?;
            `, [id]);
            return rows[0];
        } catch (error) {
            console.error('Error getById:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // CREAR TURNO
    // ============================================
    static async create(data) {
        let conn;
        try {
            conn = await createConnection();
            const { fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni } = data;
            const sql = `
                INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda, archivo_dni)
                VALUES (?, ?, ?, 'pendiente', 1, ?, ?, ?);
            `;
            const [result] = await conn.query(sql, [fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni]);
            return result.insertId;
        } catch (error) {
            console.error("Error creando turno:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }


    // ============================================
    // ACTUALIZAR DINÁMICO (Estado, Traslado, Observaciones)
    // ============================================    
    static async actualizar(id, datos) {
        let conn;
        try {
            conn = await createConnection();

            // Filtramos solo las llaves que tienen valor para armar la query
            const keys = Object.keys(datos).filter(key => datos[key] !== undefined);
            const fields = keys.map(key => `${key} = ?`).join(', ');
            const values = keys.map(key => datos[key]);

            if (fields.length === 0) return false; // Nada que actualizar

            values.push(id);
            const sql = `UPDATE turnos SET ${fields} WHERE id = ?`;

            const [result] = await conn.query(sql, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error en Turno.actualizar:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // ELIMINAR TURNO
    // ============================================
    static async delete(id) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`DELETE FROM turnos WHERE id = ?;`, [id]);
            return result.affectedRows === 1;
        } catch (error) {
            console.error("Error eliminando turno:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // AUXILIARES
    // ============================================
    static async obtenerHorariosOcupados(id_agenda, fecha) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT DATE_FORMAT(hora_inicio, '%H:%i') AS hora
                FROM turnos
                WHERE id_agenda = ? AND fecha = ?
                AND estado IN ('Reservado', 'Confirmado', 'Pendiente', 'En Consulta')
            `, [id_agenda, fecha]);
            return rows.map(r => r.hora);
        } finally {
            if (conn) conn.end();
        }
    }

    static async getAgendaIdByTurnoId(id) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`SELECT id_agenda FROM turnos WHERE id = ?`, [id]);
            return rows[0] ? rows[0].id_agenda : null;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // AGENDAR TURNO VIRTUAL
    // ============================================    
    // static async agendarTurnoVirtual(data) {
    //     let conn;
    //     try {
    //         conn = await createConnection();
    //         const { fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni, es_sobreturno } = data;
    //         const sobreturnoBit = es_sobreturno ? 1 : 0;

    //         // 1. OBTENER INFO DE LA AGENDA ACTUAL (Médico y Especialidad)
    //         const [agendaActual] = await conn.query(
    //             "SELECT id_medico, id_especialidad FROM agendas WHERE id = ?",
    //             [id_agenda]
    //         );
    //         const { id_medico, id_especialidad } = agendaActual[0];

    //         // 2. VALIDAR: 1 SOLO TURNO POR DÍA PARA ESA ESPECIALIDAD CON ESE MÉDICO
    //         // Esto permite que el paciente vea al mismo médico hoy, pero por OTRA especialidad distinta.
    //         const [mismoMedicoEspecialidad] = await conn.query(`
    //         SELECT t.id 
    //         FROM turnos t
    //         INNER JOIN agendas a ON t.id_agenda = a.id
    //         WHERE t.id_paciente = ? 
    //           AND t.fecha = ? 
    //           AND a.id_medico = ? 
    //           AND a.id_especialidad = ?
    //           AND t.estado NOT IN ('Cancelado')
    //         LIMIT 1
    //     `, [id_paciente, fecha, id_medico, id_especialidad]);

    //         if (mismoMedicoEspecialidad.length > 0) {
    //             throw new Error(`Ya tienes un turno agendado para esta especialidad con el profesional en el día seleccionado.`);
    //         }

    //         // 3. VALIDAR: SOLAPAMIENTO DE HORARIO (El paciente no puede estar en dos citas a la vez)
    //         const [mismoHorario] = await conn.query(`
    //         SELECT t.id 
    //         FROM turnos t
    //         WHERE t.id_paciente = ? 
    //           AND t.fecha = ? 
    //           AND t.hora_inicio = ? 
    //           AND t.estado NOT IN ('Cancelado')
    //         LIMIT 1
    //     `, [id_paciente, fecha, hora_inicio]);

    //         if (mismoHorario.length > 0) {
    //             throw new Error(`Ya tienes otro turno asignado a las ${hora_inicio.substring(0, 5)} hs. para este día.`);
    //         }

    //         // --- LÓGICA DE GUARDADO ---
    //         const [existe] = await conn.query(
    //             "SELECT id FROM turnos WHERE id_agenda = ? AND fecha = ? AND hora_inicio = ?",
    //             [id_agenda, fecha, hora_inicio]
    //         );

    //         if (existe.length > 0) {
    //             await conn.query(
    //                 `UPDATE turnos SET estado = 'Reservado', id_paciente = ?, motivo = ?, archivo_dni = ?, es_sobreturno = ? WHERE id = ?`,
    //                 [id_paciente, motivo, archivo_dni, sobreturnoBit, existe[0].id]
    //             );
    //             return existe[0].id;
    //         } else {
    //             const [result] = await conn.query(
    //                 `INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda, archivo_dni, es_sobreturno)
    //              VALUES (?, ?, ?, 'Reservado', 1, ?, ?, ?, ?)`,
    //                 [fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni, sobreturnoBit]
    //             );
    //             return result.insertId;
    //         }
    //     } catch (error) {
    //         console.error("Error en agendarTurnoVirtual:", error);
    //         throw error;
    //     } finally {
    //         if (conn) conn.end();
    //     }
    // }


    static async agendarTurnoVirtual(data) {
        let conn;
        try {
            conn = await createConnection();
            const { fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni, es_sobreturno } = data;
            const sobreturnoBit = es_sobreturno ? 1 : 0;

            // 0. VALIDAR CUPO DE SOBRETURNOS (Si corresponde)
            if (es_sobreturno) {
                // Usamos el método que ya tienes en la clase
                const hayCupo = await Turno.tieneCupoSobreturno(id_agenda, fecha);
                if (!hayCupo) {
                    throw new Error("Lo sentimos, se ha alcanzado el límite máximo de sobreturnos para este profesional en el día seleccionado.");
                }
            }

            // 1. OBTENER INFO DE LA AGENDA ACTUAL (Médico y Especialidad)
            const [agendaActual] = await conn.query(
                "SELECT id_medico, id_especialidad FROM agendas WHERE id = ?",
                [id_agenda]
            );
            
            if (agendaActual.length === 0) throw new Error("La agenda seleccionada no existe.");
            const { id_medico, id_especialidad } = agendaActual[0];

            // 2. VALIDAR: 1 SOLO TURNO POR DÍA PARA ESA ESPECIALIDAD CON ESE MÉDICO
            const [mismoMedicoEspecialidad] = await conn.query(`
                SELECT t.id 
                FROM turnos t
                INNER JOIN agendas a ON t.id_agenda = a.id
                WHERE t.id_paciente = ? 
                  AND t.fecha = ? 
                  AND a.id_medico = ? 
                  AND a.id_especialidad = ?
                  AND t.estado NOT IN ('Cancelado')
                LIMIT 1
            `, [id_paciente, fecha, id_medico, id_especialidad]);

            if (mismoMedicoEspecialidad.length > 0) {
                throw new Error(`Ya tienes un turno agendado para esta especialidad con el profesional en el día seleccionado.`);
            }

            // 3. VALIDAR: SOLAPAMIENTO DE HORARIO (El paciente no puede estar en dos citas a la vez)
            const [mismoHorario] = await conn.query(`
                SELECT t.id 
                FROM turnos t
                WHERE t.id_paciente = ? 
                  AND t.fecha = ? 
                  AND t.hora_inicio = ? 
                  AND t.estado NOT IN ('Cancelado')
                LIMIT 1
            `, [id_paciente, fecha, hora_inicio]);

            if (mismoHorario.length > 0) {
                throw new Error(`Ya tienes otro turno asignado a las ${hora_inicio.substring(0, 5)} hs. para este día.`);
            }

            // --- LÓGICA DE GUARDADO ---
            const [existe] = await conn.query(
                "SELECT id FROM turnos WHERE id_agenda = ? AND fecha = ? AND hora_inicio = ?",
                [id_agenda, fecha, hora_inicio]
            );

            if (existe.length > 0) {
                // Actualizar turno existente (si el hueco ya estaba creado en la tabla)
                await conn.query(
                    `UPDATE turnos SET estado = 'Reservado', id_paciente = ?, motivo = ?, archivo_dni = ?, es_sobreturno = ? WHERE id = ?`,
                    [id_paciente, motivo, archivo_dni, sobreturnoBit, existe[0].id]
                );
                return existe[0].id;
            } else {
                // Insertar nuevo registro (útil sobre todo para sobreturnos que no tienen hueco previo)
                const [result] = await conn.query(
                    `INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda, archivo_dni, es_sobreturno)
                     VALUES (?, ?, ?, 'Reservado', 1, ?, ?, ?, ?)`,
                    [fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni, sobreturnoBit]
                );
                return result.insertId;
            }
        } catch (error) {
            console.error("Error en agendarTurnoVirtual:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // LISTAR CON FILTROS (VISTA SECRETARÍA)
    // ============================================
    static async listarConFiltros(filtros) {
        let conn;
        try {
            conn = await createConnection();
            let sql = `
        SELECT 
            t.id, 
            t.fecha, 
            DATE_FORMAT(t.hora_inicio, '%H:%i') AS hora, 
            t.estado, 
            t.motivo, 
            t.archivo_dni,
            
            p_per.nombre AS paciente_nombre, 
            p_per.apellido AS paciente_apellido, 
            p_per.dni AS paciente_dni,
            m.id_medico, 
            m_per.nombre AS medico_nombre, 
            m_per.apellido AS medico_apellido,
            e.nombre AS especialidad_nombre
        FROM turnos t
        LEFT JOIN pacientes p ON t.id_paciente = p.id
        LEFT JOIN personas p_per ON p.id_persona = p_per.id
        LEFT JOIN agendas a ON t.id_agenda = a.id
        LEFT JOIN medicos m ON a.id_medico = m.id_medico
        LEFT JOIN personas m_per ON m.id_persona = m_per.id
        LEFT JOIN especialidades e ON a.id_especialidad = e.id
        WHERE 1=1
        `;

            const params = [];

            if (filtros.paciente) {
                sql += ` AND (p_per.nombre LIKE ? OR p_per.apellido LIKE ? OR p_per.dni LIKE ?)`;
                params.push(`%${filtros.paciente}%`, `%${filtros.paciente}%`, `%${filtros.paciente}%`);
            }

            if (filtros.profesional) {
                sql += ` AND (m_per.nombre LIKE ? OR m_per.apellido LIKE ?)`;
                params.push(`%${filtros.profesional}%`, `%${filtros.profesional}%`);
            }

            if (filtros.fecha) {
                sql += ` AND t.fecha = ?`;
                params.push(filtros.fecha);
            }

            // Cambiamos ASC por DESC para mostrar los más nuevos primero
            sql += ` ORDER BY t.fecha ASC, t.hora_inicio ASC LIMIT 200`;

            const [rows] = await conn.query(sql, params);
            return rows;
        } catch (error) {
            console.error('Error en listarConFiltros:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // Obtener Horarios Ocupados
    // ============================================
    static async obtenerHorariosOcupados(id_agenda, fecha) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT DATE_FORMAT(hora_inicio, '%H:%i') AS hora
                FROM turnos
                WHERE id_agenda = ? AND fecha = ?
                AND estado IN ('Reservado', 'Confirmado', 'Pendiente', 'En Consulta')
            `, [id_agenda, fecha]);
            return rows.map(r => r.hora);
        } finally {
            if (conn) conn.end();
        }

    }

    // ============================================
    // TRANSFERENCIA MASIVA DE AGENDAS
    // ============================================
    static async transferirMasivo(data) {
        let conn;
        try {
            conn = await createConnection();
            const { origen, fecha, especialidad, nueva_agenda_id } = data;

            // Actualiza todos los turnos del médico origen hacia la nueva agenda del médico destino
            const sql = `
                UPDATE turnos t
                INNER JOIN agendas a_orig ON t.id_agenda = a_orig.id
                SET t.id_agenda = ?
                WHERE a_orig.id_medico = ? 
                AND t.fecha = ? 
                AND a_orig.id_especialidad = ?
                AND t.estado IN ('Pendiente', 'Confirmado', 'Reservado')
            `;

            const [result] = await conn.query(sql, [nueva_agenda_id, origen, fecha, especialidad]);
            return result.affectedRows;
        } catch (error) {
            console.error('Error en transferirMasivo:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }


    // ============================================
    // OBTENER TURNOS DE UN PACIENTE ESPECÍFICO
    // ============================================
    static async getByPacienteId(id_paciente) {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
                SELECT 
                    t.id, 
                    t.fecha, 
                    DATE_FORMAT(t.hora_inicio, '%H:%i') AS hora, 
                    t.estado, 
                    t.motivo,
                    m_per.nombre AS medico_nombre, 
                    m_per.apellido AS medico_apellido,
                    e.nombre AS especialidad_nombre
                FROM turnos t
                INNER JOIN agendas a ON t.id_agenda = a.id
                INNER JOIN medicos m ON a.id_medico = m.id_medico
                INNER JOIN personas m_per ON m.id_persona = m_per.id
                INNER JOIN especialidades e ON a.id_especialidad = e.id
                WHERE t.id_paciente = ?
                ORDER BY t.fecha DESC, t.hora_inicio DESC;
            `;
            const [rows] = await conn.query(sql, [id_paciente]);
            return rows;
        } catch (error) {
            console.error('Error en getByPacienteId:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // listarPaginado
    static async listarPaginado(filtros, limit, offset) {
        let conn;
        try {
            conn = await createConnection();

            // --- LIMPIEZA DE FILTROS ---
            const cleanPaciente = (filtros.paciente === 'null' || !filtros.paciente) ? null : filtros.paciente;
            const cleanProfesional = (filtros.profesional === 'null' || !filtros.profesional) ? null : filtros.profesional;
            const cleanFecha = (filtros.fecha === 'null' || !filtros.fecha) ? null : filtros.fecha;
            const cleanSucursal = (filtros.sucursal === 'null' || !filtros.sucursal) ? null : filtros.sucursal;

            // CORRECCIÓN: Usamos 'filtros.especialidad' y 'filtros.status' que vienen del Controller
            const cleanEspecialidad = (filtros.especialidad === 'null' || !filtros.especialidad) ? null : filtros.especialidad;
            const cleanEstado = (filtros.status === 'null' || !filtros.status) ? null : filtros.status;

            let sql = `
            SELECT 
                t.id, t.fecha, DATE_FORMAT(t.hora_inicio, '%H:%i') AS hora, t.estado, t.motivo, t.archivo_dni, t.es_sobreturno, t.observaciones,
                p_per.nombre AS paciente_nombre, p_per.apellido AS paciente_apellido, p_per.dni AS paciente_dni,
                m.id_medico, m_per.nombre AS medico_nombre, m_per.apellido AS medico_apellido,
                e.nombre AS especialidad_nombre,
                s.nombre AS sucursal_nombre
            FROM turnos t
            LEFT JOIN pacientes p ON t.id_paciente = p.id
            LEFT JOIN personas p_per ON p.id_persona = p_per.id
            LEFT JOIN agendas a ON t.id_agenda = a.id
            LEFT JOIN medicos m ON a.id_medico = m.id_medico
            LEFT JOIN personas m_per ON m.id_persona = m_per.id
            LEFT JOIN especialidades e ON a.id_especialidad = e.id
            LEFT JOIN sucursales s ON a.id_sucursal = s.id
            WHERE 1=1
        `;

            const params = [];

            if (cleanPaciente) {
                sql += ` AND (p_per.nombre LIKE ? OR p_per.apellido LIKE ? OR p_per.dni LIKE ?)`;
                params.push(`%${cleanPaciente}%`, `%${cleanPaciente}%`, `%${cleanPaciente}%`);
            }
            if (cleanProfesional) {
                sql += ` AND (m_per.nombre LIKE ? OR m_per.apellido LIKE ?)`;
                params.push(`%${cleanProfesional}%`, `%${cleanProfesional}%`);
            }
            if (cleanFecha) {
                sql += ` AND t.fecha = ?`;
                params.push(cleanFecha);
            }
            if (cleanSucursal) {
                sql += ` AND s.nombre = ?`;
                params.push(cleanSucursal);
            }

            // Filtro de Especialidad: Si tu select envía el NOMBRE, usamos e.nombre. 
            // Si envía el ID, deberías cambiar a a.id_especialidad = ?
            if (cleanEspecialidad) {
                sql += ` AND e.nombre = ?`;
                params.push(cleanEspecialidad);
            }

            // Filtro de Estado (Status)
            if (cleanEstado) {
                sql += ` AND t.estado = ?`;
                params.push(cleanEstado);
            }

            sql += ` ORDER BY t.fecha DESC, t.hora_inicio DESC LIMIT ? OFFSET ?`;
            params.push(Number(limit), Number(offset));

            const [rows] = await conn.query(sql, params);
            return rows;
        } catch (error) {
            console.error("Error en listarPaginado:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }




    static async contarTurnos(filtros) {
        let conn;
        try {
            conn = await createConnection();

            // --- LIMPIEZA DE FILTROS ---
            const cleanPaciente = (filtros.paciente === 'null' || !filtros.paciente) ? null : filtros.paciente;
            const cleanProfesional = (filtros.profesional === 'null' || !filtros.profesional) ? null : filtros.profesional;
            const cleanFecha = (filtros.fecha === 'null' || !filtros.fecha) ? null : filtros.fecha;
            const cleanSucursal = (filtros.sucursal === 'null' || !filtros.sucursal) ? null : filtros.sucursal;

            // CORRECCIÓN: Usamos 'especialidad' y 'status' para coincidir con el controlador
            const cleanEspecialidad = (filtros.especialidad === 'null' || !filtros.especialidad) ? null : filtros.especialidad;
            const cleanEstado = (filtros.status === 'null' || !filtros.status) ? null : filtros.status;

            let sql = `
            SELECT COUNT(*) as total 
            FROM turnos t
            LEFT JOIN pacientes p ON t.id_paciente = p.id
            LEFT JOIN personas p_per ON p.id_persona = p_per.id
            LEFT JOIN agendas a ON t.id_agenda = a.id
            LEFT JOIN medicos m ON a.id_medico = m.id_medico
            LEFT JOIN personas m_per ON m.id_persona = m_per.id
            LEFT JOIN especialidades e ON a.id_especialidad = e.id
            LEFT JOIN sucursales s ON a.id_sucursal = s.id
            WHERE 1=1
        `;

            const params = [];

            if (cleanPaciente) {
                sql += ` AND (p_per.nombre LIKE ? OR p_per.apellido LIKE ? OR p_per.dni LIKE ?)`;
                params.push(`%${cleanPaciente}%`, `%${cleanPaciente}%`, `%${cleanPaciente}%`);
            }
            if (cleanProfesional) {
                sql += ` AND (m_per.nombre LIKE ? OR m_per.apellido LIKE ?)`;
                params.push(`%${cleanProfesional}%`, `%${cleanProfesional}%`);
            }
            if (cleanFecha) {
                sql += ` AND t.fecha = ?`;
                params.push(cleanFecha);
            }
            if (cleanSucursal) {
                sql += ` AND s.nombre = ?`;
                params.push(cleanSucursal);
            }
            if (cleanEspecialidad) {
                sql += ` AND e.nombre = ?`;
                params.push(cleanEspecialidad);
            }
            if (cleanEstado) {
                sql += ` AND t.estado = ?`;
                params.push(cleanEstado);
            }

            const [rows] = await conn.query(sql, params);
            return rows[0].total;
        } catch (error) {
            console.error("Error en contarTurnos:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }


    static async buscarPrimerHuecoLibre(id_medico, id_especialidad) {
        let conn;
        try {
            conn = await createConnection();

            // 1. Buscamos las agendas activas
            const [agendas] = await conn.query(`
            SELECT a.id, a.hora_inicio, a.hora_fin, a.duracion_turnos, 
                   DATE_FORMAT(a.fecha_creacion, '%Y-%m-%d') as fecha_creacion, 
                   DATE_FORMAT(a.fecha_fin, '%Y-%m-%d') as fecha_fin,
                   GROUP_CONCAT(ad.id_dia) as dias_atencion
            FROM agendas a
            JOIN agenda_dias ad ON a.id = ad.id_agenda
            WHERE a.id_medico = ? AND a.id_especialidad = ?
              AND a.fecha_fin >= CURDATE()
            GROUP BY a.id
        `, [id_medico, id_especialidad]);

            if (agendas.length === 0) return null;

            // 2. Revisar los próximos 15 días
            for (let i = 0; i < 15; i++) {
                let fechaBusqueda = new Date();
                fechaBusqueda.setDate(fechaBusqueda.getDate() + i);

                // Formatear fecha local manualmente para evitar errores de zona horaria
                const yyyy = fechaBusqueda.getFullYear();
                const mm = String(fechaBusqueda.getMonth() + 1).padStart(2, '0');
                const dd = String(fechaBusqueda.getDate()).padStart(2, '0');
                const fechaSQL = `${yyyy}-${mm}-${dd}`;

                let diaSemana = fechaBusqueda.getDay();
                diaSemana = (diaSemana === 0) ? 7 : diaSemana; // Ajuste Domingo = 7

                const agendaDia = agendas.find(ag =>
                    ag.dias_atencion.split(',').includes(diaSemana.toString()) &&
                    fechaSQL >= ag.fecha_creacion &&
                    fechaSQL <= ag.fecha_fin
                );

                if (agendaDia) {
                    // 3. OBTENER OCUPADOS 
                    const [ocupados] = await conn.query(
                        "SELECT DATE_FORMAT(hora_inicio, '%H:%i') as hora FROM turnos WHERE id_agenda = ? AND fecha = ? AND estado != 'Cancelado'",
                        [agendaDia.id, fechaSQL]
                    );
                    const horasOcupadas = ocupados.map(o => o.hora);

                    // 4. Generar slots
                    let [h, m] = agendaDia.hora_inicio.split(':').map(Number);
                    let [hEnd, mEnd] = agendaDia.hora_fin.split(':').map(Number);

                    let actual = h * 60 + m;
                    const fin = hEnd * 60 + mEnd;

                    // Si la fecha de búsqueda es HOY, no mostrar turnos que ya pasaron de hora
                    let minutoActualSiEsHoy = -1;
                    if (i === 0) {
                        const ahora = new Date();
                        minutoActualSiEsHoy = ahora.getHours() * 60 + ahora.getMinutes();
                    }

                    while (actual < fin) {
                        if (actual > minutoActualSiEsHoy) { // Solo turnos a futuro
                            let hh = Math.floor(actual / 60).toString().padStart(2, '0');
                            let mm = (actual % 60).toString().padStart(2, '0');
                            let horaSlot = `${hh}:${mm}`;

                            if (!horasOcupadas.includes(horaSlot)) {
                                return { fecha: fechaSQL, hora: horaSlot };
                            }
                        }
                        actual += agendaDia.duracion_turnos;
                    }
                }
            }
            return null;
        } catch (error) {
            console.error("Error en buscarPrimerHuecoLibre:", error);
            return null;
        } finally {
            if (conn) conn.end();
        }
    }


    // ============================================
    // VERIFICAR SI UN PACIENTE YA TIENE TURNO
    // ============================================
    static async verificarTurnoExistente(id_paciente, fecha, hora_inicio) {
        let conn;
        try {
            conn = await createConnection();
            // Buscamos si el paciente ya tiene un turno en ese horario que no esté cancelado
            const [rows] = await conn.query(`
                SELECT id FROM turnos 
                WHERE id_paciente = ? 
                AND fecha = ? 
                AND hora_inicio = ? 
                AND estado NOT IN ('Cancelado')
            `, [id_paciente, fecha, hora_inicio]);

            return rows.length > 0; // true si ya existe, false si está libre para este paciente
        } catch (error) {
            console.error("Error en verificarTurnoExistente:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // VERIFICAR SI UN PACIENTE YA TIENE TURNO EN EL DÍA (REGLA ESTRICTA)
    // ============================================
    static async verificarTurnoDia(id_paciente, fecha) {
        let conn;
        try {
            conn = await createConnection();
            // Buscamos cualquier turno (normal o sobreturno) para ese paciente en ese día
            // Ignoramos los cancelados para permitir re-agendar si canceló el anterior
            const [rows] = await conn.query(`
            SELECT id, DATE_FORMAT(hora_inicio, '%H:%i') AS hora 
            FROM turnos 
            WHERE id_paciente = ? 
            AND fecha = ? 
            AND estado NOT IN ('Cancelado')
            LIMIT 1
        `, [id_paciente, fecha]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error en verificarTurnoDia:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }



    // ============================================
    // OBTENER TURNOS DE AGENDAS DESACTIVADAS
    // ============================================
    static async getTurnosAgendasNoActivas() {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
          SELECT 
            t.id AS id, 
            t.fecha, 
            DATE_FORMAT(t.hora_inicio, '%H:%i') AS hora, 
            t.estado, 

            p_per.nombre AS paciente_nombre, 
            p_per.apellido AS paciente_apellido, 
            tel.numero AS paciente_telefono, 

            m_per.apellido AS medico_apellido, 
            e.nombre AS especialidad_nombre
        FROM turnos t
        INNER JOIN agendas a ON t.id_agenda = a.id
        INNER JOIN pacientes pac ON t.id_paciente = pac.id
        INNER JOIN personas p_per ON pac.id_persona = p_per.id

        LEFT JOIN telefonos tel 
        ON tel.id_persona = p_per.id
        AND tel.id = (
            SELECT MIN(id)
            FROM telefonos
            WHERE id_persona = p_per.id
        )

        LEFT JOIN medicos m 
            ON a.id_medico = m.id_medico
        LEFT JOIN personas m_per 
            ON m.id_persona = m_per.id
        LEFT JOIN especialidades e 
            ON a.id_especialidad = e.id

        WHERE a.activo = 0 
        AND t.estado IN ('Pendiente', 'Reservado', 'Confirmado')
        AND t.fecha >= CURDATE()
        ORDER BY t.fecha ASC, t.hora_inicio ASC;

        `;
            const [rows] = await conn.query(sql);
            return rows;
        } catch (error) {
            console.error("Error en getTurnosAfectadosPorBaja:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }


    // Validar si el paciente ya tiene un turno con el mismo médico el mismo día
    static async verificarTurnoMedicoDia(id_paciente, fecha, id_agenda) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT t.id 
                FROM turnos t
                INNER JOIN agendas a_existente ON t.id_agenda = a_existente.id
                WHERE t.id_paciente = ? 
                  AND t.fecha = ? 
                  AND t.estado NOT IN ('Cancelado')
                  AND a_existente.id_medico = (SELECT id_medico FROM agendas WHERE id = ?)
                LIMIT 1
            `, [id_paciente, fecha, id_agenda]);

            return rows.length > 0; // Retorna true si ya existe un turno
        } finally {
            if (conn) conn.end();
        }
    }

    // Validar si el paciente ya tiene un turno a esa misma hora (con cualquier médico)
    static async verificarTurnoHora(id_paciente, fecha, hora) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT id FROM turnos 
                WHERE id_paciente = ? AND fecha = ? AND hora_inicio = ? 
                AND estado NOT IN ('Cancelado')
                LIMIT 1
            `, [id_paciente, fecha, hora]);

            return rows.length > 0; // Retorna true si hay solapamiento
        } finally {
            if (conn) conn.end();
        }
    }

// ============================================
    // CONTAR SOBRETURNOS ACTUALES
    // ============================================
    static async contarSobreturnos(id_agenda, fecha) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT COUNT(*) as total 
                FROM turnos 
                WHERE id_agenda = ? AND fecha = ? 
                AND es_sobreturno = 1 
                AND estado NOT IN ('Cancelado')
            `, [id_agenda, fecha]);
            return rows[0].total;
        } catch (error) {
            console.error("Error en contarSobreturnos:", error);
            return 0;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================
    // VALIDAR SI HAY CUPO (BOOLEANO)
    // ============================================
    static async tieneCupoSobreturno(id_agenda, fecha) {
        let conn;
        try {
            conn = await createConnection();
            // 1. Obtener el límite de la agenda
            const [agenda] = await conn.query("SELECT limite_sobreturnos FROM agendas WHERE id = ?", [id_agenda]);
            const limiteMax = agenda[0]?.limite_sobreturnos || 0;

            // 2. Contar actuales
            const actuales = await this.contarSobreturnos(id_agenda, fecha);

            return actuales < limiteMax;
        } catch (error) {
            return false;
        } finally {
            if (conn) conn.end();
        }
    }




}

module.exports = Turno;