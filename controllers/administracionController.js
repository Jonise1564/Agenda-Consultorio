const createConnection = require('../config/configDb');
const Medico = require('../models/medicosModels');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const fs = require('fs');

class AdministracionController {

    async indexBloqueos(req, res, next) {
        let conn;
        try {
            conn = await createConnection();
            const medicos = await Medico.listar();
            const [ausencias] = await conn.query(`
                SELECT a.*, p.nombre, p.apellido 
                FROM AUSENCIAS a
                JOIN medicos m ON a.id_medico = m.id_medico
                JOIN personas p ON m.id_persona = p.id
                ORDER BY a.fecha_inicio DESC
            `);
            const [feriados] = await conn.query('SELECT * FROM FERIADOS ORDER BY fecha ASC');
            res.render('admin/bloqueos', { medicos, ausencias, feriados, status: req.query.status || null });
        } catch (error) { next(error); } finally { if (conn) conn.end(); }
    }

    async guardarAusencia(req, res) {
        let conn;
        try {
            const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;
            conn = await createConnection();
            await conn.query('INSERT INTO AUSENCIAS (id_medico, fecha_inicio, fecha_fin, tipo, descripcion) VALUES (?, ?, ?, ?, ?)', [id_medico, fecha_inicio, fecha_fin, tipo, descripcion]);
            res.redirect('/admin/bloqueos?status=ausencia_success');
        } catch (error) { res.redirect('/admin/bloqueos?status=error'); } finally { if (conn) conn.end(); }
    }

    async guardarFeriado(req, res) {
        let conn;
        try {
            const { fecha, descripcion } = req.body;
            conn = await createConnection();
            await conn.query('INSERT INTO FERIADOS (fecha, descripcion) VALUES (?, ?)', [fecha, descripcion]);
            res.redirect('/admin/bloqueos?status=feriado_success');
        } catch (error) { res.redirect('/admin/bloqueos?status=error'); } finally { if (conn) conn.end(); }
    }

    async eliminarAusencia(req, res) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('DELETE FROM AUSENCIAS WHERE id = ?', [req.params.id]);
            res.redirect('/admin/bloqueos?status=deleted');
        } catch (error) { res.redirect('/admin/bloqueos?status=error'); } finally { if (conn) conn.end(); }
    }

    async listaSecretarias(req, res, next) {
        let conn;
        try {
            conn = await createConnection();
            const [secretarias] = await conn.query(`
                SELECT u.id, p.nombre, p.apellido, p.dni, p.nacimiento, u.email, u.id_rol
                FROM usuarios u
                JOIN personas p ON u.id_persona = p.id
                WHERE u.id_rol = 3
            `);
            res.render('admin/secretarias', { secretarias, page: 'secretarias' });
        } catch (error) { next(error); } finally { if (conn) conn.end(); }
    }

    async guardarSecretaria(req, res) {
        let conn;
        try {
            const { nombre, apellido, dni, email, password, nacimiento } = req.body;
            conn = await createConnection();
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const [nuevaP] = await conn.query('INSERT INTO personas (nombre, apellido, dni, nacimiento) VALUES (?, ?, ?, ?)', [nombre, apellido, dni, nacimiento]);
            await conn.query('INSERT INTO usuarios (id_persona, email, password, id_rol) VALUES (?, ?, ?, 3)', [nuevaP.insertId, email, passwordHash]);
            res.json({ success: true });
        } catch (error) { res.status(500).json({ error: 'Error al guardar.' }); } finally { if (conn) conn.end(); }
    }

    async editarSecretariaForm(req, res, next) {
        let conn;
        try {
            const { id } = req.params;
            conn = await createConnection();
            const [rows] = await conn.query(`
                SELECT u.id, p.nombre, p.apellido, p.dni, p.nacimiento, u.email 
                FROM usuarios u 
                JOIN personas p ON u.id_persona = p.id 
                WHERE u.id = ?`, [id]);
            if (rows.length === 0) return res.redirect('/admin/secretarias');
            res.render('admin/editar_secretaria', { s: rows[0] });
        } catch (error) { next(error); } finally { if (conn) conn.end(); }
    }

    async actualizarSecretaria(req, res) {
        let conn;
        try {
            const { id } = req.params;
            const { nombre, apellido, email, nacimiento, password } = req.body;
            conn = await createConnection();
            const [user] = await conn.query('SELECT id_persona FROM usuarios WHERE id = ?', [id]);
            await conn.query('UPDATE personas SET nombre = ?, apellido = ?, nacimiento = ? WHERE id = ?', [nombre, apellido, nacimiento, user[0].id_persona]);
            if (password && password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                await conn.query('UPDATE usuarios SET email = ?, password = ? WHERE id = ?', [email, hash, id]);
            } else {
                await conn.query('UPDATE usuarios SET email = ? WHERE id = ?', [email, id]);
            }
            res.json({ success: true });
        } catch (error) { res.status(500).json({ error: error.message }); } finally { if (conn) conn.end(); }
    }

    async actualizarPerfil(req, res) {
        let conn;
        try {
            const { nombre, apellido, email, password } = req.body;
            const usuario = req.user; 
            if (!usuario) return res.redirect('/auth/login');
            conn = await createConnection();
            let sql = "UPDATE usuarios u JOIN personas p ON u.id_persona = p.id SET p.nombre = ?, p.apellido = ?, u.email = ?";
            let params = [nombre, apellido, email];
            if (password && password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(password, salt);
                sql += ", u.password = ?";
                params.push(hashed);
            }
            sql += " WHERE u.id = ?";
            params.push(usuario.id);
            await conn.query(sql, params);
            res.redirect('/?status=profile_updated');
        } catch (error) { res.redirect('/?status=error'); } finally { if (conn) conn.end(); }
    }

    async guardarFeriado(req, res) {
        let conn;
        try {
            const { fecha, descripcion } = req.body;
            // Validación extra de seguridad
            if (!fecha || !descripcion) throw new Error("Datos incompletos");
            
            conn = await createConnection();
            await conn.query('INSERT INTO FERIADOS (fecha, descripcion) VALUES (?, ?)', [fecha, descripcion]);
            res.redirect('/admin/bloqueos?status=feriado_success');
        } catch (error) { 
            console.error("Error al guardar feriado:", error);
            res.redirect('/admin/bloqueos?status=error'); 
        } finally { if (conn) conn.end(); }
    }

    async eliminarFeriado(req, res) {
        let conn;
        try {
            conn = await createConnection();
            await conn.query('DELETE FROM FERIADOS WHERE id = ?', [req.params.id]);
            res.redirect('/admin/bloqueos?status=feriado_deleted');
        } catch (error) { 
            res.redirect('/admin/bloqueos?status=error'); 
        } finally { if (conn) conn.end(); }
    }


//     async importarFeriadosExcel(req, res) {
//     let conn;
//     try {
//         if (!req.file) throw new Error("No se subió ningún archivo");

//         // 1. LEER EL EXCEL con cellDates: true para que convierta los números a fechas JS
//         const workbook = xlsx.readFile(req.file.path, { cellDates: true });
//         const sheetName = workbook.SheetNames[0];
//         const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         conn = await createConnection();
        
//         for (const fila of data) {
//             let { fecha, descripcion } = fila;
            
//             if (fecha && descripcion) {
//                 // 2. FORMATEAR LA FECHA para MySQL (YYYY-MM-DD)
//                 // Si la librería lo detectó como fecha de JS, la formateamos
//                 const fechaFinal = new Date(fecha).toISOString().split('T')[0];

//                 await conn.query(
//                     'INSERT INTO FERIADOS (fecha, descripcion) VALUES (?, ?)', 
//                     [fechaFinal, descripcion]
//                 );
//             }
//         }

//         // Borrar archivo temporal
//         if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

//         res.redirect('/admin/bloqueos?status=import_success');
//     } catch (error) {
//         console.error("Error en importación:", error);
//         res.redirect('/admin/bloqueos?status=error_import');
//     } finally {
//         if (conn) conn.end();
//     }
// }

async importarFeriadosExcel(req, res) {
    let conn;
    try {
        if (!req.file) throw new Error("No se subió ningún archivo");

        // 1. LEER EL EXCEL con cellDates: true para manejar fechas de Excel (números seriales)
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        conn = await createConnection();
        
        for (const fila of data) {
            // Usamos nombres flexibles por si en el Excel vienen con mayúsculas
            let fechaRaw = fila.fecha || fila.Fecha;
            let descripcion = fila.descripcion || fila.Descripcion;
            
            if (fechaRaw && descripcion) {
                // 2. FORMATEAR LA FECHA para MySQL (YYYY-MM-DD)
                // Si es un objeto Date (gracias a cellDates: true), lo convertimos.
                // Si viene como texto, intentamos parsearlo.
                const fechaFinal = new Date(fechaRaw).toISOString().split('T')[0];

                // OPCIÓN B: INSERT O UPDATE si la fecha ya existe (Evita el error ER_DUP_ENTRY)
                await conn.query(`
                    INSERT INTO FERIADOS (fecha, descripcion) 
                    VALUES (?, ?) 
                    ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion)
                `, [fechaFinal, descripcion]);
            }
        }

        // Borrar archivo temporal para no llenar el disco
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.redirect('/admin/bloqueos?status=import_success');
    } catch (error) {
        console.error("Error en importación:", error);
        
        // Limpieza de archivo incluso si hay error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.redirect('/admin/bloqueos?status=error_import');
    } finally {
        if (conn) conn.end();
    }
}


}

module.exports = new AdministracionController();