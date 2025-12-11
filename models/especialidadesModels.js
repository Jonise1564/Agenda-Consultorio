// const createConnection = require('../config/configDb');

// class Especialidad {
//     //Mostrar todos
//     static async getAll() {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [especialidades] = await conn.query('SELECT id, nombre, estado FROM especialidades');
//             return especialidades;
//         } catch (error) {
//             console.error('Error fetching especialidades:', error);
//             throw new Error('Error al traer especialidades desde el modelo');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     static async create({ id_usuario, estado, especialidades, telefonos, matricula }) {
//         console.log('Model: Create medico');
//         let conn;
//         try {
//             conn = await createConnection();
//             await conn.beginTransaction();

//             // Insertar en la tabla medicos
//             const [resultMedicos] = await conn.query(`
//                 INSERT INTO medicos (id_usuario, estado)
//                 VALUES (?, ?)
//             `, [id_usuario, estado]);

//             if (resultMedicos.affectedRows === 0) {
//                 throw new Error('Error al insertar en la tabla medicos');
//             }

//             // Verificar si la matrícula ya existe en la tabla medico_especialidad
//             const [resultMatriculas] = await conn.query(`
//                 SELECT matricula FROM medico_especialidad WHERE matricula = ?;
//             `, [matricula]);

//             if (resultMatriculas.length > 0) {
//                 console.error('Model: Matricula duplicada para medico', matricula);
//                 throw new Error('Matrícula duplicada');
//             }

//             // Insertar en la tabla medico_especialidades
//             const [resultEspecialidades] = await conn.query(`
//                 INSERT INTO medico_especialidad (id_medico, id_especialidad, matricula)
//                 VALUES (?, ?, ?)
//             `, [id_usuario, especialidades, matricula]);

//             if (resultEspecialidades.affectedRows === 0) {
//                 throw new Error('Error al insertar en la tabla medico_especialidad');
//             }

//             // Insertar en la tabla telefonos
//             const [resultTelefonos] = await conn.query(`
//                 INSERT INTO telefonos (id_usuario, numero)
//                 VALUES (?, ?)
//             `, [id_usuario, telefonos]);

//             if (resultTelefonos.affectedRows === 0) {
//                 throw new Error('Error al insertar en la tabla telefonos');
//             }

//             await conn.commit();
//             return id_usuario;
//         } catch (error) {
//             if (conn) await conn.rollback();
//             console.error('Error creating medico:', error);
//             throw new Error('Error al crear medico');
//         } finally {
//             if (conn) conn.end();
//         }
//     }
//     static async createNewEspecialidad(especialidad) {
//         let conn;
//         try {
//             conn = await createConnection();

//             //Verificar si la especialidad existe 
//             const [existingEspecialidad] = await conn.query(`
//                 SELECT id FROM especialidades WHERE nombre = ?
//             `, [especialidad]);

//             if (existingEspecialidad.length > 0) {
//                 throw new Error('La especialidad ya existe');
//             }

//              //Si no exite, inserta una nueva especialidad
//             const [result] = await conn.query(`
//                 INSERT INTO especialidades (nombre)
//                 VALUES (?)
//             `, [especialidad]);

//             return result;
//         } catch (error) {
//             console.error('Error creating especialidad:', error);
//             throw new Error(error.message || 'Error al crear especialidad');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

   
//     static async inactivate(id) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [result] = await conn.query('UPDATE especialidades SET estado = 0 WHERE id = ?', [id]);
//             return result;
//         } catch (error) {
//             console.error('Error inactivating especialidad:', error);
//             throw new Error('Error al inactivar especialidad');
//         } finally {
//             if (conn) conn.end();
//         }
//     }
//     static async activate(id) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [result] = await conn.query('UPDATE especialidades SET estado = 1 WHERE id = ?', [id]);
//             return result;
//         } catch (error) {
//             console.error('Error activating especialidad:', error);
//             throw new Error('Error al activar especialidad');
//         } finally {
//             if (conn) conn.end();
//         }
//     }
//     static async getEspecialidadById(id) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [especialidad] = await conn.query('SELECT id, nombre, estado FROM especialidades WHERE id = ?', [id]);
//             return especialidad;
//         } catch (error) {
//             console.error('Error fetching especialidad:', error);
//             throw new Error('Error al traer especialidad desde el modelo');
//         } finally {
//             if (conn) conn.end();
//         }
//     }
//     static async updateEspecialidad(id, especialidad) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [result] = await conn.query('UPDATE especialidades SET nombre = ? WHERE id = ?', [especialidad, id]);
//             return result;
//         } catch (error) {
//             console.error('Error updating especialidad:', error);
//             throw new Error('Error al actualizar especialidad');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     static async getEspecialidadesById(id) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [rows] = await conn.query(`
//             SELECT me.matricula, e.nombre AS especialidades 
//             FROM medico_especialidad me 
//             LEFT JOIN especialidades e ON me.id_especialidad = e.id 
//             WHERE me.id_medico = ?
//           `, [id]);
//             console.log(rows)
//             return rows;
//         } catch (error) {
//             console.error('Error fetching especialidades:', error);
//             throw new Error('Error al traer especialidades desde el modelo');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

// }

// module.exports = Especialidad;
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
            `);
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
    // static async getPorMedico(id_medico) {
    //     let conn;
    //     try {
    //         conn = await createConnection();
    //         const [rows] = await conn.query(`
    //             SELECT 
    //                 me.id,
    //                 me.matricula,
    //                 e.nombre AS especialidad,
    //                 e.id AS id_especialidad
    //             FROM medico_especialidad me
    //             INNER JOIN especialidades e 
    //                 ON me.id_especialidad = e.id
    //             WHERE me.id_medico = ?
    //         `, [id_medico]);
    //         return rows;
    //     } finally {
    //         if (conn) conn.end();
    //     }
    // }
    static async getPorMedico(id_medico) {
    const conn = await createConnection();

    const [rows] = await conn.query(`
        SELECT me.id_medico, me.id_especialidad, e.nombre
        FROM medico_especialidad me
        JOIN especialidades e ON me.id_especialidad = e.id
        WHERE me.id_medico = ?
    `, [id_medico]);

    return rows;
}


    // ======================================================
    // ASIGNAR ESPECIALIDAD A MÉDICO (con matrícula)
    // ======================================================
    static async asignarAMedico(id_medico, id_especialidad, matricula = null) {
        let conn;
        try {
            conn = await createConnection();

            // Inserta relación
            const [result] = await conn.query(`
                INSERT INTO medico_especialidad (id_medico, id_especialidad, matricula)
                VALUES (?, ?, ?)
            `, [id_medico, id_especialidad, matricula]);

            return result;

        } finally {
            if (conn) conn.end();
        }
    }

}

module.exports = Especialidad;
