
// function isLogged(req, res, next) {
//     if (!req.session.user) {
//         return res.redirect("/login");
//     }
//     next();
// }

// function isAdmin(req, res, next) {
//     if (!req.session.user || req.session.user.rol !== 1) {
//         return res.status(403).send("Acceso denegado");
//     }
//     next();
// }

// module.exports = { isLogged, isAdmin };


// const jwt = require('jsonwebtoken');

// const verificarAcceso = (rolesPermitidos) => {
//     return (req, res, next) => {
//         const token = req.cookies.token_acceso;

//         if (!token) {
//             return res.redirect('/auth/login');
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
//             req.user = decoded; // Contiene id_usuario, id_rol, id_persona

//             if (rolesPermitidos.includes(decoded.id_rol)) {
//                 return next();
//             }
//             return res.status(403).render('errors/403', { mensaje: 'No tienes permiso' });
//         } catch (err) {
//             res.clearCookie('token_acceso');
//             return res.redirect('/auth/login');
//         }
//     };
// };

// module.exports = { verificarAcceso };


const jwt = require('jsonwebtoken');

const verificarAcceso = (rolesPermitidos) => {
    return (req, res, next) => {
        const token = req.cookies.token_acceso;

        if (!token) {
            return res.redirect('/auth/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
            req.user = decoded; // Contiene id_usuario, id_rol, id_persona

            if (rolesPermitidos.includes(decoded.id_rol)) {
                return next();
            }
            return res.status(403).render('errors/403', { mensaje: 'No tienes permiso' });
        } catch (err) {
            res.clearCookie('token_acceso');
            return res.redirect('/auth/login');
        }
    };
};

module.exports = { verificarAcceso };