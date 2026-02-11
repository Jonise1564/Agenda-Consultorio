const createConnection = require('../config/configDb');

class Paciente {

    // ======================================================
    // BUSCADOR (NECESARIO PARA RESERVA DE TURNOS)
    // ======================================================
    static async buscar(texto) {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
            SELECT 
                pa.id AS id_paciente, 
                pe.nombre, 
                pe.apellido, 
                pe.dni,
                pa.estado  -- Agregamos el estado para tenerlo disponible
            FROM pacientes pa
            INNER JOIN personas pe ON pa.id_persona = pe.id
            WHERE (pe.nombre LIKE ? 
                OR pe.apellido LIKE ? 
                OR pe.dni LIKE ?)
                AND pa.estado = 1  -- FILTRO CRÍTICO: Solo pacientes activos
            LIMIT 10
        `;
            const filtro = `%${texto}%`;
            // Nota: se pasan 3 parámetros porque hay 3 signos de interrogación en el WHERE
            const [rows] = await conn.query(sql, [filtro, filtro, filtro]);
            return rows;
        } catch (error) {
            console.error("Error en Paciente.buscar:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // GET ALL PACIENTES PAGINADOS Y FILTRADOS
    // ======================================================
    static async getAllPaginated(limit, offset, search = '') {
        let conn;
        try {
            conn = await createConnection();
            const term = `%${search}%`;
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
                    COALESCE(os.nombre, 'Sin obra social') AS obra_social,
                    COALESCE(
                        GROUP_CONCAT(DISTINCT t.numero ORDER BY t.numero SEPARATOR ', '),
                        ''
                    ) AS telefonos
                FROM pacientes pa
                INNER JOIN usuarios u ON pa.id_usuario = u.id
                INNER JOIN personas p ON pa.id_persona = p.id
                LEFT JOIN obras_sociales os ON pa.id_obra_social = os.id                
                LEFT JOIN telefonos t ON p.id = t.id_persona
                WHERE p.dni LIKE ? 
                   OR p.nombre LIKE ? 
                   OR p.apellido LIKE ? 
                   OR u.email LIKE ? 
                   OR os.nombre LIKE ?
                GROUP BY pa.id
                ORDER BY pa.id DESC
                LIMIT ? OFFSET ?;
            `, [term, term, term, term, term, limit, offset]);
            return pacientes;
        } catch (error) {
            console.error('Error fetching paginated pacientes:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // CONTAR TOTAL DE PACIENTES (PARA PAGINACIÓN CON FILTRO)
    // ======================================================
    static async countAll(search = '') {
        let conn;
        try {
            conn = await createConnection();
            const term = `%${search}%`;
            const [rows] = await conn.query(`
                SELECT COUNT(DISTINCT pa.id) as total 
                FROM pacientes pa
                INNER JOIN personas p ON pa.id_persona = p.id
                INNER JOIN usuarios u ON pa.id_usuario = u.id
                LEFT JOIN obras_sociales os ON pa.id_obra_social = os.id
                WHERE p.dni LIKE ? 
                   OR p.nombre LIKE ? 
                   OR p.apellido LIKE ? 
                   OR u.email LIKE ? 
                   OR os.nombre LIKE ?
            `, [term, term, term, term, term]);
            return rows[0].total;
        } catch (error) {
            console.error('Error counting pacientes:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    static async create({ id_persona, id_usuario, id_obra_social, estado }) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`
                INSERT INTO pacientes (id_usuario, id_persona, id_obra_social, estado)
                VALUES (?, ?, ?, ?)
            `, [id_usuario, id_persona, id_obra_social || null, estado !== undefined ? estado : 1]);
            return { id: result.insertId };
        } finally { if (conn) conn.end(); }
    }

    static async getPacienteById(id_paciente) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT pa.id AS id_paciente, pa.id_usuario, pa.id_obra_social, pa.estado,
                p.id AS id_persona, p.nombre, p.apellido, p.nacimiento, p.dni, u.email
                FROM pacientes pa
                INNER JOIN personas p ON pa.id_persona = p.id
                INNER JOIN usuarios u ON pa.id_usuario = u.id
                WHERE pa.id = ?;
            `, [id_paciente]);
            return rows.length ? rows[0] : null;
        } finally { if (conn) conn.end(); }
    }

    static async updatePaciente(id_paciente, updates) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();
            await conn.query(`UPDATE personas SET nombre = ?, apellido = ?, nacimiento = ?
                WHERE id = (SELECT id_persona FROM pacientes WHERE id = ?)`,
                [updates.nombre, updates.apellido, updates.nacimiento, id_paciente]);
            if (updates.email || updates.password) {
                const campos = []; const valores = [];
                if (updates.email) { campos.push('email = ?'); valores.push(updates.email); }
                if (updates.password) { campos.push('password = ?'); valores.push(updates.password); }
                await conn.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = (SELECT id_usuario FROM pacientes WHERE id = ?)`, [...valores, id_paciente]);
            }
            await conn.query(`UPDATE pacientes SET id_obra_social = ? WHERE id = ?`, [updates.id_obra_social, id_paciente]);
            await conn.commit();
            return true;
        } catch (error) { if (conn) await conn.rollback(); throw error; } finally { if (conn) conn.end(); }
    }

    static async inactivarPaciente(id_paciente) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('UPDATE pacientes SET estado = 0 WHERE id = ?', [id_paciente]);
        } finally { if (conn) conn.end(); }
    }

    static async activarPaciente(id_paciente) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('UPDATE pacientes SET estado = 1 WHERE id = ?', [id_paciente]);
        } finally { if (conn) conn.end(); }
    }

    static async getAllOS() {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query('SELECT id, nombre FROM obras_sociales ORDER BY nombre');
            return rows;
        } finally { if (conn) conn.end(); }
    }

    static async getOSByPaciente(id_paciente) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT os.id, os.nombre FROM pacientes pa
                LEFT JOIN obras_sociales os ON pa.id_obra_social = os.id
                WHERE pa.id = ?
            `, [id_paciente]);
            return rows.length ? rows[0] : null;
        } finally { if (conn) conn.end(); }
    }



    // Obtener datos completos del paciente incluyendo EMAIL para notificaciones
    static async getDatosCompletos(id_paciente) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
            SELECT 
                p.nombre, 
                p.apellido, 
                p.dni,
                u.email 
            FROM pacientes pac
            INNER JOIN personas p ON pac.id_persona = p.id
            INNER JOIN usuarios u ON pac.id_usuario = u.id -- <--- UNIMOS CON USUARIOS
            WHERE pac.id = ?`, [id_paciente]);

            return rows[0] || null;
        } catch (error) {
            console.error("Error al obtener datos del paciente:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }




    // ======================================================
    // OBTENER PERFIL POR ID DE USUARIO (PARA EL PANEL)
    // ======================================================
    static async getByUsuarioId(id_usuario) {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
                SELECT 
                    pa.id AS id_paciente,
                    pa.id_persona,
                    pa.id_usuario,
                    pa.id_obra_social,
                    pa.estado,
                    pe.nombre,
                    pe.apellido,
                    pe.dni,
                    pe.nacimiento,
                    u.email,
                    COALESCE(os.nombre, 'Sin obra social') AS obra_social_nombre
                FROM pacientes pa
                INNER JOIN personas pe ON pa.id_persona = pe.id
                INNER JOIN usuarios u ON pa.id_usuario = u.id
                LEFT JOIN obras_sociales os ON pa.id_obra_social = os.id
                WHERE pa.id_usuario = ?
            `;
            const [rows] = await conn.query(sql, [id_usuario]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error("Error en Paciente.getByUsuarioId:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // ACTUALIZAR PERFIL DESDE EL PANEL DEL PACIENTE
    // ======================================================
    static async actualizarPerfil(datos) {
        let conn;
        try {
            const { id_persona, nombre, apellido, email, nacimiento, id_paciente } = datos;
            conn = await createConnection();

            // Iniciamos una transacción porque afectamos dos tablas: personas y usuarios
            await conn.beginTransaction();

            // 1. Actualizar datos en la tabla personas
            await conn.query(`
                UPDATE personas 
                SET nombre = ?, apellido = ?, nacimiento = ?
                WHERE id = ?
            `, [nombre, apellido, nacimiento, id_persona]);

            // 2. Actualizar el email en la tabla usuarios (relacionada con el paciente)
            await conn.query(`
                UPDATE usuarios 
                SET email = ? 
                WHERE id = (SELECT id_usuario FROM pacientes WHERE id = ?)
            `, [email, id_paciente]);

            await conn.commit();
            return true;
        } catch (error) {
            if (conn) await conn.rollback();
            console.error("Error en Paciente.actualizarPerfil:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }


    static async getById(id_paciente) {
        let db;
        try {

            db = await createConnection();
            const sql = `
            SELECT 
                p.nombre, 
                p.apellido, 
                u.email 
            FROM pacientes pa
            JOIN personas p ON pa.id_persona = p.id
            JOIN usuarios u ON u.id_persona = p.id
            WHERE pa.id = ?
        `;

            const [rows] = await db.query(sql, [id_paciente]);
            return rows[0]; // Retorna { nombre, apellido, email }
        } catch (error) {
            console.error("Error en Paciente.getById:", error);
            throw error;
        }
    }


    // ======================================================
    // VERIFICAR SI EL PACIENTE YA TIENE UN TURNO EN LA FECHA
    // ======================================================
    static async verificarTurnoExistente(id_paciente, fecha) {
        let conn;
        try {
            conn = await createConnection();
            // Buscamos turnos que NO estén cancelados para ese paciente en esa fecha
            const sql = `
                SELECT t.id 
                FROM turnos t
                INNER JOIN agendas a ON t.id_agenda = a.id
                WHERE t.id_paciente = ? 
                AND a.fecha = ? 
                AND t.estado != 'cancelado'
                LIMIT 1
            `;
            const [rows] = await conn.query(sql, [id_paciente, fecha]);
            return rows.length > 0; // Retorna true si ya existe un turno
        } catch (error) {
            console.error("Error en verificarTurnoExistente:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }



}

module.exports = Paciente;