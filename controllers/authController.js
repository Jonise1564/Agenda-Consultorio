// // const createConnection = require('../config/configDb');
// // const bcrypt = require("bcryptjs");

// // class AuthController {
    
// //     static loginForm(req, res) {
// //         res.render("auth/login");
// //     }

// //     static async login(req, res) {
// //         const { email, password } = req.body;

// //         const conn = await createConnection();
// //         const [rows] = await conn.query("SELECT * FROM usuarios WHERE email = ? LIMIT 1", [email]);

// //         if (rows.length === 0)
// //             return res.render("auth/login", { error: "Usuario no encontrado" });

// //         const user = rows[0];

// //         const match = await bcrypt.compare(password, user.password);
// //         if (!match)
// //             return res.render("auth/login", { error: "Contraseña incorrecta" });

// //         // Guardar sesión
// //         req.session.user = {
// //             id: user.id,
// //             nombre: user.nombre,
// //             apellido: user.apellido,
// //             rol: user.id_rol
// //         };

// //         res.redirect("/");
// //     }

// //     static logout(req, res) {
// //         req.session.destroy();
// //         res.redirect("/login");
// //     }
// //     static loginForm(req, res) {
// //     res.render("auth/login");
// //     }
// // }

// // module.exports = AuthController;


// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels'); // Para crear la persona del paciente
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const usuario = await Usuario.buscarPorEmail(email);
//         if (!usuario) return res.render('auth/login', { error: 'Usuario no encontrado' });

//         const validPassword = await bcrypt.compare(password, usuario.password);
//         if (!validPassword) return res.render('auth/login', { error: 'Contraseña incorrecta' });

//         // Crear Token
//         const token = jwt.sign(
//             { id_usuario: usuario.id, id_rol: usuario.id_rol, id_persona: usuario.id_persona },
//             process.env.JWT_SECRET || 'tu_clave_secreta',
//             { expiresIn: '8h' }
//         );

//         // Guardar en Cookie segura
//         res.cookie('token_acceso', token, { httpOnly: true, secure: false }); // secure: true en producción

//         // Redirigir según rol
//         if (usuario.id_rol === 1) return res.redirect('/admin/dashboard');
//         if (usuario.id_rol === 2) return res.redirect('/secretaria/inicio');
//         return res.redirect('/paciente/mis-turnos');

//     } catch (err) {
//         res.render('auth/login', { error: 'Error en el servidor' });
//     }
// };

// exports.registroPaciente = async (req, res) => {
//     // 1. Crear la Persona primero, obtener id_persona
//     // 2. Hashear la password: const hash = await bcrypt.hash(req.body.password, 10);
//     // 3. Crear el Usuario con id_rol = 3
//     // 4. Redirigir al login
// };



// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // --- LOGIN ---
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const usuario = await Usuario.getByEmail(email);
        
//         if (!usuario) {
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Comparar contraseña hasheada
//         const esValida = await bcrypt.compare(password, usuario.password);
//         if (!esValida) {
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Generar JWT
//         const token = jwt.sign(
//             { 
//                 id_usuario: usuario.id, 
//                 id_rol: usuario.id_rol, 
//                 id_persona: usuario.id_persona 
//             },
//             process.env.JWT_SECRET || 'clave_secreta_provisoria',
//             { expiresIn: '1d' }
//         );

//         // Guardar en Cookie
//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             maxAge: 24 * 60 * 60 * 1000 // 1 día
//         });

//         // Redirigir según rol (1: Admin, 2: Sec, 3: Paciente)
//         const rutas = { 1: '/admin', 2: '/secretaria', 3: '/paciente/perfil' };
//         res.redirect(rutas[usuario.id_rol] || '/');

//     } catch (error) {
//         console.error(error);
//         res.render('auth/login', { error: 'Error interno del servidor' });
//     }
// };

// // --- REGISTRO DE PACIENTE ---
// exports.registroPaciente = async (req, res) => {
//     const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
//     try {
//         // 1. Crear la Persona (Asumo que tu Persona.create devuelve el insertId)
//         // Nota: Asegúrate que Persona.create maneje nombre, apellido, dni, nacimiento
//         const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
//         const id_persona = nuevaPersona.id;

//         // 2. Hashear la contraseña
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. Crear el Usuario vinculado a esa persona con rol 3 (Paciente)
//         await Usuario.create({
//             id_persona,
//             email,
//             password: hashedPassword,
//             id_rol: 3
//         });

//         res.render('auth/login', { success: 'Registro exitoso. Ya puede iniciar sesión.' });

//     } catch (error) {
//         console.error("Error en registro:", error);
//         res.render('auth/login', { error: 'Error al registrarse. El DNI o Email podrían ya existir.' });
//     }
// };

// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Usamos la misma clave que en app.js para evitar errores de validación
// const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// // --- LOGIN ---
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         // Buscamos al usuario (asegúrate que el modelo traiga el nombre de la tabla personas)
//         const usuario = await Usuario.getByEmail(email);
        
//         if (!usuario) {
//             console.log("Usuario no encontrado:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Comparar contraseña
//         // const esValida = await bcrypt.compare(password, usuario.password);


//         // CAMBIO TEMPORAL: Acepta la contraseña en texto plano o el hash
// const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
//         if (!esValida) {
//             console.log("Contraseña incorrecta para:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Generar JWT incluyendo el NOMBRE para la Navbar
//         const token = jwt.sign(
//             { 
//                 id_usuario: usuario.id, 
//                 id_rol: usuario.id_rol, 
//                 id_persona: usuario.id_persona,
//                 nombre: usuario.nombre || 'Usuario' // Esto permite que res.locals.usuario.nombre funcione
//             },
//             JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         // Guardar en Cookie
//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', // Solo true en producción con HTTPS
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000 // 1 día
//         });

//         // Redirigir según rol (1: Admin, 2: Sec, 3: Paciente)
//         // Nota: Asegúrate que tus rutas coincidan con estas (ej: /secretaria)
//         const rutas = { 
//             1: '/',           // El admin suele ir al inicio principal
//             2: '/secretaria', 
//             3: '/paciente/perfil' 
//         };

//         const destino = rutas[usuario.id_rol] || '/';
//         console.log(`Login exitoso: ${usuario.email}. Redirigiendo a ${destino}`);
//         res.redirect(destino);

//     } catch (error) {
//         console.error("Error en el proceso de Login:", error);
//         res.render('auth/login', { error: 'Error interno del servidor' });
//     }
// };

// // --- REGISTRO DE PACIENTE ---
// exports.registroPaciente = async (req, res) => {
//     const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
//     try {
//         // 1. Crear la Persona
//         const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
//         const id_persona = nuevaPersona.id || nuevaPersona.insertId;

//         // 2. Hashear la contraseña
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. Crear el Usuario (Rol 4 = Paciente)
//         await Usuario.create({
//             id_persona,
//             email,
//             password: hashedPassword,
//             id_rol: 4
//         });

//         res.render('auth/login', { success: 'Registro exitoso. Ya puede iniciar sesión.' });

//     } catch (error) {
//         console.error("Error en registro:", error);
//         res.render('auth/login', { error: 'Error al registrarse. El DNI o Email podrían ya existir.' });
//     }
// };



// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // Usamos la misma clave que en app.js para evitar errores de validación
// const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// // --- LOGIN ---
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         // Buscamos al usuario por email
//         const usuario = await Usuario.getByEmail(email);
        
//         if (!usuario) {
//             console.log("Usuario no encontrado:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Validación de contraseña (Texto plano para desarrollo o Bcrypt para producción)
//         const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
        
//         if (!esValida) {
//             console.log("Contraseña incorrecta para:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Generar JWT incluyendo el NOMBRE y ROL para la Navbar y Redirecciones
//         const token = jwt.sign(
//             { 
//                 id_usuario: usuario.id, 
//                 id_rol: usuario.id_rol, 
//                 id_persona: usuario.id_persona,
//                 nombre: usuario.nombre || 'Usuario' 
//             },
//             JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         // Guardar en Cookie
//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000 // 1 día
//         });

//         /**
//          * REDIRECCIÓN DINÁMICA SEGÚN TU TABLA DE ROLES:
//          * 1: Admin
//          * 2: Profesional
//          * 3: Secretaria
//          * 4: Paciente
//          */
//         const rutas = { 
//             1: '/',             // Admin al inicio
//             2: '/medicos',      
//             3: '/secretaria',   // Lucia entra aquí (Secretaria)
//             4: '/paciente'      // Pacientes a su área
//         };

//         const destino = rutas[usuario.id_rol] || '/';
        
//         console.log(`Model Usuario: buscando por email: ${email}`);
//         console.log(`Login exitoso: ${email}. Rol: ${usuario.id_rol}. Redirigiendo a ${destino}`);
        
//         res.redirect(destino);

//     } catch (error) {
//         console.error("Error en el proceso de Login:", error);
//         res.render('auth/login', { error: 'Error interno del servidor' });
//     }
// };

// // --- REGISTRO DE PACIENTE ---
// exports.registroPaciente = async (req, res) => {
//     const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
//     try {
//         // 1. Crear la Persona
//         const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
//         const id_persona = nuevaPersona.id || nuevaPersona.insertId;

//         // 2. Hashear la contraseña
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. Crear el Usuario (Rol 4 = Paciente según tu tabla)
//         await Usuario.create({
//             id_persona,
//             email,
//             password: hashedPassword,
//             id_rol: 4
//         });

//         res.render('auth/login', { success: 'Registro exitoso. Ya puede iniciar sesión.' });

//     } catch (error) {
//         console.error("Error en registro:", error);
//         res.render('auth/login', { error: 'Error al registrarse. El DNI o Email podrían ya existir.' });
//     }
// };

// // --- CERRAR SESIÓN ---
// exports.logout = (req, res) => {
//     res.clearCookie('token_acceso');
//     res.redirect('/auth/login');
// };


// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// // --- LOGIN ---
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const usuario = await Usuario.getByEmail(email);
        
//         if (!usuario) {
//             console.log("Usuario no encontrado:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
        
//         if (!esValida) {
//             console.log("Contraseña incorrecta para:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Generar JWT
//         const token = jwt.sign(
//             { 
//                 id: usuario.id, // Cambiado a 'id' para consistencia con los modelos
//                 id_rol: usuario.id_rol, 
//                 id_persona: usuario.id_persona,
//                 nombre: usuario.nombre || 'Usuario' 
//             },
//             JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000 
//         });

//         // =====================================================
//         // REDIRECCIÓN CENTRALIZADA
//         // Mandamos a todos a '/' para que app.js gestione el rol.
//         // Esto evita el error 404 de '/paciente'
//         // =====================================================
//         const destino = '/';
        
//         console.log(`Login exitoso: ${email}. Rol: ${usuario.id_rol}. Redirigiendo a ${destino}`);
//         res.redirect(destino);

//     } catch (error) {
//         console.error("Error en el proceso de Login:", error);
//         res.render('auth/login', { error: 'Error interno del servidor' });
//     }
// };

// // --- REGISTRO DE PACIENTE ---
// exports.registroPaciente = async (req, res) => {
//     const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
//     try {
//         const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
//         const id_persona = nuevaPersona.id || nuevaPersona.insertId;

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         await Usuario.create({
//             id_persona,
//             email,
//             password: hashedPassword,
//             id_rol: 4
//         });

//         res.render('auth/login', { success: 'Registro exitoso. Ya puede iniciar sesión.' });

//     } catch (error) {
//         console.error("Error en registro:", error);
//         res.render('auth/login', { error: 'Error al registrarse. El DNI o Email podrían ya existir.' });
//     }
// };

// // --- CERRAR SESIÓN ---
// exports.logout = (req, res) => {
//     res.clearCookie('token_acceso');
//     res.redirect('/auth/login');
// };

// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels');
// const Paciente = require('../models/pacientesModels'); // Importación necesaria
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// // --- LOGIN ---
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const usuario = await Usuario.getByEmail(email);
        
//         if (!usuario) {
//             console.log("Usuario no encontrado:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Verificación de password (soporta texto plano para desarrollo o hash para producción)
//         const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
        
//         if (!esValida) {
//             console.log("Contraseña incorrecta para:", email);
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         // Generar JWT
//         const token = jwt.sign(
//             { 
//                 id: usuario.id, 
//                 id_rol: usuario.id_rol, 
//                 id_persona: usuario.id_persona,
//                 nombre: usuario.nombre || 'Usuario' 
//             },
//             JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000 
//         });

//         const destino = '/';
//         console.log(`Login exitoso: ${email}. Rol: ${usuario.id_rol}. Redirigiendo a ${destino}`);
//         res.redirect(destino);

//     } catch (error) {
//         console.error("Error en el proceso de Login:", error);
//         res.render('auth/login', { error: 'Error interno del servidor' });
//     }
// };

// // --- REGISTRO DE PACIENTE (CORREGIDO Y COMPLETO) ---
// exports.registroPaciente = async (req, res) => {
//     const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
//     // Capturamos el nombre del archivo subido por Multer
//     const archivo_dni = req.file ? req.file.filename : null;

//     try {
//         // 1. CREAR PERSONA
//         const nuevaPersona = await Persona.create({ 
//             nombre, 
//             apellido, 
//             dni, 
//             nacimiento 
//         });
        
//         // Obtenemos el ID de la persona recién creada
//         const id_persona = nuevaPersona.id || nuevaPersona.insertId;

//         // 2. HASHEAR CONTRASEÑA
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. CREAR USUARIO
//         // Usamos id_rol: 3 o 4 según tu base de datos (generalmente 4 es paciente)
//         await Usuario.create({
//             id_persona,
//             email,
//             password: hashedPassword,
//             id_rol: 4
//         });

//         // 4. CREAR PACIENTE (El paso que faltaba)
//         // Vinculamos la persona a la tabla pacientes para que pueda sacar turnos
//         await Paciente.create({
//             id_persona,
//             id_obra_social: null, // Se registra como particular inicialmente
//             archivo_dni: archivo_dni,
//             nro_afiliado: null
//         });

//         // Respuesta de éxito
//         res.render('auth/login', { 
//             success: 'Registro exitoso. Ya puede iniciar sesión con su email y contraseña.' 
//         });

//     } catch (error) {
//         console.error("Error en el flujo de registro:", error);
//         res.render('auth/login', { 
//             error: 'Error al registrarse. Es posible que el DNI o Email ya se encuentren registrados.' 
//         });
//     }
// };

// // --- CERRAR SESIÓN ---
// exports.logout = (req, res) => {
//     res.clearCookie('token_acceso');
//     res.redirect('/auth/login');
// };


// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels');
// const Paciente = require('../models/pacientesModels');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// // --- LOGIN ---
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const usuario = await Usuario.getByEmail(email);
        
//         if (!usuario) {
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
        
//         if (!esValida) {
//             return res.render('auth/login', { error: 'Credenciales inválidas' });
//         }

//         const token = jwt.sign(
//             { 
//                 id: usuario.id, 
//                 id_rol: usuario.id_rol, 
//                 id_persona: usuario.id_persona,
//                 nombre: usuario.nombre || 'Usuario' 
//             },
//             JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000 
//         });

//         res.redirect('/');

//     } catch (error) {
//         console.error("Error en el proceso de Login:", error);
//         res.render('auth/login', { error: 'Error interno del servidor' });
//     }
// };

// // --- REGISTRO DE PACIENTE ---
// exports.registroPaciente = async (req, res) => {
//     const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
//     try {
//         // 1. CREAR PERSONA
//         const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
//         const id_persona = nuevaPersona.id || nuevaPersona.insertId;

//         // 2. HASHEAR CONTRASEÑA
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. CREAR USUARIO (Capturamos el ID generado)
//         const nuevoUsuario = await Usuario.create({
//             id_persona,
//             email,
//             password: hashedPassword,
//             id_rol: 4 // Asegúrate que el rol 4 sea "Paciente" en tu base de datos
//         });
//         const id_usuario = nuevoUsuario.id || nuevoUsuario.insertId;

//         // 4. CREAR PACIENTE (Relacionando Persona y Usuario)
//         // Según la estructura de tu tabla: id, id_persona, id_usuario, id_obra_social, estado
//         await Paciente.create({
//             id_persona: id_persona,
//             id_usuario: id_usuario,   // <--- Este era el dato faltante
//             id_obra_social: null,     // Particular por defecto
//             estado: 1                 // Activo por defecto
//         });

//         res.render('auth/login', { success: 'Registro exitoso. Ya puede iniciar sesión.' });

//     } catch (error) {
//         console.error("Error detallado en registro:", error);
//         res.render('auth/login', { 
//             error: 'Error al registrarse. Revise que el DNI o Email no existan ya.' 
//         });
//     }
// };

// // --- CERRAR SESIÓN ---
// exports.logout = (req, res) => {
//     res.clearCookie('token_acceso');
//     res.redirect('/auth/login');
// };



// const Usuario = require('../models/usuariosModels');
// const Persona = require('../models/personasModels');
// const Paciente = require('../models/pacientesModels');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';
// const JWT_SECRET = process.env.JWT_SECRET;

// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const usuario = await Usuario.getByEmail(email);
//         if (!usuario) return res.render('auth/login', { error: 'Credenciales inválidas' });

//         const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
//         if (!esValida) return res.render('auth/login', { error: 'Credenciales inválidas' });

//         const token = jwt.sign(
//             { id: usuario.id, id_rol: usuario.id_rol, id_persona: usuario.id_persona, nombre: usuario.nombre || 'Usuario' },
//             JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000 
//         });

//         res.redirect('/');
//     } catch (error) {
//         res.render('auth/login', { error: 'Error interno del servidor' });
//     }
// };

// // --- REGISTRO CON AUTO-LOGIN Y NOTIFICACIÓN ---
// exports.registroPaciente = async (req, res) => {
//     const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
//     try {
//         // 1. Crear Persona
//         const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
//         const id_persona = nuevaPersona.id || nuevaPersona.insertId;

//         // 2. Hashear Contraseña
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. Crear Usuario (Capturamos el ID para el Paciente)
//         const nuevoUsuario = await Usuario.create({
//             id_persona,
//             email,
//             password: hashedPassword,
//             id_rol: 4 // Cambia a 4 si tu rol de paciente es 4
//         });
//         const id_usuario = nuevoUsuario.id || nuevoUsuario.insertId;

//         // 4. Crear Paciente
//         await Paciente.create({
//             id_persona: id_persona,
//             id_usuario: id_usuario,
//             id_obra_social: null,
//             estado: 1
//         });

//         // =====================================================
//         // LOGICA DE AUTO-LOGIN (INGRESO DIRECTO)
//         // =====================================================
//         const token = jwt.sign(
//             { 
//                 id: id_usuario, 
//                 id_rol: 4, // El rol asignado arriba
//                 id_persona: id_persona,
//                 nombre: nombre 
//             },
//             JWT_SECRET,
//             { expiresIn: '1d' }
//         );

//         res.cookie('token_acceso', token, { 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'lax',
//             maxAge: 24 * 60 * 60 * 1000 
//         });

//         // Redirigir al inicio con un mensaje de éxito por query string
//         // Esto permite que el layout o la vista de inicio muestren un aviso tipo "¡Bienvenido!"
//         res.redirect('/?registro_exitoso=true');

//     } catch (error) {
//         console.error("Error en registro:", error);
//         res.render('auth/login', { 
//             error: 'Error al registrarse. El DNI o Email ya están en uso.' 
//         });
//     }
// };

// // --- CERRAR SESIÓN ---
// exports.logout = (req, res) => {
//     res.clearCookie('token_acceso');
//     res.redirect('/auth/login');
// };

const Usuario = require('../models/usuariosModels');
const Persona = require('../models/personasModels');
const Paciente = require('../models/pacientesModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

class AuthController {
    /**
     * Maneja el inicio de sesión de usuarios
     */
    login = async (req, res) => {
        const { email, password } = req.body;
        try {
            const usuario = await Usuario.getByEmail(email);
            if (!usuario) {
                return res.render('auth/login', { error: 'Credenciales inválidas' });
            }

            // Soporta comparación simple (si no está hasheada aún) o bcrypt
        // const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
            const esValida = await bcrypt.compare(password, usuario.password);
            if (!esValida) {
                return res.render('auth/login', { error: 'Credenciales inválidas' });
            }

            const token = this.#generarToken(usuario);
            this.#establecerCookie(res, token);

            return res.redirect('/');
        } catch (error) {
            console.error("Error en login:", error);
            return res.render('auth/login', { error: 'Error interno del servidor' });
        }
    }

    /**
     * Registro integral de Paciente (Persona + Usuario + Paciente) con Auto-login
     */
    registroPaciente = async (req, res) => {
        const { nombre, apellido, dni, nacimiento, email, password } = req.body;
        
        try {
            // 1. Crear registro en la tabla Persona
            const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
            const id_persona = nuevaPersona.id || nuevaPersona.insertId;

            // 2. Seguridad: Hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Crear el Usuario asociado
            const nuevoUsuario = await Usuario.create({
                id_persona,
                email,
                password: hashedPassword,
                id_rol: 4 // Rol de Paciente
            });
            const id_usuario = nuevoUsuario.id || nuevoUsuario.insertId;

            // 4. Crear el registro específico de Paciente
            await Paciente.create({
                id_persona,
                id_usuario,
                id_obra_social: null,
                estado: 1
            });

            // 5. Auto-login: Generar token con la info del nuevo usuario
            const token = this.#generarToken({ 
                id: id_usuario, 
                id_rol: 4, 
                id_persona, 
                nombre 
            });
            this.#establecerCookie(res, token);

            return res.redirect('/?registro_exitoso=true');

        } catch (error) {
            console.error("Error en registro:", error);
            return res.render('auth/login', { 
                error: 'Error al registrarse. El DNI o Email ya están en uso.' 
            });
        }
    }

    /**
     * Cierra la sesión eliminando la cookie
     */
    logout = (req, res) => {
        res.clearCookie('token_acceso');
        return res.redirect('/auth/login');
    }

    // --- MÉTODOS PRIVADOS DE APOYO ---

    #generarToken(usuario) {
        return jwt.sign(
            { 
                id: usuario.id, 
                id_rol: usuario.id_rol, 
                id_persona: usuario.id_persona, 
                nombre: usuario.nombre || 'Usuario' 
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
    }

    #establecerCookie(res, token) {
        res.cookie('token_acceso', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });
    }
}

// Exportamos una instancia única (Singleton)
module.exports = new AuthController();

