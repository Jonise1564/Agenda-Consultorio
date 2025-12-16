const createConnection = require('../config/configDb');

class Paciente {

    // ======================================================
    // GET ALL PACIENTES
    // ======================================================
    static async getAll() {
        let conn;
        try {
            conn = await createConnection();

            const [pacientes] = await conn.query(`
                SELECT 
                    pa.id AS id_paciente,
                    pa.id_usuario,
                    pa.id_obra_social,
                    pa.estado,
                    pa.id_persona,

                    p.dni,
                    p.nombre,
                    p.apellido,
                    p.nacimiento,

                    u.email,
                    u.id_rol,

                    COALESCE(os.nombre, 'Sin obra social') AS obra_social,
                    COALESCE(GROUP_CONCAT(DISTINCT t.numero ORDER BY t.numero SEPARATOR ', '), '') AS telefonos
                    
                FROM pacientes pa
                INNER JOIN usuarios u ON pa.id_usuario = u.id
                INNER JOIN personas p ON pa.id_persona = p.id
                LEFT JOIN obras_sociales os ON pa.id_obra_social = os.id
                LEFT JOIN telefonos t ON u.id = t.id_persona
                GROUP BY pa.id;
            `);

            return pacientes;

        } catch (error) {
            console.error('Error fetching pacientes:', error);
            throw new Error('Error al traer pacientes desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // GET PACIENTE POR ID
    // ======================================================
    static async getPacienteById(id_paciente) {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
                SELECT 
                    pa.id AS id_paciente,
                    pa.id_usuario,
                    pa.id_obra_social,
                    pa.estado,

                    p.id AS id_persona,
                    p.nombre,
                    p.apellido,
                    p.nacimiento,
                    p.dni,

                    u.email,
                    u.password

                FROM pacientes pa
                INNER JOIN personas p ON pa.id_persona = p.id
                INNER JOIN usuarios u ON pa.id_usuario = u.id
                WHERE pa.id = ?;
            `, [id_paciente]);

            return rows.length ? rows[0] : null;

        } catch (error) {
            console.error("Model Paciente: Error getPacienteById:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // UPDATE PACIENTE POR ID
    // ======================================================
    static async updatePaciente(id_paciente, updates) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            // --- UPDATE PERSONA ---
            await conn.query(`
                UPDATE personas
                SET nombre = ?, apellido = ?, nacimiento = ?
                WHERE id = (
                    SELECT id_persona FROM pacientes WHERE id = ?
                )
            `, [
                updates.nombre,
                updates.apellido,
                updates.nacimiento,
                id_paciente
            ]);

            // --- UPDATE USUARIO ---
            await conn.query(`
                UPDATE usuarios
                SET email = ?, password = ?
                WHERE id = (
                    SELECT id_usuario FROM pacientes WHERE id = ?
                )
            `, [
                updates.email,
                updates.password,
                id_paciente
            ]);

            // --- UPDATE PACIENTE ---
            await conn.query(`
                UPDATE pacientes
                SET id_obra_social = ?
                WHERE id = ?
            `, [
                updates.id_obra_social,
                id_paciente
            ]);

            await conn.commit();
            return true;

        } catch (error) {
            if (conn) await conn.rollback();
            console.error("Error al modificar paciente:", error);
            throw new Error("Error al modificar paciente");
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // ACTIVAR / INACTIVAR PACIENTE POR ID
    // ======================================================
    static async inactivarPaciente(id_paciente) {
        const conn = await createConnection();
        const [res] = await conn.query(`
            UPDATE pacientes
            SET estado = 0
            WHERE id = ?
        `, [id_paciente]);
        return res.affectedRows === 1;
    }

    static async activarPaciente(id_paciente) {
        const conn = await createConnection();
        const [res] = await conn.query(`
            UPDATE pacientes
            SET estado = 1
            WHERE id = ?
        `, [id_paciente]);
        return res.affectedRows === 1;
    }

    static async buscarPorNombreODni(query) {
    let conn;
    try {
        conn = await createConnection();
        const [rows] = await conn.query(`
            SELECT 
                pa.id AS id_paciente,
                p.nombre,
                p.apellido,
                p.dni
            FROM pacientes pa
            INNER JOIN personas p ON pa.id_persona = p.id
            WHERE pa.estado = 1
              AND (
                  p.nombre LIKE ? 
                  OR p.apellido LIKE ? 
                  OR p.dni LIKE ?
              )
            ORDER BY p.apellido, p.nombre
            LIMIT 20
        `, [`%${query}%`, `%${query}%`, `%${query}%`]);
        return rows;
    } catch (error) {
        console.error("Error buscarPorNombreODni:", error);
        throw error;
    } finally {
        if (conn) conn.end();
    }
}

// ======================================================
// GET OBRA SOCIAL POR PACIENTE
// ======================================================
static async getOSByPaciente(id_paciente) {
    let conn;
    try {
        conn = await createConnection();

        const [rows] = await conn.query(`
            SELECT 
                os.id,
                os.nombre
            FROM pacientes pa
            LEFT JOIN obras_sociales os ON pa.id_obra_social = os.id
            WHERE pa.id = ?
        `, [id_paciente]);

        return rows.length ? rows[0] : null;

    } catch (error) {
        console.error("Error getOSByPaciente:", error);
        throw error;
    } finally {
        if (conn) conn.end();
    }
}


// ======================================================
// GET TODAS LAS OBRAS SOCIALES
// ======================================================
static async getAllOS() {
    let conn;
    try {
        conn = await createConnection();

        const [rows] = await conn.query(`
            SELECT id, nombre
            FROM obras_sociales
            ORDER BY nombre
        `);

        return rows;

    } catch (error) {
        console.error("Error getAllOS:", error);
        throw error;
    } finally {
        if (conn) conn.end();
    }
}




}

module.exports = Paciente;
