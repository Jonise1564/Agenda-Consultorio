const createConnection = require('../config/configDb');
const bcrypt = require('bcryptjs');

class Medico {

    // ============================================================
    // LISTAR MÉDICOS
    // ============================================================
    static async listar() {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`
                SELECT 
                    m.id_medico AS id,
                    p.dni, p.nombre, p.apellido, p.nacimiento,
                    u.email, u.id_rol, m.estado,
                    GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades,
                    m.matricula,
                    GROUP_CONCAT(DISTINCT t.numero ORDER BY t.numero SEPARATOR ', ') AS telefonos
                FROM medicos m
                INNER JOIN personas p ON m.id_persona = p.id
                INNER JOIN usuarios u ON u.id = m.id_usuario
                LEFT JOIN medico_especialidad me ON me.id_medico = m.id_medico AND me.estado = 1        
                LEFT JOIN especialidades e ON e.id = me.id_especialidad
                LEFT JOIN telefonos t ON t.id_persona = p.id
                GROUP BY m.id_medico, p.dni, p.nombre, p.apellido, p.nacimiento, u.email, u.id_rol, m.estado, m.matricula;
            `);
            return result;
        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================================
    // OBTENER POR ID
    // ============================================================
    static async obtenerPorId(id_medico) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT 
                    m.id_medico, m.estado, m.matricula,
                    u.id AS id_usuario, u.email,
                    p.id AS id_persona, p.dni, p.nombre, p.apellido, p.nacimiento,
                    GROUP_CONCAT(DISTINCT t.numero ORDER BY t.numero SEPARATOR ', ') AS telefonos
                FROM medicos m
                INNER JOIN usuarios u ON m.id_usuario = u.id
                INNER JOIN personas p ON m.id_persona = p.id
                LEFT JOIN telefonos t ON t.id_persona = p.id
                WHERE m.id_medico = ?
                GROUP BY m.id_medico, m.estado, m.matricula, u.id, u.email, p.id, p.dni, p.nombre, p.apellido, p.nacimiento
            `, [id_medico]);
            return rows[0];
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================================
    // CREAR MÉDICO (CORREGIDO PARA EL CONTROLLER)
    // ============================================================
    static async crear({ id_persona, id_usuario, matricula, estado }) {
        let conn;
        try {
            // Validación de seguridad para campos obligatorios en la tabla 'medicos'
            if (!id_persona || !id_usuario || !matricula) {
                throw new Error('Todos los campos obligatorios deben ser completados');
            }

            conn = await createConnection();
            const [result] = await conn.query(`
                INSERT INTO medicos (id_persona, id_usuario, matricula, estado)
                VALUES (?, ?, ?, ?)
            `, [id_persona, id_usuario, matricula, estado || 1]);

            return result.insertId;
        } catch (error) {
            console.error("Error en Medico.crear:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================================
    // ACTUALIZAR MATRÍCULA
    // ============================================================
    static async updateMatricula(id_medico, matricula) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query(
                `UPDATE medicos SET matricula = ? WHERE id_medico = ?`,
                [matricula, id_medico]
            );
            return true;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================================
    // ACTUALIZAR ESTADO (BAJA/ALTA)
    // ============================================================
    static async actualizarEstado(id_medico, estado) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query(`UPDATE medicos SET estado = ? WHERE id_medico = ?`, [estado, id_medico]);
            return true;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================================
    // BUSCADORES Y PAGINACIÓN
    // ============================================================
    static async buscarPorNombre(texto) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT m.id_medico, p.nombre, p.apellido
                FROM medicos m
                INNER JOIN personas p ON p.id = m.id_persona
                WHERE m.estado = 1 AND (p.nombre LIKE ? OR p.apellido LIKE ?)
                ORDER BY p.apellido, p.nombre
                LIMIT 20
            `, [`%${texto}%`, `%${texto}%`]);
            return rows;
        } finally {
            if (conn) conn.end();
        }
    }

    static async contarTodos(search = '') {
        let conn;
        try {
            conn = await createConnection();
            const s = `%${search}%`;
            const [rows] = await conn.query(`
                SELECT COUNT(DISTINCT m.id_medico) as total 
                FROM medicos m
                INNER JOIN personas p ON m.id_persona = p.id
                LEFT JOIN medico_especialidad me ON me.id_medico = m.id_medico
                LEFT JOIN especialidades e ON e.id = me.id_especialidad
                WHERE p.nombre LIKE ? OR p.apellido LIKE ? OR m.matricula LIKE ? OR e.nombre LIKE ?
            `, [s, s, s, s]);
            return rows[0].total;
        } finally {
            if (conn) conn.end();
        }
    }

    static async listarPaginado(limit, offset, search = '') {
        let conn;
        try {
            conn = await createConnection();
            const s = `%${search}%`;
            const [result] = await conn.query(`
                SELECT 
                    m.id_medico AS id,
                    p.dni, p.nombre, p.apellido, p.nacimiento,
                    u.email, m.estado, m.matricula,
                    GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades,
                    GROUP_CONCAT(DISTINCT t.numero ORDER BY t.numero SEPARATOR ', ') AS telefonos
                FROM medicos m
                INNER JOIN personas p ON m.id_persona = p.id
                INNER JOIN usuarios u ON u.id = m.id_usuario
                LEFT JOIN medico_especialidad me ON me.id_medico = m.id_medico AND me.estado = 1
                LEFT JOIN especialidades e ON e.id = me.id_especialidad
                LEFT JOIN telefonos t ON t.id_persona = p.id
                WHERE p.nombre LIKE ? OR p.apellido LIKE ? OR m.matricula LIKE ? OR e.nombre LIKE ?
                GROUP BY m.id_medico, p.dni, p.nombre, p.apellido, p.nacimiento, u.email, m.estado, m.matricula
                ORDER BY p.apellido ASC
                LIMIT ? OFFSET ?
            `, [s, s, s, s, limit, offset]);
            return result;
        } finally {
            if (conn) conn.end();
        }
    }

    static async getProfesionalesParaAgendas() {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT m.id_medico, m.matricula, p.nombre, p.apellido
                FROM medicos m
                INNER JOIN personas p ON p.id = m.id_persona
                WHERE m.estado = '1'
                ORDER BY p.apellido, p.nombre
            `);
            return rows;
        } finally {
            if (conn) conn.end();
        }
    }


    static async obtenerAusenciasActivas() {
        let conn;
        try {
            conn = await createConnection();
            // Buscamos si el día de hoy cae dentro del rango de alguna ausencia
            const sql = `
            SELECT DISTINCT id_medico 
            FROM ausencias 
            WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin
        `;
            const [rows] = await conn.query(sql);

            const idsAusentes = rows.map(r => r.id_medico);
            console.log("IDs de médicos ausentes hoy:", idsAusentes);

            return idsAusentes;
        } catch (error) {
            console.error("Error al obtener ausencias en el modelo:", error);
            return [];
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = Medico;
