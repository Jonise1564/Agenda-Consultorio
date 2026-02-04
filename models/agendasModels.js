const createConnection = require('../config/configDb');

class Agenda {

    // =====================================================
    // 1. OBTENER TODAS LAS AGENDAS (Para el Listado)
    // =====================================================
    // static async getAll() {
    //     let conn;
    //     try {
    //         conn = await createConnection();
    //         const [agendas] = await conn.query(`        
    //         SELECT 
    //             a.id,
    //             a.id_medico,    
    //             a.fecha_creacion,
    //             a.fecha_fin,
    //             p.nombre AS nombre,
    //             p.apellido AS apellido,
    //             GROUP_CONCAT(DISTINCT d.dia ORDER BY d.id SEPARATOR ', ') AS dias,
    //             a.hora_inicio,
    //             a.hora_fin,
    //             a.limite_sobreturnos,
    //             a.duracion_turnos,
    //             e.nombre AS especialidad,
    //             s.nombre AS sucursal,
    //             c.nombre AS clasificacion
    //         FROM agendas a
    //         LEFT JOIN agenda_dias ad ON a.id = ad.id_agenda
    //         LEFT JOIN dias d ON ad.id_dia = d.id
    //         LEFT JOIN medicos m ON m.id_medico = a.id_medico
    //         LEFT JOIN personas p ON m.id_persona = p.id
    //         LEFT JOIN especialidades e ON e.id = a.id_especialidad
    //         LEFT JOIN sucursales s ON a.id_sucursal = s.id
    //         LEFT JOIN clasificaciones c ON a.id_clasificacion = c.id
    //         GROUP BY 
    //             a.id, a.fecha_creacion, a.fecha_fin,
    //             p.nombre, p.apellido,
    //             a.hora_inicio, a.hora_fin,
    //             a.limite_sobreturnos, a.duracion_turnos,
    //             e.nombre, s.nombre, c.nombre
    //         ORDER BY a.id DESC;
    //         `);
    //         return agendas;
    //     } catch (error) {
    //         console.error('Error fetching agendas:', error);
    //         throw new Error('Error al traer agendas');
    //     } finally {
    //         if (conn) conn.end();
    //     }
    // }

    static async getAll() {
        let conn;
        try {
            conn = await createConnection();
            const [agendas] = await conn.query(`        
        SELECT 
            a.id,
            a.id_medico,    
            a.fecha_creacion,
            a.fecha_fin,
            p.nombre AS nombre,
            p.apellido AS apellido,
            GROUP_CONCAT(DISTINCT d.dia ORDER BY d.id SEPARATOR ', ') AS dias,
            a.hora_inicio,
            a.hora_fin,
            a.limite_sobreturnos,
            a.duracion_turnos,
            e.nombre AS especialidad,
            s.nombre AS sucursal,
            c.nombre AS clasificacion
        FROM agendas a
        LEFT JOIN agenda_dias ad ON a.id = ad.id_agenda
        LEFT JOIN dias d ON ad.id_dia = d.id
        LEFT JOIN medicos m ON m.id_medico = a.id_medico
        LEFT JOIN personas p ON m.id_persona = p.id
        LEFT JOIN especialidades e ON e.id = a.id_especialidad
        LEFT JOIN sucursales s ON a.id_sucursal = s.id
        LEFT JOIN clasificaciones c ON a.id_clasificacion = c.id
        WHERE m.estado = 1  -- <--- FILTRO AGREGADO: Solo médicos activos
        GROUP BY 
            a.id, a.fecha_creacion, a.fecha_fin,
            p.nombre, p.apellido,
            a.hora_inicio, a.hora_fin,
            a.limite_sobreturnos, a.duracion_turnos,
            e.nombre, s.nombre, c.nombre
        ORDER BY a.id DESC;
        `);
            return agendas;
        } catch (error) {
            console.error('Error fetching agendas:', error);
            throw new Error('Error al traer agendas');
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 2. OBTENER AGENDA POR ID
    // =====================================================
    static async getAgendaById(id) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT 
                    a.*,
                    p.nombre AS nombre_medico,
                    p.apellido AS apellido_medico,
                    e.nombre AS especialidad,
                    s.nombre AS sucursal,
                    c.nombre AS clasificacion,
                    (SELECT GROUP_CONCAT(id_dia) FROM agenda_dias WHERE id_agenda = a.id) AS diasIds
                FROM agendas a
                JOIN medicos m ON m.id_medico = a.id_medico
                JOIN personas p ON p.id = m.id_persona
                JOIN especialidades e ON e.id = a.id_especialidad
                JOIN sucursales s ON s.id = a.id_sucursal
                JOIN clasificaciones c ON c.id = a.id_clasificacion
                WHERE a.id = ?;
            `, [id]);

            if (rows.length > 0) {
                const agenda = rows[0];
                agenda.diasIds = agenda.diasIds ? agenda.diasIds.split(',').map(Number) : [];
                return agenda;
            }
            return null;
        } catch (error) {
            console.error('Error getAgendaById:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 3. CREAR AGENDA
    // =====================================================
    static async create(data) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            const [result] = await conn.query(`
                INSERT INTO agendas (
                    limite_sobreturnos, fecha_creacion, fecha_fin,
                    hora_inicio, hora_fin, duracion_turnos,
                    id_medico, id_sucursal, id_clasificacion, id_especialidad
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.limite_sobreturnos, data.fecha_creacion, data.fecha_fin,
                data.hora_inicio, data.hora_fin, data.duracion_turnos,
                data.id_medico, data.id_sucursal, data.id_clasificacion, data.id_especialidad
            ]);

            const idAgenda = result.insertId;

            if (data.dias && Array.isArray(data.dias)) {
                const diasLimpios = data.dias.filter(d => d !== "");
                if (diasLimpios.length > 0) {
                    const values = diasLimpios.map(d => [idAgenda, d]);
                    await conn.query(`INSERT INTO agenda_dias (id_agenda, id_dia) VALUES ?`, [values]);
                }
            }

            await conn.commit();
            return idAgenda;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 4. ACTUALIZAR AGENDA
    // =====================================================
    static async updateAgenda(id, updates, dias) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();

            await conn.query(`
                UPDATE agendas SET
                    limite_sobreturnos = ?, fecha_creacion = ?, fecha_fin = ?,
                    hora_inicio = ?, hora_fin = ?, duracion_turnos = ?,
                    id_medico = ?, id_sucursal = ?, id_clasificacion = ?, id_especialidad = ?
                WHERE id = ?
            `, [
                updates.limite_sobreturnos, updates.fecha_creacion, updates.fecha_fin,
                updates.hora_inicio, updates.hora_fin, updates.duracion_turnos,
                updates.id_medico, updates.id_sucursal, updates.id_clasificacion, updates.id_especialidad,
                id
            ]);

            await conn.query(`DELETE FROM agenda_dias WHERE id_agenda = ?`, [id]);

            const diasArray = Array.isArray(dias) ? dias : (dias ? [dias] : []);
            const diasLimpios = diasArray.map(d => parseInt(d)).filter(d => !isNaN(d) && d > 0);

            if (diasLimpios.length > 0) {
                const values = diasLimpios.map(diaId => [id, diaId]);
                await conn.query(`INSERT INTO agenda_dias (id_agenda, id_dia) VALUES ?`, [values]);
            } else {
                throw new Error('Debe seleccionar al menos un día válido');
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

    // =====================================================
    // 5. ELIMINAR AGENDA
    // =====================================================
    static async eliminar(id) {
        let conn;
        try {
            conn = await createConnection();
            await conn.beginTransaction();
            await conn.query(`DELETE FROM agenda_dias WHERE id_agenda = ?`, [id]);
            await conn.query(`DELETE FROM agendas WHERE id = ?`, [id]);
            await conn.commit();
            return true;
        } catch (error) {
            if (conn) await conn.rollback();
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 6. BUSCAR AGENDA ESPECÍFICA (Para el Panel de Turnos)
    // =====================================================
    static async obtenerAgendaPorMedicoYFecha(id_medico, id_especialidad, fecha) {
        // Obtenemos el día de la semana (1-7)
        const partes = fecha.split('-');
        const fechaLocal = new Date(partes[0], partes[1] - 1, partes[2]);
        const jsDay = fechaLocal.getDay();
        const idDia = jsDay === 0 ? 7 : jsDay;

        let conn;
        try {
            conn = await createConnection();

            // Usamos DATE() para limpiar las fechas de horas/minutos/segundos
            let sql = `
                SELECT a.*
                FROM agendas a
                JOIN agenda_dias ad ON a.id = ad.id_agenda
                WHERE a.id_medico = ?
                  AND DATE(?) BETWEEN DATE(a.fecha_creacion) AND DATE(a.fecha_fin)
                  AND ad.id_dia = ?
            `;

            const params = [id_medico, fecha, idDia];

            if (id_especialidad) {
                sql += ` AND a.id_especialidad = ?`;
                params.push(id_especialidad);
            }

            const [rows] = await conn.query(sql, params);
            return rows;
        } catch (error) {
            console.error('Error obtenerAgendaPorMedicoYFecha:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }



    // =====================================================
    // 7. VALIDAR SOLAPAMIENTOS (NUEVA CREACIÓN)
    // =====================================================
    static async existeSolapamiento(data) {
        let conn;
        try {
            conn = await createConnection();
            const diasLimpios = Array.isArray(data.dias) ? data.dias.filter(d => d !== "") : [];
            if (diasLimpios.length === 0) return false;

            const diaPlaceholders = diasLimpios.map(() => '?').join(',');
            const [rows] = await conn.query(`
                SELECT 1 FROM agendas a
                JOIN agenda_dias ad ON a.id = ad.id_agenda
                WHERE a.id_medico = ? AND a.id_especialidad = ?
                  AND (a.fecha_creacion <= ? AND a.fecha_fin >= ?)
                  AND ad.id_dia IN (${diaPlaceholders})
                  AND NOT (? >= a.hora_fin OR ? <= a.hora_inicio)
                LIMIT 1
            `, [data.id_medico, data.id_especialidad, data.fecha_fin, data.fecha_creacion, ...diasLimpios, data.hora_inicio, data.hora_fin]);

            return rows.length > 0;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 8. VALIDAR SOLAPAMIENTOS (EDICIÓN - IGNORA ID ACTUAL)
    // =====================================================
    static async existeSolapamientoUpdate(datos = {}) {
        let conn;
        try {
            conn = await createConnection();
            const { id_agenda, id_medico, id_especialidad, fecha_creacion, fecha_fin, hora_inicio, hora_fin, dias } = datos;

            const diasArray = Array.isArray(dias) ? dias : [dias];
            const diasLimpios = diasArray.filter(d => d !== "" && d !== null);

            if (diasLimpios.length === 0) return false;

            const placeholders = diasLimpios.map(() => '?').join(',');

            const [rows] = await conn.query(`
                SELECT 1 FROM agendas a
                INNER JOIN agenda_dias ad ON a.id = ad.id_agenda
                WHERE a.id_medico = ? 
                  AND a.id_especialidad = ?
                  AND a.id != ?
                  AND (a.fecha_creacion <= ? AND a.fecha_fin >= ?)
                  AND ad.id_dia IN (${placeholders})
                  AND NOT (? >= a.hora_fin OR ? <= a.hora_inicio)
                LIMIT 1
            `, [id_medico, id_especialidad, id_agenda, fecha_fin, fecha_creacion, ...diasLimpios, hora_inicio, hora_fin]);

            return rows.length > 0;
        } catch (error) {
            console.error('Error en existeSolapamientoUpdate:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }


    // =====================================================
    // 9. VERIFICAR FERIADO (Global)
    // =====================================================
    static async esFeriado(fecha) {
        let conn;
        try {
            conn = await createConnection();
            const [rows] = await conn.query('SELECT descripcion FROM FERIADOS WHERE fecha = ?', [fecha]);
            return rows.length > 0 ? rows[0].descripcion : null;
        } catch (error) {
            console.error('Error en esFeriado:', error);
            return null;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 10. VERIFICAR AUSENCIA DEL MÉDICO (Vacaciones/Imprevistos)
    // =====================================================
    static async obtenerAusencia(id_medico, fecha) {
        let conn;
        try {
            conn = await createConnection();
            const query = `
                SELECT tipo, descripcion FROM AUSENCIAS 
                WHERE id_medico = ? 
                AND ? BETWEEN fecha_inicio AND fecha_fin
                LIMIT 1`;
            const [rows] = await conn.query(query, [id_medico, fecha]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error en obtenerAusencia:', error);
            return null;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 11. REGISTRAR AUSENCIA (Vacaciones, Licencias, etc.)
    // =====================================================
    static async registrarAusencia(data) {
        let conn;
        try {
            conn = await createConnection();
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = data;

            const query = `
                INSERT INTO AUSENCIAS (id_medico, fecha_inicio, fecha_fin, tipo, descripcion)
                VALUES (?, ?, ?, ?, ?)
            `;

            const [result] = await conn.query(query, [
                id_medico,
                fecha_inicio,
                fecha_fin,
                tipo,
                descripcion || null
            ]);

            return result.insertId;
        } catch (error) {
            console.error('Error en registrarAusencia:', error);
            throw new Error('No se pudo registrar la ausencia en la base de datos');
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 12. VERIFICAR TURNOS AFECTADOS POR AUSENCIA
    // =====================================================
    static async verificarTurnosAfectados(id_medico, fecha_inicio, fecha_fin) {
        let conn;
        try {
            conn = await createConnection();
            const query = `
                SELECT COUNT(*) as total 
                FROM turnos 
                WHERE id_medico = ? 
                AND fecha_turno BETWEEN ? AND ?
                AND estado != 'cancelado'`;
            const [rows] = await conn.query(query, [id_medico, fecha_inicio, fecha_fin]);
            return rows[0].total;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 13. LISTAR TODAS LAS AUSENCIAS (Para el Panel de Administración)
    // =====================================================
    static async listarAusencias() {
        let conn;
        try {
            conn = await createConnection();
            const sql = `
                SELECT 
                    a.id, 
                    a.id_medico, 
                    a.fecha_inicio, 
                    a.fecha_fin, 
                    a.tipo, 
                    a.descripcion,
                    p.nombre, 
                    p.apellido 
                FROM AUSENCIAS a
                JOIN medicos m ON a.id_medico = m.id_medico
                JOIN personas p ON m.id_persona = p.id
                ORDER BY a.fecha_inicio DESC
            `;
            const [rows] = await conn.query(sql);
            return rows;
        } catch (error) {
            console.error('Error en listarAusencias:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }

    // =====================================================
    // 14. ELIMINAR AUSENCIA (Para liberar la agenda)
    // =====================================================
    static async eliminarAusencia(id) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('DELETE FROM AUSENCIAS WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error en eliminarAusencia:', error);
            throw error;
        } finally {
            if (conn) conn.end();
        }
    }
    // =====================================================
    // 15. ACTUALIZAR AUSENCIA EXISTENTE
    // =====================================================
    static async actualizarAusencia(id, data) {
        let conn;
        try {
            conn = await createConnection();
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = data;

            const query = `
                UPDATE AUSENCIAS 
                SET id_medico = ?, 
                    fecha_inicio = ?, 
                    fecha_fin = ?, 
                    tipo = ?, 
                    descripcion = ?
                WHERE id = ?
            `;

            const [result] = await conn.query(query, [
                id_medico,
                fecha_inicio,
                fecha_fin,
                tipo,
                descripcion || null,
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en actualizarAusencia (Modelo):', error);
            throw new Error('No se pudo actualizar la ausencia en la base de datos');
        } finally {
            if (conn) conn.end();
        }
    }




}

module.exports = Agenda;
