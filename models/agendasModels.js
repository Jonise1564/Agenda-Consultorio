const createConnection = require('../config/configDb');
const { update } = require('../controllers/agendasControllers');


class Agenda {
    constructor(id, fecha_creacion, fecha_fin, hora_inicio, hora_fin, duracion_turnos, limite_sobreturnos, matricula, id_sucursal, id_clasificacion) {
        this.id,
            this.fecha_creacion,
            this.fecha_fin,
            this.hora_inicio,
            this.hora_fin,
            this.duracion_turnos,
            this.limite_sobreturnos,
            this.matricula,
            this.id_sucursal,
            this.id_clasificacion
    }

    static async getAll() {
        console.log('Model: Get All agendas');
        let conn;

        try {
            conn = await createConnection();

            const [agendas] = await conn.query(`        

            SELECT 
                a.id,
                a.fecha_creacion,
                a.fecha_fin,

                p.nombre AS nombre,
                p.apellido AS apellido,

                GROUP_CONCAT(DISTINCT d.dia ORDER BY d.dia SEPARATOR ', ') AS dias,

                a.hora_inicio,
                a.hora_fin,

                a.limite_sobreturnos,
                a.duracion_turnos,

                e.nombre AS especialidad,
                s.nombre AS sucursal,
                c.nombre AS clasificacion

            FROM agendas a

            -- ============================
            -- DÍAS DISPONIBLES
            -- ============================
            LEFT JOIN dias_disponibles dd 
                ON a.id = dd.id_agenda

            LEFT JOIN dias d 
                ON dd.dia = d.id     

            -- ============================
            -- MÉDICO
            -- ============================
            LEFT JOIN medicos m 
                ON m.id_medico = a.id_medico

            LEFT JOIN personas p 
                ON m.id_persona = p.id

            -- ============================
            -- ESPECIALIDAD
            -- ============================
            LEFT JOIN especialidades e 
                ON e.id = a.id_especialidad

            -- ============================
            -- SUCURSAL Y CLASIFICACIÓN
            -- ============================
            LEFT JOIN sucursales s 
                ON a.id_sucursal = s.id

            LEFT JOIN clasificaciones c 
                ON a.id_clasificacion = c.id

            GROUP BY 
                a.id, 
                a.fecha_creacion, 
                a.fecha_fin,
                p.nombre, 
                p.apellido,
                a.hora_inicio, 
                a.hora_fin,
                a.limite_sobreturnos, 
                a.duracion_turnos,
                e.nombre, 
                s.nombre, 
                c.nombre

            ORDER BY a.id DESC;


        `);

            return agendas;

        } catch (error) {
            console.error('Error fetching agendas:', error);
            throw new Error('Error al traer agendas desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }


    //mostrar agenda por id
    static async getAgendaById(id) {
        console.log('Model: getAgendaById');
        let conn;

        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
            SELECT 
                a.id,
                a.limite_sobreturnos,
                a.fecha_creacion,
                a.fecha_fin,
                a.hora_inicio,
                a.hora_fin,
                a.duracion_turnos,

                -- IDs reales
                a.id_medico,
                a.id_especialidad,
                a.id_sucursal,
                a.id_clasificacion,

                -- Datos descriptivos
                p.nombre   AS nombre_medico,
                p.apellido AS apellido_medico,
                e.nombre   AS especialidad,
                s.nombre   AS sucursal,
                c.nombre   AS clasificacion

            FROM agendas a
            JOIN medicos m           ON m.id_medico = a.id_medico
            JOIN personas p          ON p.id = m.id_persona
            JOIN especialidades e    ON e.id = a.id_especialidad
            JOIN sucursales s        ON s.id = a.id_sucursal
            JOIN clasificaciones c   ON c.id = a.id_clasificacion

            WHERE a.id = ?;
        `, [id]);

            return rows[0] || null;

        } catch (error) {
            console.error('Error al traer la agenda por id:', error);
            throw new Error('Error al traer agenda desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }



    //insertar agenda
    static async create({
        fecha_creacion,
        fecha_fin,
        hora_inicio,
        hora_fin,
        limite_sobreturnos,
        duracion_turnos,
        id_medico,
        id_sucursal,
        id_clasificacion,
        id_especialidad
    }) {
        console.log('Model: Create agenda');
        let conn;

        try {
            conn = await createConnection();
            await conn.beginTransaction();

            await conn.query(`
            CALL crear_agenda(
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `, [
                limite_sobreturnos,
                fecha_creacion,
                fecha_fin,
                hora_inicio,
                hora_fin,
                duracion_turnos,
                id_medico,
                id_sucursal,
                id_clasificacion,
                id_especialidad
            ]);

            await conn.commit();
            console.log('Agenda creada exitosamente');
            return true;

        } catch (error) {
            if (conn) await conn.rollback();
            console.error('Error creating agenda:', error);
            throw new Error('Error al crear agenda');
        } finally {
            if (conn) conn.end();
        }
    }

    // update agenda
    static async updateAgenda(id, updates) {
        console.log('Model: update agenda');

        let conn;
        try {
            const {
                fecha_creacion,
                fecha_fin,
                hora_inicio,
                hora_fin,
                limite_sobreturnos,
                duracion_turnos,
                id_medico,
                id_sucursal,
                id_clasificacion,
                id_especialidad
            } = updates;

            conn = await createConnection();

            const [result] = await conn.query(`
            CALL modificar_agenda(
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `, [
                id,
                limite_sobreturnos,
                fecha_creacion,
                fecha_fin,
                hora_inicio,
                hora_fin,
                duracion_turnos,
                id_medico,
                id_sucursal,
                id_clasificacion,
                id_especialidad
            ]);

            return result.affectedRows > 0;

        } catch (error) {
            console.error('Error al modificar Agenda desde el modelo:', error);
            throw new Error('Error al modificar Agenda desde el modelo');
        } finally {
            if (conn) conn.end();
        }
    }




    // Eliminar Agenda
    static async eliminar(id) {
        let conn
        try {
            conn = await createConnection();
            await conn.beginTransaction();
            const [result] = await conn.query('CALL eliminar_agenda(?)', [id]);
            if (result.affectedRows === 0) {
                throw new Error('Error al eliminar la agenda');
            }
            await conn.commit(); return result;
        } catch (error) {
            if (conn)
                await conn.rollback();
            console.error('Error eliminando la agenda:', error);
            throw new Error('Error al eliminar la agenda');
        } finally {
            if (conn)
                conn.end();
        }
    }

     //VERIFICAR SOLAPAMIENTO AL CREAR
    static async existeSolapamiento({
        fecha_creacion,
        fecha_fin,
        hora_inicio,
        hora_fin,
        id_medico,
        id_especialidad
    }) {
        let conn;
        try {
            conn = await createConnection();

            const [rows] = await conn.query(`
            SELECT 1
            FROM agendas
            WHERE id_medico = ?
              AND id_especialidad = ?
              AND fecha_creacion <= ?
              AND fecha_fin >= ?
              AND NOT (
                    ? >= hora_fin
                    OR ? <= hora_inicio
              )
            LIMIT 1
        `, [
                id_medico,
                id_especialidad,
                fecha_fin,
                fecha_creacion,
                hora_inicio,
                hora_fin
            ]);

            return rows.length > 0;

        } finally {
            if (conn) conn.end();
        }
    }

    //VERIFICAR SOLAPAMIENTO EN EL UPDATE
    static async existeSolapamientoUpdate({
    id_agenda,
    fecha_creacion,
    fecha_fin,
    hora_inicio,
    hora_fin,
    id_medico,
    id_especialidad
}) {
    let conn;
    try {
        conn = await createConnection();

        const [rows] = await conn.query(`
            SELECT 1
            FROM agendas
            WHERE id <> ?
              AND id_medico = ?
              AND id_especialidad = ?
              AND fecha_creacion <= ?
              AND fecha_fin >= ?
              AND NOT (
                    ? >= hora_fin
                    OR ? <= hora_inicio
              )
            LIMIT 1
        `, [
            id_agenda,
            id_medico,
            id_especialidad,
            fecha_fin,
            fecha_creacion,
            hora_inicio,
            hora_fin
        ]);

        return rows.length > 0;
    } finally {
        if (conn) conn.end();
    }
}


}



module.exports = Agenda;

