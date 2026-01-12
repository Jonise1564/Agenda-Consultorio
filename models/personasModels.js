const createConnection = require('../config/configDb');

class Persona {
    constructor(dni, nombre, apellido, nacimiento) {
        this.dni = dni;
        this.nombre = nombre;
        this.apellido = apellido;
        this.nacimiento = nacimiento;
    }

    // ===========================================
    // OBTENER TODAS LAS PERSONAS
    // ===========================================
    static async get() {
        console.log('Model: Get All personas');
        let conn;
        try {
            conn = await createConnection();
            const [personas] = await conn.query('SELECT * FROM personas');
            return personas;
        } catch (error) {
            throw new Error('Error al traer personas desde el modelo', error);
        } finally {
            if (conn) conn.end();
        }
    }

    // ===========================================
    // OBTENER POR ID
    // ===========================================
    static async getById(id) {
        console.log('Model: Get Id persona');
        let conn;
        try {
            conn = await createConnection();
            const [personas] = await conn.query('SELECT * FROM personas WHERE id = ?', [id]);
            if (personas.length === 0) return null;
            return personas[0];
        } catch (error) {
            throw new Error('Error al traer persona por ID desde el modelo', error);
        } finally {
            if (conn) conn.end();
        }
    }

    // ===========================================
    // CREAR PERSONA (CORREGIDO PARA RETORNAR ID)
    // ===========================================
    static async create(persona) {
        console.log('Model: Create Persona');
        let conn;
        try {
            conn = await createConnection();
            const { dni, nombre, apellido, nacimiento } = persona;

            // 1. Verificar duplicados por DNI
            const [verificacion] = await conn.query(
                'SELECT dni FROM personas WHERE dni = ?;',
                [dni]
            );

            if (verificacion.length > 0) {
                console.error('Model: DNI duplicado para persona', dni);
                return false;
            }

            // 2. Insertar nueva persona
            const [result] = await conn.query(
                'INSERT INTO personas (dni, nombre, apellido, nacimiento) VALUES (?, ?, ?, ?)',
                [dni, nombre, apellido, nacimiento]
            );

            console.log('Model: Persona Insertada con ID:', result.insertId);

            // RETORNO CLAVE: Devolvemos el objeto con el ID para el controlador
            return {
                id: result.insertId,
                dni,
                nombre,
                apellido,
                nacimiento
            };
        } catch (error) {
            console.error('Error al crear personas desde el modelo:', error);
            throw new Error('Error al crear personas desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // ===========================================
    // OBTENER POR DNI
    // ===========================================
    static async getByDni(dni) {
        console.log(`Model: getByDni Persona dni: ${dni}`);
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query('SELECT * FROM personas WHERE dni = ?', [dni]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener persona por DNI:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // ===========================================
    // ACTUALIZAR PERSONA
    // ===========================================
    static async updatePersona(id_persona, data) {
        let conn;
        try {
            if (!data || Object.keys(data).length === 0) throw new Error('Datos vacíos');

            conn = await createConnection();
            const fields = [];
            const values = [];

            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined && value !== null) {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
            }
            values.push(id_persona);

            const query = `UPDATE personas SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await conn.query(query, values);
            return result.affectedRows === 1;
        } catch (err) {
            console.error('Error updatePersona:', err);
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    // ===========================================
    // ELIMINAR PERSONA
    // ===========================================
    static async delete(dni) {
        console.log('Model: Delete persona');
        let conn;
        try {
            conn = await createConnection();
            const [result] = await conn.query('DELETE FROM personas WHERE dni = ?;', [dni]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error al borrar persona:', error);
            throw new Error('Error al borrar persona desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }

    // ===========================================
    // GESTIÓN DE TELÉFONOS
    // ===========================================
    static async getTelefonos(id_persona) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT id, numero FROM telefonos 
                WHERE id_persona = ? ORDER BY numero ASC
            `, [id_persona]);
            return rows;
        } catch (error) {
            console.error("Error obteniendo teléfonos:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    static async addTelefono(id_persona, numero) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('INSERT INTO telefonos (numero, id_persona) VALUES (?, ?)', [numero, id_persona]);
            return true;
        } catch (error) {
            console.error("Error creando teléfono:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    static async eliminarTelefonos(id_persona) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('DELETE FROM telefonos WHERE id_persona = ?', [id_persona]);
        } catch (error) {
            console.error("Error eliminando teléfonos:", error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = Persona;