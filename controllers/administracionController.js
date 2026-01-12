const createConnection = require('../config/configDb');
const Medico = require('../models/medicosModels');

class AdministracionController {

    // Renderiza la vista principal de gestión de bloqueos
    async indexBloqueos(req, res, next) {
        let conn;
        try {
            conn = await createConnection();
            const medicos = await Medico.listar();
            
            // Traemos las ausencias actuales para mostrar en una lista
            const [ausencias] = await conn.query(`
                SELECT a.*, p.nombre, p.apellido 
                FROM AUSENCIAS a
                JOIN medicos m ON a.id_medico = m.id_medico
                JOIN personas p ON m.id_persona = p.id
                ORDER BY a.fecha_inicio DESC
            `);

            // Traemos los feriados
            const [feriados] = await conn.query('SELECT * FROM FERIADOS ORDER BY fecha DESC');

            res.render('admin/bloqueos', {
                medicos,
                ausencias,
                feriados,
                status: req.query.status || null
            });
        } catch (error) {
            next(error);
        } finally {
            if (conn) conn.end();
        }
    }

    // Guarda una nueva ausencia (Vacaciones, Imprevistos, etc.)
    async guardarAusencia(req, res) {
        let conn;
        try {
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;
            conn = await createConnection();

            await conn.query(`
                INSERT INTO AUSENCIAS (id_medico, fecha_inicio, fecha_fin, tipo, descripcion)
                VALUES (?, ?, ?, ?, ?)
            `, [id_medico, fecha_inicio, fecha_fin, tipo, descripcion]);

            res.redirect('/admin/bloqueos?status=ausencia_success');
        } catch (error) {
            console.error(error);
            res.redirect('/admin/bloqueos?status=error');
        } finally {
            if (conn) conn.end();
        }
    }

    // Guarda un nuevo feriado
    async guardarFeriado(req, res) {
        let conn;
        try {
            const { fecha, descripcion } = req.body;
            conn = await createConnection();

            await conn.query(`
                INSERT INTO FERIADOS (fecha, descripcion)
                VALUES (?, ?)
            `, [fecha, descripcion]);

            res.redirect('/admin/bloqueos?status=feriado_success');
        } catch (error) {
            console.error(error);
            res.redirect('/admin/bloqueos?status=error');
        } finally {
            if (conn) conn.end();
        }
    }

    // Eliminar un bloqueo (opcional pero necesario)
    async eliminarAusencia(req, res) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('DELETE FROM AUSENCIAS WHERE id = ?', [req.params.id]);
            res.redirect('/admin/bloqueos?status=deleted');
        } catch (error) {
            res.redirect('/admin/bloqueos?status=error');
        } finally {
            if (conn) conn.end();
        }
    }
}

module.exports = new AdministracionController();