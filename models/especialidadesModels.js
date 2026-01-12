
const createConnection = require('../config/configDb');

class Especialidad {

    // ======================================================
    // OBTENER TODAS LAS ESPECIALIDADES
    // ======================================================
    static async getAll() {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
            SELECT id, nombre, estado 
            FROM especialidades
            ORDER BY nombre ASC
        `); // Agregamos 'estado' y un orden alfabético para que se vea mejor
            return rows;
        } catch (error) {
            console.error("Error fetching especialidades:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }
    // ======================================================
    // CREAR NUEVA ESPECIALIDAD
    // ======================================================
    static async createNewEspecialidad(nombre) {
        let conn;
        try {
            conn = await createConnection();

            // Verifica si ya existe
            const [exists] = await conn.query(`
                SELECT id FROM especialidades WHERE nombre = ?
            `, [nombre]);

            if (exists.length > 0) {
                throw new Error("La especialidad ya existe");
            }

            // Inserta
            const [result] = await conn.query(`
                INSERT INTO especialidades (nombre, estado)
                VALUES (?, 1)
            `, [nombre]);

            return result.insertId;

        } catch (error) {
            console.error('Error creating especialidad:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // ACTIVAR / INACTIVAR ESPECIALIDAD
    // ======================================================
    static async inactivate(id) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`
                UPDATE especialidades SET estado = 0 WHERE id = ?
            `, [id]);
            return result;
        } finally {
            if (conn) conn.end();
        }
    }

    static async activate(id) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`
                UPDATE especialidades SET estado = 1 WHERE id = ?
            `, [id]);
            return result;
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // OBTENER ESPECIALIDAD POR ID
    // ======================================================
    static async getEspecialidadById(id) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT id, nombre, estado 
                FROM especialidades 
                WHERE id = ?
            `, [id]);
            return rows[0];
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // ACTUALIZAR ESPECIALIDAD
    // ======================================================
    static async updateEspecialidad(id, nombre) {
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`
                UPDATE especialidades SET nombre = ? WHERE id = ?
            `, [nombre, id]);
            return result;
        } finally {
            if (conn) conn.end();
        }
    }

    // ======================================================
    // OBTENER LAS ESPECIALIDADES DE UN MÉDICO
    // ======================================================
    static async getPorMedico(id_medico) {
        const conn = await createConnection();

        const [rows] = await conn.query(`
        SELECT 
        e.id AS id_especialidad,
        e.nombre
        FROM medico_especialidad me
        INNER JOIN especialidades e ON e.id = me.id_especialidad
        WHERE me.id_medico = ?
        AND me.estado = 1
    `, [id_medico]);

        return rows;
    }

    // ======================================================
    // ASIGNAR ESPECIALIDAD A MÉDICO (con matrícula)
    // ======================================================
    // static async asignarAMedico(id_medico, id_especialidad, matricula = null) {
    //     let conn;
    //     try {
    //         conn = await createConnection();

    //         // Inserta relación
    //         const [result] = await conn.query(`
    //             INSERT INTO medico_especialidad (id_medico, id_especialidad, matricula)
    //             VALUES (?, ?, ?)
    //         `, [id_medico, id_especialidad, matricula]);

    //         return result;

    //     } finally {
    //         if (conn) conn.end();
    //     }
    // }
    // static async asignarAMedico(id_medico, id_especialidad) {
    //     let conn;
    //     try {
    //         conn = await createConnection();

    //         await conn.query(`
    //             INSERT INTO medico_especialidad (id_medico, id_especialidad, estado)
    //             VALUES (?, ?, 1)
    //         `, [id_medico, id_especialidad]);

    //     } finally {
    //         if (conn) conn.end();
    //     }
    // }

    //     static async desactivarTodasPorMedico(id_medico) {
    //     const conn = await createConnection();
    //     await conn.query(
    //         `UPDATE medico_especialidad SET estado = 0 WHERE id_medico = ?`,
    //         [id_medico]
    //     );
    //     conn.end();
    // }

    // static async desactivarTodasPorMedico(id_medico) {
    //   const conn = await createConnection();
    //   await conn.query(`
    //     UPDATE medico_especialidad
    //     SET estado = 0
    //     WHERE id_medico = ?
    //   `, [id_medico]);
    // }


    // // static async asignarAMedico(id_medico, id_especialidad) {
    // //     const conn = await createConnection();
    // //     await conn.query(`
    // //         INSERT INTO medico_especialidad (id_medico, id_especialidad, estado)
    // //         VALUES (?, ?, 1)
    // //         ON DUPLICATE KEY UPDATE estado = 1
    // //     `, [id_medico, id_especialidad]);
    // //     conn.end();
    // // }
    // // static async asignarAMedico(id_medico, id_especialidad) {
    // //   const conn = await createConnection();
    // //   await conn.query(`
    // //     INSERT INTO medico_especialidad (id_medico, id_especialidad, estado)
    // //     VALUES (?, ?, 1)
    // //     ON DUPLICATE KEY UPDATE estado = 1
    // //   `, [id_medico, id_especialidad]);
    // // }

    // static async asignarAMedico(id_medico, id_especialidad) {
    //   const conn = await createConnection();

    //   const [rows] = await conn.query(`
    //     SELECT 1
    //     FROM medico_especialidad
    //     WHERE id_medico = ? AND id_especialidad = ?
    //   `, [id_medico, id_especialidad]);

    //   if (rows.length > 0) {
    //     await conn.query(`
    //       UPDATE medico_especialidad
    //       SET estado = 1
    //       WHERE id_medico = ? AND id_especialidad = ?
    //     `, [id_medico, id_especialidad]);
    //   } else {
    //     await conn.query(`
    //       INSERT INTO medico_especialidad (id_medico, id_especialidad, estado)
    //       VALUES (?, ?, 1)
    //     `, [id_medico, id_especialidad]);
    //   }
    // }


    static async desactivarTodasPorMedico(id_medico) {
        const conn = await createConnection();
        try {
            await conn.query(`
      UPDATE medico_especialidad
      SET estado = 0
      WHERE id_medico = ?
    `, [id_medico]);
        } finally {
            conn.end();
        }
    }

    static async asignarAMedico(id_medico, id_especialidad) {
        const conn = await createConnection();
        try {
            const [rows] = await conn.query(`
      SELECT 1
      FROM medico_especialidad
      WHERE id_medico = ? AND id_especialidad = ?
    `, [id_medico, id_especialidad]);

            if (rows.length > 0) {
                await conn.query(`
        UPDATE medico_especialidad
        SET estado = 1
        WHERE id_medico = ? AND id_especialidad = ?
      `, [id_medico, id_especialidad]);
            } else {
                await conn.query(`
        INSERT INTO medico_especialidad (id_medico, id_especialidad, estado)
        VALUES (?, ?, 1)
      `, [id_medico, id_especialidad]);
            }
        } finally {
            conn.end();
        }
    }


    // ============================================================
    // ESPECIALIDADES ACTIVAS DE UN MÉDICO
    // ============================================================
    static async getActivasPorMedico(id_medico) {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
                SELECT
                    e.id,
                    e.nombre
                FROM medico_especialidad me
                INNER JOIN especialidades e
                    ON e.id = me.id_especialidad
                INNER JOIN medicos m
                    ON m.id_medico = me.id_medico
                WHERE me.id_medico = ?
                  AND me.estado = 1
                  AND m.estado = 1
                ORDER BY e.nombre
            `, [id_medico]);

            return rows;

        } catch (error) {
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }




}

module.exports = Especialidad;
