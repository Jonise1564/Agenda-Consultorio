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
    // ACTUALIZAR / TRASLADAR TURNO INDIVIDUAL
    // ============================================    
    static async actualizar(id, datos) {
        let conn;
        try {
            conn = await createConnection();
            const { fecha, hora_inicio, id_agenda, estado, motivo } = datos;

            // Usamos un UPDATE directo para asegurar que los valores nuevos entren
            const sql = `
                UPDATE turnos 
                SET fecha = ?, 
                    hora_inicio = ?, 
                    id_agenda = ?, 
                    estado = ?,
                    motivo = ?
                WHERE id = ?
            `;

            // Si hora_inicio viene como "10:00", MySQL lo acepta bien como TIME
            const [result] = await conn.query(sql, [
                fecha,
                hora_inicio,
                id_agenda,
                estado || 'Reservado',
                motivo || 'Traslado de turno',
                id
            ]);

            console.log("Filas afectadas en DB:", result.affectedRows);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error real en DB al actualizar:", error);
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
    static async agendarTurnoVirtual(data) {
        let conn;
        try {
            conn = await createConnection();
            const { fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni } = data;

            const [existe] = await conn.query(
                "SELECT id FROM turnos WHERE id_agenda = ? AND fecha = ? AND hora_inicio = ?",
                [id_agenda, fecha, hora_inicio]
            );

            if (existe.length > 0) {
                await conn.query(
                    `UPDATE turnos SET estado = 'Reservado', id_paciente = ?, motivo = ?, archivo_dni = ? WHERE id = ?`,
                    [id_paciente, motivo, archivo_dni, existe[0].id]
                );
                return existe[0].id;
            } else {
                const [result] = await conn.query(
                    `INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda, archivo_dni)
                     VALUES (?, ?, ?, 'Reservado', 1, ?, ?, ?)`,
                    [fecha, hora_inicio, motivo, id_paciente, id_agenda, archivo_dni]
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
                t.id, t.fecha, DATE_FORMAT(t.hora_inicio, '%H:%i') AS hora, t.estado, t.motivo, t.archivo_dni,
                p_per.nombre AS paciente_nombre, p_per.apellido AS paciente_apellido, p_per.dni AS paciente_dni,
                m_per.nombre AS medico_nombre, m_per.apellido AS medico_apellido,
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

            sql += ` ORDER BY t.fecha DESC, t.hora_inicio ASC LIMIT 200`;

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




}

module.exports = Turno;