const createConnection = require('../config/configDb');

class ListaEspera {

    // 1. Verificar duplicados (ahora con soporte opcional para transacciones)
    static async verificarSiExiste(id_paciente, id_medico, id_especialidad, connection = null) {
        const conn = connection || await createConnection();
        try {
            // Consulta 1: Buscar en Lista de Espera Pendiente
            const sqlEspera = `
            SELECT id FROM lista_espera 
            WHERE id_paciente = ? AND id_medico = ? AND id_especialidad = ? 
            AND estado = 'Pendiente' LIMIT 1`;

            // Consulta 2: Buscar en Turnos Activos (Confirmados o Pendientes) a futuro
            const sqlTurno = `
            SELECT t.id FROM turnos t
            INNER JOIN agendas a ON t.id_agenda = a.id
            WHERE t.id_paciente = ? AND a.id_medico = ? AND a.id_especialidad = ?
            AND t.fecha >= CURDATE() 
            AND t.estado IN ('Confirmado', 'Pendiente') LIMIT 1`;

            const [resEspera] = await conn.query(sqlEspera, [Number(id_paciente), Number(id_medico), Number(id_especialidad)]);
            const [resTurno] = await conn.query(sqlTurno, [Number(id_paciente), Number(id_medico), Number(id_especialidad)]);

            return {
                enLista: resEspera.length > 0,
                tieneTurno: resTurno.length > 0,
                bloqueado: resEspera.length > 0 || resTurno.length > 0
            };
        } catch (error) {
            console.error("Error en verificarSiExiste integral:", error);
            throw error;
        } finally {
            if (!connection && conn) conn.end();
        }
    }

    // 2. Crear registro (incluye sanitización de strings)
    static async create(data) {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
                INSERT INTO lista_espera 
                (id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones, id_usuario_creador, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')
            `;

            const [result] = await conn.query(sql, [
                Number(data.id_paciente),
                Number(data.id_medico),
                Number(data.id_especialidad),
                data.prioridad || 'Media',
                data.motivo_prioridad ? data.motivo_prioridad.toString().substring(0, 255) : null,
                data.observaciones ? data.observaciones.toString().substring(0, 500) : null,
                data.id_usuario_creador
            ]);

            return result.insertId;
        } catch (error) {
            console.error("Error SQL en ListaEspera.create:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // 3. Obtener pendientes (tu consulta está perfecta, la mantenemos igual)
    static async getPendientes() {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
            SELECT 
                le.*, 
                u.email AS usuario_registro, 
                p_pac.nombre AS paciente_nombre, 
                p_pac.apellido AS paciente_apellido,
                p_pac.dni AS paciente_dni,
                GROUP_CONCAT(DISTINCT t.numero SEPARATOR ' / ') AS paciente_telefono,
                p_pac.email AS paciente_email,
                p_med.apellido AS medico_apellido,
                e.nombre AS especialidad_nombre
            FROM lista_espera le
            INNER JOIN usuarios u ON le.id_usuario_creador = u.id 
            INNER JOIN pacientes pac ON le.id_paciente = pac.id
            INNER JOIN personas p_pac ON pac.id_persona = p_pac.id
            LEFT JOIN telefonos t ON p_pac.id = t.id_persona 
            INNER JOIN medicos m ON le.id_medico = m.id_medico
            INNER JOIN personas p_med ON m.id_persona = p_med.id
            INNER JOIN especialidades e ON le.id_especialidad = e.id
            WHERE le.estado = 'Pendiente'
            GROUP BY le.id 
            ORDER BY 
                CASE le.prioridad 
                    WHEN 'Alta' THEN 1 
                    WHEN 'Media' THEN 2 
                    WHEN 'Baja' THEN 3 
                END, le.fecha_registro ASC
            `;
            const [rows] = await conn.query(sql);
            return rows;
        } catch (error) {
            console.error("Error en getPendientes:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // 4. Update Estado (Soporta transacciones para cuando asignas un turno)
    static async updateEstado(id, nuevoEstado, connection = null) {
        const conn = connection || await createConnection();
        try {
            await conn.query('UPDATE lista_espera SET estado = ? WHERE id = ?', [nuevoEstado, id]);
            return true;
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            throw error;
        } finally {
            if (!connection && conn) conn.end();
        }
    }

    // 5. Borrado lógico
    static async delete(id) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query("UPDATE lista_espera SET estado = 'Cancelado' WHERE id = ?", [id]);
            return true;
        } catch (error) {
            console.error("Error al anular registro:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    static async getById(id) {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
                SELECT 
                    le.*, 
                    pe_med.apellido AS medico_apellido,
                    e.nombre AS especialidad_nombre
                FROM lista_espera le
                INNER JOIN medicos m ON le.id_medico = m.id_medico
                INNER JOIN personas pe_med ON m.id_persona = pe_med.id
                INNER JOIN especialidades e ON le.id_especialidad = e.id
                WHERE le.id = ?
            `;
            const [rows] = await conn.query(sql, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error("Error en ListaEspera.getById:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = ListaEspera;