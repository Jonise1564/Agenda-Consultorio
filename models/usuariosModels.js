// const createConnection = require('../config/configDb')
// const Persona = require('./personasModels') //clase padre

// class Usuario extends Persona {
//     constructor(id, dni, nombre, apellido, nacimiento, email, password, id_rol) {
//         super(dni, nombre, apellido, nacimiento)
//         this.id = id
//         this.email = email
//         this.password = password
//         this.id_rol = id_rol
//     }

//     static async get() {
//         console.log('Model: Get All usuarios');
//         try {
//             const conn = await createConnection();
//             const [usuarios] = await conn.query(`
//                 SELECT *
//                 FROM usuarios`);
//             return usuarios
//         } catch (error) {
//             throw new Error('Error al traer usuarios desde el modelo', error);
//         }
//     }

//     static async create({ dni, email, password, id_rol }) {
//         console.log('Model: Create usuario');
//         let conn;
//         try {
//             conn = await createConnection();
//             const [result] = await conn.query(`
//                     INSERT INTO usuarios (dni, email, password, id_rol)
//                     VALUES (?, ?, ?, ?)
//                 `, [dni, email, password, id_rol]);

//             if (result.affectedRows === 0) {
//                 throw new Error('Error al insertar en la tabla usuarios');
//             }

//             return { id: result.insertId, dni, email, password, id_rol };
//         } catch (error) {
//             console.error('Error creating usuario:', error);
//             throw new Error('Error al crear usuario');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     static async getByDni(dni) {
//         console.log(`Model Usuario: getByDni DNI: ${dni}`);

//         let conn;
//         try {
//             conn = await createConnection();
//             console.log("Conexión establecida");

//             // 1️⃣ Buscar persona por DNI
//             const [personaRows] = await conn.query(`
//             SELECT id, nombre, apellido, nacimiento 
//             FROM personas 
//             WHERE dni = ?;
//         `, [dni]);

//             if (personaRows.length === 0) {
//                 console.log("Model USUARIO: No existe persona con ese DNI");
//                 return { usuario: null, telefonos: null };
//             }

//             const persona = personaRows[0];

//             // 2️⃣ Buscar usuario usando id_persona
//             const [usuarioRows] = await conn.query(`
//             SELECT *
//             FROM usuarios
//             WHERE id_persona = ?;
//         `, [persona.id]);

//             if (usuarioRows.length === 0) {
//                 console.log("Model USUARIO: No existe usuario para esa persona");
//                 return { usuario: null, telefonos: null };
//             }

//             const usuario = usuarioRows[0];

//             // 3️⃣ Traer teléfonos
//             const [telefonos] = await conn.query(`
//             SELECT GROUP_CONCAT(numero SEPARATOR ', ') AS numeros
//             FROM telefonos
//             WHERE id_usuario = ?;
//         `, [usuario.id]);

//             return {
//                 usuario,
//                 telefonos: telefonos[0],
//                 persona
//             };

//         } catch (error) {
//             console.error("Error en getByDni:", error);
//             throw error;
//         } finally {
//             if (conn) conn.end();
//         }
//     }


//     //REVISAR NO FUNCIONA
//     static async addTelefonoAlternativo(id, telefono) {
//         try {
//             const conn = await createConnection();
//             console.log('Conexión a la base de datos establecida');
//             await conn.query('INSERT INTO telefonos (id_usuario, numero) VALUES (?, ?)', [id, telefono]);
//             console.log('Teléfono alternativo guardado en la base de datos');
//         } catch (error) {
//             console.error('Error al guardar el teléfono alternativo:', error);
//             throw error;
//         }
//     }


//     static async updateUsuario(id_usuario, updates) {
//         console.log('Model Usuario: update usuario');

//         try {
//             if (!updates || Object.keys(updates).length === 0) {
//                 return false;
//             }

//             const conn = await createConnection();

//             const fields = [];
//             const values = [];

//             for (const [key, value] of Object.entries(updates)) {
//                 fields.push(`${key} = ?`);
//                 values.push(value);
//             }

//             values.push(id_usuario);

//             const query = `
//             UPDATE usuarios
//             SET ${fields.join(', ')}
//             WHERE id = ?;
//         `;

//             const [result] = await conn.query(query, values);

//             console.log('Filas afectadas:', result.affectedRows);

//             return result.affectedRows === 1;

//         } catch (error) {
//             console.error('Error al modificar usuario:', error);
//             throw error;
//         }
//     }




// }

// module.exports = Usuario

const createConnection = require('../config/configDb');
const Persona = require('./personasModels');

class Usuario extends Persona {
    constructor(id, id_persona, email, password, id_rol) {
        // Nota: eliminamos dni de aquí porque Usuario se vincula por id_persona
        super(); 
        this.id = id;
        this.id_persona = id_persona;
        this.email = email;
        this.password = password;
        this.id_rol = id_rol;
    }

    static async get() {
        console.log('Model: Get All usuarios');
        try {
            const conn = await createConnection();
            const [usuarios] = await conn.query('SELECT * FROM usuarios');
            return usuarios;
        } catch (error) {
            throw new Error('Error al traer usuarios desde el modelo', error);
        }
    }

    // Cambiamos 'dni' por 'id_persona' que es lo que realmente necesita la tabla
    static async create({ id_persona, email, password, id_rol }) {
        console.log('Model: Create usuario para Persona ID:', id_persona);
        let conn;
        try {
            conn = await createConnection();
            
            // La tabla usuarios NO TIENE columna DNI, tiene ID_PERSONA
            const [result] = await conn.query(`
                    INSERT INTO usuarios (id_persona, email, password, id_rol)
                    VALUES (?, ?, ?, ?)
                `, [id_persona, email, password, id_rol]);

            if (result.affectedRows === 0) {
                throw new Error('Error al insertar en la tabla usuarios');
            }

            return { id: result.insertId, id_persona, email, id_rol };
        } catch (error) {
            console.error('Error creating usuario:', error);
            throw new Error('Error al crear usuario');
        } finally {
            if (conn) conn.end();
        }
    }

    static async getByDni(dni) {
        console.log(`Model Usuario: getByDni DNI: ${dni}`);
        let conn;
        try {
            conn = await createConnection();
            // 1. Buscar persona por DNI
            const [personaRows] = await conn.query(`
                SELECT id, nombre, apellido, nacimiento 
                FROM personas 
                WHERE dni = ?;
            `, [dni]);

            if (personaRows.length === 0) return { usuario: null, telefonos: null };
            const persona = personaRows[0];

            // 2. Buscar usuario usando id_persona
            const [usuarioRows] = await conn.query(`
                SELECT * FROM usuarios WHERE id_persona = ?;
            `, [persona.id]);

            if (usuarioRows.length === 0) return { usuario: null, persona };

            const usuario = usuarioRows[0];

            // 3. Traer teléfonos vinculados a la PERSONA (no al usuario)
            const [telefonos] = await conn.query(`
                SELECT GROUP_CONCAT(numero SEPARATOR ', ') AS numeros
                FROM telefonos
                WHERE id_persona = ?;
            `, [persona.id]);

            return { usuario, telefonos: telefonos[0], persona };
        } catch (error) {
            console.error("Error en getByDni:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    static async updateUsuario(id_usuario, updates) {
        try {
            if (!updates || Object.keys(updates).length === 0) return false;
            const conn = await createConnection();
            const fields = [];
            const values = [];

            for (const [key, value] of Object.entries(updates)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
            values.push(id_usuario);

            const [result] = await conn.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, values);
            return result.affectedRows === 1;
        } catch (error) {
            console.error('Error al modificar usuario:', error);
            throw error;
        }
    }
}

module.exports = Usuario;