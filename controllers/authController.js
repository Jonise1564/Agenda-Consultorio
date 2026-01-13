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

const Usuario = require('../models/usuariosModels');
const Persona = require('../models/personasModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usamos la misma clave que en app.js para evitar errores de validación
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// --- LOGIN ---
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscamos al usuario (asegúrate que el modelo traiga el nombre de la tabla personas)
        const usuario = await Usuario.getByEmail(email);
        
        if (!usuario) {
            console.log("Usuario no encontrado:", email);
            return res.render('auth/login', { error: 'Credenciales inválidas' });
        }

        // Comparar contraseña
        // const esValida = await bcrypt.compare(password, usuario.password);


        // CAMBIO TEMPORAL: Acepta la contraseña en texto plano o el hash
const esValida = (password === usuario.password) || await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            console.log("Contraseña incorrecta para:", email);
            return res.render('auth/login', { error: 'Credenciales inválidas' });
        }

        // Generar JWT incluyendo el NOMBRE para la Navbar
        const token = jwt.sign(
            { 
                id_usuario: usuario.id, 
                id_rol: usuario.id_rol, 
                id_persona: usuario.id_persona,
                nombre: usuario.nombre || 'Usuario' // Esto permite que res.locals.usuario.nombre funcione
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Guardar en Cookie
        res.cookie('token_acceso', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // Solo true en producción con HTTPS
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 día
        });

        // Redirigir según rol (1: Admin, 2: Sec, 3: Paciente)
        // Nota: Asegúrate que tus rutas coincidan con estas (ej: /secretaria)
        const rutas = { 
            1: '/',           // El admin suele ir al inicio principal
            2: '/secretaria', 
            3: '/paciente/perfil' 
        };

        const destino = rutas[usuario.id_rol] || '/';
        console.log(`Login exitoso: ${usuario.email}. Redirigiendo a ${destino}`);
        res.redirect(destino);

    } catch (error) {
        console.error("Error en el proceso de Login:", error);
        res.render('auth/login', { error: 'Error interno del servidor' });
    }
};

// --- REGISTRO DE PACIENTE ---
exports.registroPaciente = async (req, res) => {
    const { nombre, apellido, dni, nacimiento, email, password } = req.body;
    
    try {
        // 1. Crear la Persona
        const nuevaPersona = await Persona.create({ nombre, apellido, dni, nacimiento });
        const id_persona = nuevaPersona.id || nuevaPersona.insertId;

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Crear el Usuario (Rol 4 = Paciente)
        await Usuario.create({
            id_persona,
            email,
            password: hashedPassword,
            id_rol: 4
        });

        res.render('auth/login', { success: 'Registro exitoso. Ya puede iniciar sesión.' });

    } catch (error) {
        console.error("Error en registro:", error);
        res.render('auth/login', { error: 'Error al registrarse. El DNI o Email podrían ya existir.' });
    }
};