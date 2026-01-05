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
    // GET ALL TURNOS DE UNA AGENDA
    // ============================================
    static async getAll(id_agenda) {
        let conn;
        try {
            conn = await createConnection();

            const [turnos] = await conn.query(`
            SELECT 
                t.id,
                t.fecha,
                t.hora_inicio,
                t.estado,
                t.orden,
                t.motivo,

                -- Paciente
                p.nombre   AS paciente_nombre,
                p.apellido AS paciente_apellido,
                p.dni      AS paciente_dni,

                -- Médico
                m.id_medico,
                mp.nombre   AS medico_nombre,
                mp.apellido AS medico_apellido

            FROM turnos t

            -- Paciente (puede ser NULL)
            LEFT JOIN pacientes pa ON t.id_paciente = pa.id
            LEFT JOIN personas p   ON pa.id_persona = p.id

            -- Agenda / Médico
            INNER JOIN agendas a ON t.id_agenda = a.id
            INNER JOIN medicos m ON a.id_medico = m.id_medico
            INNER JOIN personas mp ON m.id_persona = mp.id

            WHERE t.id_agenda = ?
            ORDER BY t.fecha, t.hora_inicio, t.orden;

        `, [id_agenda]);

            return turnos;

        } catch (error) {
            console.error('Error fetching turnos:', error);
            throw new Error('Error al traer turnos desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }



    // ============================================
    // GET TURNO POR ID (ADAPTADO PARA RESERVAR)
    // ============================================
    static async getById(id) {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
                SELECT 
                    t.*,
                    CONCAT(per.apellido, ', ', per.nombre) AS paciente_nombre
                FROM turnos t
                LEFT JOIN pacientes p ON t.id_paciente = p.id
                LEFT JOIN personas per ON p.id_persona = per.id
                WHERE t.id = ?;
            `, [id]);

            return rows[0];

        } catch (error) {
            console.error('Error getById:', error);
            throw new Error('Error al obtener turno por ID');
        } finally {
            if (conn) conn.end();
        }
    }

    // Crear turno
    static async create(data) {
        let conn;
        try {
            conn = await createConnection();

            const { fecha, hora_inicio, motivo, id_paciente, id_agenda } = data;

            const sql = `
                INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
                VALUES (?, ?, ?, 'pendiente', 1, ?, ?);
            `;

            await conn.query(sql, [
                fecha,
                hora_inicio,
                motivo,
                id_paciente,
                id_agenda
            ]);

        } catch (error) {
            console.error("Error creando turno:", error);
            throw new Error("Error al crear turno");
        } finally {
            if (conn) conn.end();
        }
    }

    // Actualizar turno
    static async update(id, data) {
        let conn;
        try {
            conn = await createConnection();

            const { fecha, hora_inicio, motivo, estado, id_paciente } = data;

            await conn.query(`
                UPDATE turnos
                SET fecha = ?, hora_inicio = ?, motivo = ?, estado = ?, id_paciente = ?
                WHERE id = ?;
            `, [fecha, hora_inicio, motivo, estado, id_paciente, id]);

        } catch (error) {
            console.error("Error actualizando turno:", error);
            throw new Error("Error al actualizar turno");
        } finally {
            if (conn) conn.end();
        }
    }

    // Cambiar estado
    static async updateEstado(id, estado) {
        let conn;
        try {
            conn = await createConnection();

            await conn.query(`
                UPDATE turnos
                SET estado = ?
                WHERE id = ?;
            `, [estado, id]);

        } catch (error) {
            console.error("Error actualizando estado del turno:", error);
            throw new Error("Error al actualizar estado");
        } finally {
            if (conn) conn.end();
        }
    }

    // Eliminar turno
    static async delete(id) {
        let conn;
        try {
            conn = await createConnection();

            const [result] = await conn.query(`
                DELETE FROM turnos WHERE id = ?;
            `, [id]);

            // Devuelve true si eliminó un registro, false si no
            return result.affectedRows === 1;

        } catch (error) {
            console.error("Error eliminando turno:", error);
            throw new Error("Error al eliminar turno");
        } finally {
            if (conn) conn.end();
        }
    }
    // =====================================================
    // OBTENER HORARIOS OCUPADOS POR MÉDICO Y FECHA
    // =====================================================    
    static async obtenerHorariosOcupados(id_agenda, fecha) {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
         SELECT 
            DATE_FORMAT(hora_inicio, '%H:%i') AS hora
        FROM turnos
        WHERE id_agenda = ?
            AND fecha = ?
            AND estado IN ('Reservado', 'Confirmado', 'Pendiente', 'En Consulta')
    `, [id_agenda, fecha]);

            // Devuelve: ['08:00', '08:15', ...]
            return rows.map(r => r.hora);

        } catch (error) {
            console.error('Error obteniendo horarios ocupados:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }



    // =========================
    // BUSCAR TURNOS POR MÉDICO Y FECHA
    // =========================
    async buscarTurnos(req, res, next) {
        try {
            const { medico, fecha } = req.body;

            if (!medico || !fecha) {
                return res.status(400).json({
                    error: 'Faltan parámetros'
                });
            }

            const turnosOcupados = await Turno.obtenerHorariosOcupados(
                medico,
                fecha
            );

            res.json(turnosOcupados);

        } catch (error) {
            next(error);
        }
    }





}

module.exports = Turno;


