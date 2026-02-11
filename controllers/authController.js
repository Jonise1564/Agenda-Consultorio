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


module.exports = new AuthController();

