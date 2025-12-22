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

            -- datos personales
            p.dni,
            p.nombre,
            p.apellido,
            p.nacimiento,

            -- usuario
            u.email,
            u.id_rol,

            -- estado del médico
            m.estado,

            -- especialidades y matrícula
            GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades,
            GROUP_CONCAT(DISTINCT m.matricula ORDER BY m.matricula SEPARATOR ', ') AS matriculas,

            -- teléfonos
            GROUP_CONCAT(DISTINCT t.numero ORDER BY t.numero SEPARATOR ', ') AS telefonos

        FROM medicos m
        INNER JOIN personas p ON m.id_persona = p.id
        INNER JOIN usuarios u ON u.id = m.id_usuario

        LEFT JOIN medico_especialidad me
            ON me.id_medico = m.id_medico
            AND me.estado = 1        

        LEFT JOIN especialidades e
            ON e.id = me.id_especialidad

        LEFT JOIN telefonos t
            ON t.id_persona = p.id

        GROUP BY 
            m.id_medico,
            p.dni,
            p.nombre,
            p.apellido,
            p.nacimiento,
            u.email,
            u.id_rol,
            m.estado;



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
                m.id_medico,
                m.estado,
                m.matricula,

                u.id AS id_usuario,
                u.email,

                p.id AS id_persona,
                p.dni,
                p.nombre,
                p.apellido,
                p.nacimiento,

                GROUP_CONCAT(DISTINCT t.numero ORDER BY t.numero SEPARATOR ', ') AS telefonos

            FROM medicos m
            INNER JOIN usuarios u ON m.id_usuario = u.id
            INNER JOIN personas p ON m.id_persona = p.id
            LEFT JOIN telefonos t ON t.id_persona = p.id
            WHERE m.id_medico = ?
            GROUP BY 
                m.id_medico, m.estado, m.matricula,
                u.id, u.email,
                p.id, p.dni, p.nombre, p.apellido, p.nacimiento
        `, [id_medico]);

            return rows[0];

        } finally {
            if (conn) conn.end();
        }
    }



    static async crear(data) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            // Extraer y validar datos
            const {
                dni,
                nombre,
                apellido,
                nacimiento,
                telefonoAlternativo,
                email,
                password,
                repeatPassword,
                id_rol,
                estado,
                matricula,
                especialidades = []
            } = data;

            // Validaciones
            if (!dni || !nombre || !apellido || !nacimiento || !telefonoAlternativo ||
                !email || !password || !repeatPassword || !id_rol || !estado || !matricula) {
                throw new Error("Todos los campos obligatorios deben ser completados");
            }

            if (password !== repeatPassword) {
                throw new Error("Las contraseñas no coinciden");
            }

            // Convertir especialidades a array si es necesario
            const especialidadesArray = Array.isArray(especialidades)
                ? especialidades
                : [especialidades].filter(Boolean);

            if (especialidadesArray.length === 0) {
                throw new Error("Debe seleccionar al menos una especialidad");
            }

            // Resto de tu código original...
            const [personaResult] = await conn.query(`
            INSERT INTO personas (dni, nombre, apellido, nacimiento, telefono, email)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [String(dni), nombre, apellido, nacimiento, String(telefonoAlternativo), email]);

            // ... resto del código

        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }


    // ============================================================
    // ACTUALIZAR MÉDICO
    // ============================================================
    static async actualizar({
        id_medico, estado, id_usuario, id_persona, matricula, especialidades = []
    }) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            // Actualizar médico
            await conn.query(`
                UPDATE medicos
                SET estado = ?, id_usuario = ?, id_persona = ?
                WHERE id_medico = ?
            `, [estado, id_usuario, id_persona, id_medico]);

            // Actualizar especialidades y matrícula
            await conn.query(`DELETE FROM medico_especialidad WHERE id_medico = ?`, [id_medico]);
            for (const id_especialidad of especialidades) {
                await conn.query(`
                    INSERT INTO medico_especialidad (id_medico, id_especialidad, matricula)
                    VALUES (?, ?, ?)
                `, [id_medico, id_especialidad, matricula]);
            }

            await conn.commit();
            return true;

        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================================
    // ELIMINAR MÉDICO
    // ============================================================
    static async eliminar(id_medico) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            //  Eliminar especialidades
            await conn.query(`DELETE FROM medico_especialidad WHERE id_medico = ?`, [id_medico]);

            //  Obtener IDs para eliminar usuario y persona
            const medico = await this.obtenerPorId(id_medico);
            if (!medico) throw new Error("Médico no encontrado");

            //  Eliminar médico
            await conn.query(`DELETE FROM medicos WHERE id_medico = ?`, [id_medico]);

            //  Eliminar usuario y persona
            await conn.query(`DELETE FROM usuarios WHERE id = ?`, [medico.id_usuario]);
            await conn.query(`DELETE FROM personas WHERE id = ?`, [medico.id_persona]);

            await conn.commit();
            return true;

        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    static async getAllMatriculas() {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
            SELECT 
                m.matricula,
                m.id_medico,
                p.nombre,
                p.apellido,
                e.nombre AS nombreMat
            FROM medicos m
            INNER JOIN personas p ON p.id = m.id_persona
            INNER JOIN medico_especialidad me ON me.id_medico = m.id_medico
            INNER JOIN especialidades e ON e.id = me.id_especialidad
            WHERE m.matricula IS NOT NULL
            ORDER BY p.apellido ASC;
        `);

            return rows;

        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }
    static async getProfesionalesParaAgendas() {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
            SELECT 
                m.matricula,
                p.nombre,
                p.apellido,
                GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS nombreMat
            FROM medicos m
            INNER JOIN personas p ON p.id = m.id_persona
            LEFT JOIN medico_especialidad me ON me.id_medico = m.id_medico
            LEFT JOIN especialidades e ON e.id = me.id_especialidad
            WHERE m.estado = '1'
            GROUP BY m.matricula, p.nombre, p.apellido
        `);

            return rows;

        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ============================================================
    // ACTIVAR / INACTIVAR MÉDICO
    // ============================================================
    static async actualizarEstado(id_medico, estado) {
        let conn;
        try {
            conn = await createConnection();

            await conn.query(`
            UPDATE medicos
            SET estado = ?
            WHERE id_medico = ?
        `, [estado, id_medico]);

            return true;

        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    static async updateMatricula(id_medico, matricula) {
        const conn = await createConnection();
        await conn.query(
            `UPDATE medicos SET matricula = ? WHERE id_medico = ?`,
            [matricula, id_medico]
        );
        conn.end();
    }

//     static async function buscarPorNombre(texto) {
//     const [rows] = await db.query(`
//         SELECT m.id_medico, p.nombre, p.apellido
//         FROM medicos m
//         JOIN personas p ON p.id = m.id_persona
//         WHERE p.nombre LIKE ? OR p.apellido LIKE ?
//         AND m.estado = 1
//         LIMIT 10
//     `, [`%${texto}%`, `%${texto}%`]);

//     return rows;
// }

    // ============================================================
// BUSCAR MÉDICOS POR NOMBRE / APELLIDO (PARA AGENDA)
// ============================================================
static async buscarPorNombre(texto) {
    let conn;
    try {
        conn = await createConnection();

        const [rows] = await conn.query(`
            SELECT
                m.id_medico,
                p.nombre,
                p.apellido
            FROM medicos m
            INNER JOIN personas p ON p.id = m.id_persona
            WHERE m.estado = 1
              AND (p.nombre LIKE ? OR p.apellido LIKE ?)
            ORDER BY p.apellido, p.nombre
            LIMIT 20
        `, [`%${texto}%`, `%${texto}%`]);

        return rows;

    } catch (error) {
        throw error;
    } finally {
        if (conn) conn.end();
    }
}





}

module.exports = Medico;
