// const createConnection = require('../config/configDb');
// //const Usuario = require('./usuariosModels'); // clase padre

// class Turno {
//     constructor(id, fecha, hora_inicio, motivo,	estado,	orden, id_paciente, id_agenda) {
//         this.id,
//         this.fecha,
//         this.hora_inicio,
//         this.motivo,
//         this.estado,
//         this.orden,
//         this.id_paciente,
//         this.id_agenda  
//     }
//     //Mostrar todos
//     // static async getAll(id) {
//     //     console.log('Model: Get All turnos');
//     //     let conn;
//     //     try {
//     //         conn = await createConnection();
//     //         const [turnos] = await conn.query(`
//     //            SELECT * FROM turnos WHERE id_agenda = ?;
//     //         `, [id]);
//     //         console.log('modelo ',turnos)
//     //         return turnos
//     //     } catch (error) {
//     //         console.error('Error fetching turnos:', error);
//     //         throw new Error('Error al traer turnos desde el modelo');
//     //     } finally {
//     //         if (conn) conn.end();
//     //     }
//     // }
//     static async getAll(id) {
//         let conn;
//         try {
//             conn = await createConnection();

//             const [turnos] = await conn.query(`
//                 SELECT *
//                 FROM turnos 
//                 WHERE id_agenda = ?
//                 ORDER BY fecha, hora_inicio;
//             `, [id]);

//             return turnos;
            
//         } catch (error) {
//             console.error('Error fetching turnos:', error);
//             throw new Error('Error al traer turnos desde el modelo');
//         } finally {
//             if (conn) conn.end();
//         }
//     }
//     //Crear nuevo turno
//     static async create(data) {
//     let conn;
//     try {
//         conn = await createConnection();

//         const { fecha, hora_inicio, motivo, id_paciente, id_agenda } = data;

//         const sql = `
//             INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
//             VALUES (?, ?, ?, 'pendiente', 1, ?, ?);
//         `;

//         await conn.query(sql, [
//             fecha,
//             hora_inicio,
//             motivo,
//             id_paciente,
//             id_agenda
//         ]);

//     } catch (error) {
//         console.error("Error creando turno:", error);
//         throw new Error("Error al crear turno");
//     } finally {
//         if (conn) conn.end();
//     }
// }


// }
// module.exports = Turno;


// const createConnection = require('../config/configDb');

// class Turno {
//     constructor(id, fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda) {
//         this.id = id;
//         this.fecha = fecha;
//         this.hora_inicio = hora_inicio;
//         this.motivo = motivo;
//         this.estado = estado;
//         this.orden = orden;
//         this.id_paciente = id_paciente;
//         this.id_agenda = id_agenda;
//     }

//     // Mostrar todos
//     static async getAll(id) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [turnos] = await conn.query(`
//                 SELECT *
//                 FROM turnos 
//                 WHERE id_agenda = ?
//                 ORDER BY fecha, hora_inicio;
//             `, [id]);

//             return turnos;
//         } catch (error) {
//             console.error('Error fetching turnos:', error);
//             throw new Error('Error al traer turnos desde el modelo');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     // Crear nuevo turno
//     static async create(data) {
//         let conn;
//         try {
//             conn = await createConnection();

//             const { fecha, hora_inicio, motivo, id_paciente, id_agenda } = data;

//             const sql = `
//                 INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
//                 VALUES (?, ?, ?, 'pendiente', 1, ?, ?);
//             `;

//             await conn.query(sql, [
//                 fecha,
//                 hora_inicio,
//                 motivo,
//                 id_paciente,
//                 id_agenda
//             ]);

//         } catch (error) {
//             console.error("Error creando turno:", error);
//             throw new Error("Error al crear turno");
//         } finally {
//             if (conn) conn.end();
//         }
//     }
// }

// module.exports = Turno;

// const createConnection = require('../config/configDb');

// class Turno {
//     constructor(id, fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda) {
//         this.id = id;
//         this.fecha = fecha;
//         this.hora_inicio = hora_inicio;
//         this.motivo = motivo;
//         this.estado = estado;
//         this.orden = orden;
//         this.id_paciente = id_paciente;
//         this.id_agenda = id_agenda;
//     }

//     // Obtener turnos por agenda
//     static async getAll(id_agenda) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [turnos] = await conn.query(`
//                 SELECT *
//                 FROM turnos 
//                 WHERE id_agenda = ?
//                 ORDER BY fecha, hora_inicio;
//             `, [id_agenda]);

//             return turnos;
//         } catch (error) {
//             console.error('Error fetching turnos:', error);
//             throw new Error('Error al traer turnos desde el modelo');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     // Obtener un turno por ID
//     static async getById(id) {
//         let conn;
//         try {
//             conn = await createConnection();

//             const [rows] = await conn.query(`
//                 SELECT *
//                 FROM turnos
//                 WHERE id = ?;
//             `, [id]);

//             return rows[0];
//         } catch (error) {
//             console.error('Error getById:', error);
//             throw new Error('Error al obtener turno por ID');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     // Crear nuevo turno
//     static async create(data) {
//         let conn;
//         try {
//             conn = await createConnection();

//             const { fecha, hora_inicio, motivo, id_paciente, id_agenda } = data;

//             const sql = `
//                 INSERT INTO turnos (fecha, hora_inicio, motivo, estado, orden, id_paciente, id_agenda)
//                 VALUES (?, ?, ?, 'pendiente', 1, ?, ?);
//             `;

//             await conn.query(sql, [
//                 fecha,
//                 hora_inicio,
//                 motivo,
//                 id_paciente,
//                 id_agenda
//             ]);

//         } catch (error) {
//             console.error("Error creando turno:", error);
//             throw new Error("Error al crear turno");
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     // Actualizar turno
//     static async update(id, data) {
//         let conn;
//         try {
//             conn = await createConnection();

//             const { fecha, hora_inicio, motivo, estado, id_paciente } = data;

//             await conn.query(`
//                 UPDATE turnos
//                 SET fecha = ?, hora_inicio = ?, motivo = ?, estado = ?, id_paciente = ?
//                 WHERE id = ?;
//             `, [fecha, hora_inicio, motivo, estado, id_paciente, id]);

//         } catch (error) {
//             console.error("Error actualizando turno:", error);
//             throw new Error("Error al actualizar turno");
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     // Eliminar turno
//     static async delete(id) {
//         let conn;
//         try {
//             conn = await createConnection();

//             await conn.query(`
//                 DELETE FROM turnos WHERE id = ?;
//             `, [id]);

//         } catch (error) {
//             console.error("Error eliminando turno:", error);
//             throw new Error("Error al eliminar turno");
//         } finally {
//             if (conn) conn.end();
//         }
//     }
// }

// module.exports = Turno;
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

    // Obtener turnos por agenda
    static async getAll(id_agenda) {
        let conn;
        try {
            conn = await createConnection();
            const [turnos] = await conn.query(`
                SELECT *
                FROM turnos 
                WHERE id_agenda = ?
                ORDER BY fecha, hora_inicio;
            `, [id_agenda]);

            return turnos;
        } catch (error) {
            console.error('Error fetching turnos:', error);
            throw new Error('Error al traer turnos desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // Obtener un turno por ID
    static async getById(id) {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
                SELECT *
                FROM turnos
                WHERE id = ?;
            `, [id]);

            return rows[0];
        } catch (error) {
            console.error('Error getById:', error);
            throw new Error('Error al obtener turno por ID');
        } finally {
            if (conn) conn.end();
        }
    }

    // Crear nuevo turno
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

    // Cambiar estado (RESERVAR / CANCELAR / CONFIRMAR)
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

            await conn.query(`
                DELETE FROM turnos WHERE id = ?;
            `, [id]);

        } catch (error) {
            console.error("Error eliminando turno:", error);
            throw new Error("Error al eliminar turno");
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = Turno;

