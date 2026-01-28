// // const createConnection = require('../config/configDb');
// // const Medico = require('../models/medicosModels');
// // const bcrypt = require('bcryptjs')

// // class AdministracionController {

// //     // Renderiza la vista principal de gestión de bloqueos
// //     async indexBloqueos(req, res, next) {
// //         let conn;
// //         try {
// //             conn = await createConnection();
// //             const medicos = await Medico.listar();

// //             // Traemos las ausencias actuales para mostrar en una lista
// //             const [ausencias] = await conn.query(`
// //                 SELECT a.*, p.nombre, p.apellido 
// //                 FROM AUSENCIAS a
// //                 JOIN medicos m ON a.id_medico = m.id_medico
// //                 JOIN personas p ON m.id_persona = p.id
// //                 ORDER BY a.fecha_inicio DESC
// //             `);

// //             // Traemos los feriados
// //             const [feriados] = await conn.query('SELECT * FROM FERIADOS ORDER BY fecha DESC');

// //             res.render('admin/bloqueos', {
// //                 medicos,
// //                 ausencias,
// //                 feriados,
// //                 status: req.query.status || null
// //             });
// //         } catch (error) {
// //             next(error);
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }

// //     // Guarda una nueva ausencia (Vacaciones, Imprevistos, etc.)
// //     async guardarAusencia(req, res) {
// //         let conn;
// //         try {
// //             const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;
// //             conn = await createConnection();

// //             await conn.query(`
// //                 INSERT INTO AUSENCIAS (id_medico, fecha_inicio, fecha_fin, tipo, descripcion)
// //                 VALUES (?, ?, ?, ?, ?)
// //             `, [id_medico, fecha_inicio, fecha_fin, tipo, descripcion]);

// //             res.redirect('/admin/bloqueos?status=ausencia_success');
// //         } catch (error) {
// //             console.error(error);
// //             res.redirect('/admin/bloqueos?status=error');
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }

// //     // Guarda un nuevo feriado
// //     async guardarFeriado(req, res) {
// //         let conn;
// //         try {
// //             const { fecha, descripcion } = req.body;
// //             conn = await createConnection();

// //             await conn.query(`
// //                 INSERT INTO FERIADOS (fecha, descripcion)
// //                 VALUES (?, ?)
// //             `, [fecha, descripcion]);

// //             res.redirect('/admin/bloqueos?status=feriado_success');
// //         } catch (error) {
// //             console.error(error);
// //             res.redirect('/admin/bloqueos?status=error');
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }

// //     // Eliminar un bloqueo (opcional pero necesario)
// //     async eliminarAusencia(req, res) {
// //         let conn;
// //         try {
// //             conn = await createConnection();
// //             await conn.query('DELETE FROM AUSENCIAS WHERE id = ?', [req.params.id]);
// //             res.redirect('/admin/bloqueos?status=deleted');
// //         } catch (error) {
// //             res.redirect('/admin/bloqueos?status=error');
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }
// //     async listaSecretarias(req, res, next) {
// //         let conn;
// //         try {
// //             conn = await createConnection();
// //             const [secretarias] = await conn.query(`
// //             SELECT 
// //                 u.id,           
// //                 p.nombre, 
// //                 p.apellido, 
// //                 p.dni, 
// //                 p.nacimiento,
// //                 u.email,        
// //                 u.id_rol
// //             FROM usuarios u
// //             JOIN personas p ON u.id_persona = p.id
// //             WHERE u.id_rol = 3 -- Asumiendo que 3 es el rol de secretaria
// //         `);

// //             res.render('admin/secretarias', {
// //                 secretarias,
// //                 page: 'secretarias' // Útil para marcar el active en el sidebar
// //             });
// //         } catch (error) {
// //             console.error("Error en listaSecretarias:", error);
// //             next(error);
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }
// //     // async guardarSecretaria(req, res) {
// //     //     let conn;
// //     //     try {
// //     //         const { nombre, apellido, dni, email, password, nacimiento } = req.body;
// //     //         conn = await createConnection();

// //     //         // 1. Validar Email
// //     //         const [existeEmail] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
// //     //         if (existeEmail.length > 0) {
// //     //             return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
// //     //         }

// //     //         // 2. Validar Persona/DNI
// //     //         const [existePersona] = await conn.query('SELECT id FROM personas WHERE dni = ?', [dni]);
// //     //         let personaId;

// //     //         if (existePersona.length > 0) {
// //     //             personaId = existePersona[0].id;
// //     //             const [tieneUser] = await conn.query('SELECT id FROM usuarios WHERE id_persona = ?', [personaId]);
// //     //             if (tieneUser.length > 0) {
// //     //                 return res.status(400).json({ error: 'Esta persona ya tiene un usuario asignado.' });
// //     //             }
// //     //         } else {
// //     //             const [nuevaP] = await conn.query(
// //     //                 'INSERT INTO personas (nombre, apellido, dni, nacimiento) VALUES (?, ?, ?, ?)',
// //     //                 [nombre, apellido, dni, nacimiento]
// //     //             );
// //     //             personaId = nuevaP.insertId;
// //     //         }

// //     //         // 3. Crear Usuario
// //     //         await conn.query(
// //     //             'INSERT INTO usuarios (id_persona, email, password, id_rol) VALUES (?, ?, ?, 3)',
// //     //             [personaId, email, password]
// //     //         );

// //     //         // ✅ RESPUESTA ÉXITO PARA FETCH
// //     //         res.json({ success: true });

// //     //     } catch (error) {
// //     //         console.error(error);
// //     //         res.status(500).json({ error: 'Error interno del servidor al guardar.' });
// //     //     } finally {
// //     //         if (conn) conn.end();
// //     //     }
// //     // }


// //     // Cargar el formulario de edición con los datos actuales
// //     async editarSecretariaForm(req, res, next) {
// //         let conn;
// //         try {
// //             const { id } = req.params;
// //             conn = await createConnection();
// //             const [rows] = await conn.query(`
// //             SELECT u.id, p.nombre, p.apellido, p.dni, p.nacimiento, u.email 
// //             FROM usuarios u 
// //             JOIN personas p ON u.id_persona = p.id 
// //             WHERE u.id = ?`, [id]);

// //             if (rows.length === 0) return res.redirect('/admin/secretarias');

// //             res.render('admin/editar_secretaria', { s: rows[0] });
// //         } catch (error) {
// //             next(error);
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }

// //     // Procesar la actualización
// //     // async actualizarSecretaria(req, res) {
// //     //     let conn;
// //     //     try {
// //     //         const { id } = req.params;
// //     //         const { nombre, apellido, email } = req.body;
// //     //         conn = await createConnection();

// //     //         // 1. Obtener id_persona
// //     //         const [user] = await conn.query('SELECT id_persona FROM usuarios WHERE id = ?', [id]);

// //     //         // 2. Actualizar Persona
// //     //         await conn.query('UPDATE personas SET nombre = ?, apellido = ? WHERE id = ?',
// //     //             [nombre, apellido, user[0].id_persona]);

// //     //         // 3. Actualizar Usuario
// //     //         await conn.query('UPDATE usuarios SET email = ? WHERE id = ?', [email, id]);

// //     //         res.json({ success: true });
// //     //     } catch (error) {
// //     //         res.status(500).json({ error: error.message });
// //     //     } finally {
// //     //         if (conn) conn.end();
// //     //     }
// //     // }

// //     //     async actualizarSecretaria(req, res) {
// //     //     let conn;
// //     //     try {
// //     //         const { id } = req.params;
// //     //         // Agregamos nacimiento aquí
// //     //         const { nombre, apellido, email, nacimiento } = req.body; 
// //     //         conn = await createConnection();

// //     //         const [user] = await conn.query('SELECT id_persona FROM usuarios WHERE id = ?', [id]);

// //     //         if (!user.length) return res.status(404).json({ error: "Usuario no encontrado" });

// //     //         // Actualizar Persona incluyendo nacimiento
// //     //         await conn.query(
// //     //             'UPDATE personas SET nombre = ?, apellido = ?, nacimiento = ? WHERE id = ?',
// //     //             [nombre, apellido, nacimiento, user[0].id_persona]
// //     //         );

// //     //         // Actualizar Usuario
// //     //         await conn.query('UPDATE usuarios SET email = ? WHERE id = ?', [email, id]);

// //     //         res.json({ success: true });
// //     //     } catch (error) {
// //     //         res.status(500).json({ error: error.message });
// //     //     } finally {
// //     //         if (conn) conn.end();
// //     //     }
// //     // }



// //     async guardarSecretaria(req, res) {
// //         let conn;
// //         try {
// //             const { nombre, apellido, dni, email, password, nacimiento } = req.body;
// //             conn = await createConnection();

// //             // 1. Validar Email
// //             const [existeEmail] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
// //             if (existeEmail.length > 0) {
// //                 return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
// //             }

// //             // --- HASHEAR CONTRASEÑA AQUÍ ---
// //             const salt = await bcrypt.genSalt(10);
// //             const passwordHash = await bcrypt.hash(password, salt);
// //             // -------------------------------

// //             // 2. Insertar Persona
// //             const [nuevaP] = await conn.query(
// //                 'INSERT INTO personas (nombre, apellido, dni, nacimiento) VALUES (?, ?, ?, ?)',
// //                 [nombre, apellido, dni, nacimiento]
// //             );
// //             const personaId = nuevaP.insertId;

// //             // 3. Crear Usuario con la contraseña hasheada
// //             await conn.query(
// //                 'INSERT INTO usuarios (id_persona, email, password, id_rol) VALUES (?, ?, ?, 3)',
// //                 [personaId, email, passwordHash]
// //             );

// //             res.json({ success: true });
// //         } catch (error) {
// //             console.error(error);
// //             res.status(500).json({ error: 'Error al guardar.' });
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }

// //     async actualizarSecretaria(req, res) {
// //         let conn;
// //         try {
// //             const { id } = req.params;
// //             const { nombre, apellido, email, nacimiento, password } = req.body;
// //             conn = await createConnection();

// //             const [user] = await conn.query('SELECT id_persona FROM usuarios WHERE id = ?', [id]);
// //             if (!user.length) return res.status(404).json({ error: "No encontrado" });

// //             // Actualizar Persona
// //             await conn.query(
// //                 'UPDATE personas SET nombre = ?, apellido = ?, nacimiento = ? WHERE id = ?',
// //                 [nombre, apellido, nacimiento, user[0].id_persona]
// //             );

// //             // Actualizar Usuario (Solo si cambió la contraseña)
// //             if (password && password.trim() !== "") {
// //                 const salt = await bcrypt.genSalt(10);
// //                 const passwordHash = await bcrypt.hash(password, salt);
// //                 await conn.query('UPDATE usuarios SET email = ?, password = ? WHERE id = ?', [email, passwordHash, id]);
// //             } else {
// //                 await conn.query('UPDATE usuarios SET email = ? WHERE id = ?', [email, id]);
// //             }

// //             res.json({ success: true });
// //         } catch (error) {
// //             res.status(500).json({ error: error.message });
// //         } finally {
// //             if (conn) conn.end();
// //         }
// //     }
// //     async actualizarPerfil(req, res) {
// //         const { nombre, apellido, email, password } = req.body;
// //         // const userId = req.session.user.id; // Obtenido de la sesión

// //         const usuario = req.session.user || req.session.usuario;

// //         if (!usuario) {
// //             console.log("Sesión no encontrada");
// //             return res.redirect('/auth/login');
// //         }

// //         const userId = usuario.id;

// //         try {
// //             let sqlUpdate = "UPDATE usuarios u JOIN personas p ON u.id_persona = p.id SET p.nombre = ?, p.apellido = ?, u.email = ?";
// //             let params = [nombre, apellido, email];

// //             if (password && password.trim() !== "") {
// //                 const salt = await bcrypt.genSalt(10);
// //                 const hashed = await bcrypt.hash(password, salt);
// //                 sqlUpdate += ", u.password = ?";
// //                 params.push(hashed);
// //             }

// //             sqlUpdate += " WHERE u.id = ?";
// //             params.push(userId);

// //             await conn.query(sqlUpdate, params);
// //             res.redirect('/?status=success');
// //         } catch (error) {
// //             res.redirect('/?status=error');
// //         }
// //     }


// // }

// // module.exports = new AdministracionController();



// const createConnection = require('../config/configDb');
// const Medico = require('../models/medicosModels');
// const bcrypt = require('bcryptjs');

// class AdministracionController {

//     // Renderiza la vista principal de gestión de bloqueos
//     async indexBloqueos(req, res, next) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const medicos = await Medico.listar();

//             const [ausencias] = await conn.query(`
//                 SELECT a.*, p.nombre, p.apellido 
//                 FROM AUSENCIAS a
//                 JOIN medicos m ON a.id_medico = m.id_medico
//                 JOIN personas p ON m.id_persona = p.id
//                 ORDER BY a.fecha_inicio DESC
//             `);

//             const [feriados] = await conn.query('SELECT * FROM FERIADOS ORDER BY fecha DESC');

//             res.render('admin/bloqueos', {
//                 medicos,
//                 ausencias,
//                 feriados,
//                 status: req.query.status || null
//             });
//         } catch (error) {
//             next(error);
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     async guardarAusencia(req, res) {
//         let conn;
//         try {
//             const { id_medico, fecha_inicio, fecha_fin, tipo, descripcion } = req.body;
//             conn = await createConnection();
//             await conn.query(`
//                 INSERT INTO AUSENCIAS (id_medico, fecha_inicio, fecha_fin, tipo, descripcion)
//                 VALUES (?, ?, ?, ?, ?)
//             `, [id_medico, fecha_inicio, fecha_fin, tipo, descripcion]);
//             res.redirect('/admin/bloqueos?status=ausencia_success');
//         } catch (error) {
//             res.redirect('/admin/bloqueos?status=error');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     async guardarFeriado(req, res) {
//         let conn;
//         try {
//             const { fecha, descripcion } = req.body;
//             conn = await createConnection();
//             await conn.query(`
//                 INSERT INTO FERIADOS (fecha, descripcion)
//                 VALUES (?, ?)
//             `, [fecha, descripcion]);
//             res.redirect('/admin/bloqueos?status=feriado_success');
//         } catch (error) {
//             res.redirect('/admin/bloqueos?status=error');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     async eliminarAusencia(req, res) {
//         let conn;
//         try {
//             conn = await createConnection();
//             await conn.query('DELETE FROM AUSENCIAS WHERE id = ?', [req.params.id]);
//             res.redirect('/admin/bloqueos?status=deleted');
//         } catch (error) {
//             res.redirect('/admin/bloqueos?status=error');
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     async listaSecretarias(req, res, next) {
//         let conn;
//         try {
//             conn = await createConnection();
//             const [secretarias] = await conn.query(`
//                 SELECT u.id, p.nombre, p.apellido, p.dni, p.nacimiento, u.email, u.id_rol
//                 FROM usuarios u
//                 JOIN personas p ON u.id_persona = p.id
//                 WHERE u.id_rol = 3
//             `);
//             res.render('admin/secretarias', { secretarias, page: 'secretarias' });
//         } catch (error) {
//             next(error);
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     async guardarSecretaria(req, res) {
//         let conn;
//         try {
//             const { nombre, apellido, dni, email, password, nacimiento } = req.body;
//             conn = await createConnection();

//             const [existeEmail] = await conn.query('SELECT id FROM usuarios WHERE email = ?', [email]);
//             if (existeEmail.length > 0) return res.status(400).json({ error: 'El correo ya existe.' });

//             const salt = await bcrypt.genSalt(10);
//             const passwordHash = await bcrypt.hash(password, salt);

//             const [nuevaP] = await conn.query(
//                 'INSERT INTO personas (nombre, apellido, dni, nacimiento) VALUES (?, ?, ?, ?)',
//                 [nombre, apellido, dni, nacimiento]
//             );
            
//             await conn.query(
//                 'INSERT INTO usuarios (id_persona, email, password, id_rol) VALUES (?, ?, ?, 3)',
//                 [nuevaP.insertId, email, passwordHash]
//             );

//             res.json({ success: true });
//         } catch (error) {
//             res.status(500).json({ error: 'Error al guardar.' });
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     async actualizarSecretaria(req, res) {
//         let conn;
//         try {
//             const { id } = req.params;
//             const { nombre, apellido, email, nacimiento, password } = req.body;
//             conn = await createConnection();

//             const [user] = await conn.query('SELECT id_persona FROM usuarios WHERE id = ?', [id]);
//             if (!user.length) return res.status(404).json({ error: "No encontrado" });

//             await conn.query(
//                 'UPDATE personas SET nombre = ?, apellido = ?, nacimiento = ? WHERE id = ?',
//                 [nombre, apellido, nacimiento, user[0].id_persona]
//             );

//             if (password && password.trim() !== "") {
//                 const salt = await bcrypt.genSalt(10);
//                 const passwordHash = await bcrypt.hash(password, salt);
//                 await conn.query('UPDATE usuarios SET email = ?, password = ? WHERE id = ?', [email, passwordHash, id]);
//             } else {
//                 await conn.query('UPDATE usuarios SET email = ? WHERE id = ?', [email, id]);
//             }

//             res.json({ success: true });
//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         } finally {
//             if (conn) conn.end();
//         }
//     }

//     // ACTUALIZAR PERFIL (Usa req.user por JWT)
//     async actualizarPerfil(req, res) {
//         let conn;
//         try {
//             const { nombre, apellido, email, password } = req.body;
            
//             // CAMBIO CLAVE: Usamos req.user (JWT) en lugar de session
//             const usuario = req.user; 

//             if (!usuario) return res.redirect('/auth/login');

//             conn = await createConnection();
//             let sqlUpdate = "UPDATE usuarios u JOIN personas p ON u.id_persona = p.id SET p.nombre = ?, p.apellido = ?, u.email = ?";
//             let params = [nombre, apellido, email];

//             if (password && password.trim() !== "") {
//                 const salt = await bcrypt.genSalt(10);
//                 const hashed = await bcrypt.hash(password, salt);
//                 sqlUpdate += ", u.password = ?";
//                 params.push(hashed);
//             }

//             sqlUpdate += " WHERE u.id = ?";
//             params.push(usuario.id);

//             await conn.query(sqlUpdate, params);
            
//             // Redirige al home con éxito
//             res.redirect('/?status=profile_updated');
//         } catch (error) {
//             console.error(error);
//             res.redirect('/?status=error');
//         } finally {
//             if (conn) conn.end();
//         }
//     }
// }

// module.exports = new AdministracionController();

const createConnection = require('../config/configDb');
const Medico = require('../models/medicosModels');
const bcrypt = require('bcryptjs');

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
            const [feriados] = await conn.query('SELECT * FROM FERIADOS ORDER BY fecha DESC');
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
}

module.exports = new AdministracionController();