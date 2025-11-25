const createConnection = require('../config/configDb');
const bcrypt = require("bcryptjs");

class AuthController {
    
    static loginForm(req, res) {
        res.render("auth/login");
    }

    static async login(req, res) {
        const { email, password } = req.body;

        const conn = await createConnection();
        const [rows] = await conn.query("SELECT * FROM usuarios WHERE email = ? LIMIT 1", [email]);

        if (rows.length === 0)
            return res.render("auth/login", { error: "Usuario no encontrado" });

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.render("auth/login", { error: "Contraseña incorrecta" });

        // Guardar sesión
        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            rol: user.id_rol
        };

        res.redirect("/");
    }

    static logout(req, res) {
        req.session.destroy();
        res.redirect("/login");
    }
    static loginForm(req, res) {
    res.render("auth/login");
    }
}

module.exports = AuthController;
