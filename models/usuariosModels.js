const createConnection = require('../config/configDb')
const Persona = require('./personasModels') //clase padre

class Usuario extends Persona {
    constructor(id, dni, nombre, apellido, nacimiento, email, password, id_rol) {
        super(dni, nombre, apellido, nacimiento)
        this.id = id
        this.email = email
        this.password = password
        this.id_rol = id_rol
    }

    static async get() {
        console.log('Model: Get All usuarios');
        try {
            const conn = await createConnection();
            const [usuarios] = await conn.query(`
                SELECT *
                FROM usuarios`);
            return usuarios
        } catch (error) {
            throw new Error('Error al traer usuarios desde el modelo', error);
        }
    }

    static async create({ dni, email, password, id_rol }) {
        console.log('Model: Create usuario');
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query(`
                    INSERT INTO usuarios (dni, email, password, id_rol)
                    VALUES (?, ?, ?, ?)
                `, [dni, email, password, id_rol]);

            if (result.affectedRows === 0) {
                throw new Error('Error al insertar en la tabla usuarios');
            }

            return { id: result.insertId, dni, email, password, id_rol };
        } catch (error) {
            console.error('Error creating usuario:', error);
            throw new Error('Error al crear usuario');
        } finally {
            if (conn) conn.end();
        }
    }
    //mostrar por dni y los telefonos del usuario
    // static async getByDni(dni) {
    //     console.log(`Model: getByDni Usuario dni: ${dni}`);
    //     try {
    //         const conn = await createConnection();
    //         console.log('Conexión a la base de datos establecida');
    
    //         // Obtener el usuario por DNI
    //         const [usuario] = await conn.query('SELECT * FROM usuarios WHERE dni = ?', [dni]);
            
    //         if (!usuario || usuario.length === 0) {
    //             console.log('Model USUARIO: No se encontró ningún usuario');
    //             return { usuario: null, telefonos: null };
    //         }
    
    //         const { id } = usuario[0];
    
    //         // Obtener los teléfonos asociados al usuario
    //         const [telefonos] = await conn.query(`
    //             SELECT GROUP_CONCAT(DISTINCT t.numero SEPARATOR ', ') AS numeros
    //             FROM telefonos t
    //             WHERE t.id_usuario = ?;
    //         `, [id]);
    
    //         console.log('Model USUARIO: Resultado de la consulta:', usuario);
    //         console.log('Model: Resultado de la consulta:', telefonos);
    
    //         return { usuario: usuario[0], telefonos: telefonos[0] };
    //     } catch (error) {
    //         console.error('Error al obtener usuario por DNI:', error);
    //         throw error;
    //     }
    // }
    
    // static async getByDni(dni) {
    // console.log(`Model: getByDni Usuario dni: ${dni}`);

    //     let conn;
    //     try {
    //         conn = await createConnection();
    //         console.log('Conexión a la base de datos establecida');

    //         // 1) Buscar PERSONA para obtener id_persona
    //         const [personaRows] = await conn.query(
    //             `SELECT id FROM personas WHERE dni = ?`, 
    //             [dni]
    //         );

    //         if (personaRows.length === 0) {
    //             console.log('No existe persona con ese DNI');
    //             return { usuario: null, telefonos: null };
    //         }

    //         const id_persona = personaRows[0].id;

    //         // 2) Buscar USUARIO con id_persona
    //         const [usuarioRows] = await conn.query(
    //             `SELECT * FROM usuarios WHERE id_persona = ?`,
    //             [id_persona]
    //         );

    //         if (usuarioRows.length === 0) {
    //             console.log('No existe usuario asociado');
    //             return { usuario: null, telefonos: null };
    //         }

    //         const usuario = usuarioRows[0];

    //         // 3) Buscar teléfonos asociados
    //         const [telefonosRows] = await conn.query(
    //             `SELECT GROUP_CONCAT(numero SEPARATOR ', ') AS numeros
    //             FROM telefonos 
    //             WHERE id_usuario = ?`,
    //             [usuario.id]
    //         );

    //         return {
    //             usuario,
    //             telefonos: telefonosRows[0].numeros || ''
    //         };

    //     } catch (error) {
    //         console.error('Error al obtener usuario por DNI:', error);
    //         throw error;
    //     } finally {
    //         if (conn) conn.end();
    //     }
// }
static async getByDni(dni) {
    console.log(`Model Usuario: getByDni DNI: ${dni}`);

    let conn;
    try {
        conn = await createConnection();
        console.log("Conexión establecida");

        // 1️⃣ Buscar persona por DNI
        const [personaRows] = await conn.query(`
            SELECT id, nombre, apellido, nacimiento 
            FROM personas 
            WHERE dni = ?;
        `, [dni]);

        if (personaRows.length === 0) {
            console.log("Model USUARIO: No existe persona con ese DNI");
            return { usuario: null, telefonos: null };
        }

        const persona = personaRows[0];

        // 2️⃣ Buscar usuario usando id_persona
        const [usuarioRows] = await conn.query(`
            SELECT *
            FROM usuarios
            WHERE id_persona = ?;
        `, [persona.id]);

        if (usuarioRows.length === 0) {
            console.log("Model USUARIO: No existe usuario para esa persona");
            return { usuario: null, telefonos: null };
        }

        const usuario = usuarioRows[0];

        // 3️⃣ Traer teléfonos
        const [telefonos] = await conn.query(`
            SELECT GROUP_CONCAT(numero SEPARATOR ', ') AS numeros
            FROM telefonos
            WHERE id_usuario = ?;
        `, [usuario.id]);

        return {
            usuario,
            telefonos: telefonos[0],
            persona
        };

    } catch (error) {
        console.error("Error en getByDni:", error);
        throw error;
    } finally {
        if (conn) conn.end();
    }
}


    //REVISAR NO FUNCIONA
    static async addTelefonoAlternativo(id, telefono) {
        try {
            const conn = await createConnection();
            console.log('Conexión a la base de datos establecida');
            await conn.query('INSERT INTO telefonos (id_usuario, numero) VALUES (?, ?)', [id, telefono]);
            console.log('Teléfono alternativo guardado en la base de datos');
        } catch (error) {
            console.error('Error al guardar el teléfono alternativo:', error);
            throw error;
        }
    }
    static async updateUsuario(dni, updates) {
        console.log('Model Usuario: update usuario');
        try {
            // Verificar que updates no sea null, undefined o vacío
            if (!updates || Object.keys(updates).length === 0) {
                throw new Error('Datos de actualización inválidos');
            }
    
            const conn = await createConnection();
    
            // Construir la consulta de actualización dinámica
            const fields = [];
            const values = [];
            for (const [key, value] of Object.entries(updates)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
            values.push(dni); // Añadir el dni al final para la cláusula WHERE
    
            const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE dni = ?;`;
            const [result] = await conn.query(query, values);
    
            console.log('Resultado de la consulta SQL:', result);
            console.log('Filas afectadas:', result.affectedRows);
    
            if (result.affectedRows === 0) {
                throw new Error('No se encontró el usuario con el DNI proporcionado');
            }
    
            console.log('Model: Usuario actualizado exitosamente');
            return result.affectedRows === 1;
        } catch (error) {
            console.error('Error al modificar usuarios desde el modelo:', error);
            throw new Error('Error al modificar usuarios desde el modelo');
        }
    }
      
    

}

module.exports = Usuario