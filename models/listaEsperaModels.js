

const createConnection = require('../config/configDb');

class ListaEspera {
    
    /**
     * NUEVO: Verifica si ya existe el paciente para ese médico y especialidad con estado Pendiente
     */
    static async verificarSiExiste(id_paciente, id_medico, id_especialidad) {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
                SELECT id FROM lista_espera 
                WHERE id_paciente = ? 
                AND id_medico = ? 
                AND id_especialidad = ? 
                AND estado = 'Pendiente' 
                LIMIT 1
            `;
            const [rows] = await conn.query(sql, [id_paciente, id_medico, id_especialidad]);
            return rows.length > 0;
        } catch (error) {
            console.error("Error en verificarSiExiste:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Crea un nuevo registro en la lista de espera
     */
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
                data.id_paciente,
                data.id_medico,
                data.id_especialidad,
                data.prioridad || 'Media',
                data.motivo_prioridad || null,
                data.observaciones || null,
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

    /**
     * Obtiene los pacientes pendientes con datos de contacto y profesional asignado
     */
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
                    t.numero AS paciente_telefono,
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

    /**
     * Actualiza el estado de un registro (Ej: a 'Atendido')
     */
    static async updateEstado(id, nuevoEstado) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('UPDATE lista_espera SET estado = ? WHERE id = ?', [nuevoEstado, id]);
            return true;
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    /**
     * Realiza un borrado lógico cambiando el estado a 'Cancelado'
     */
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
}

module.exports = ListaEspera;
