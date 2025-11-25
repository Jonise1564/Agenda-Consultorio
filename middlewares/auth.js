
function isLogged(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

function isAdmin(req, res, next) {
    if (!req.session.user || req.session.user.rol !== 1) {
        return res.status(403).send("Acceso denegado");
    }
    next();
}

module.exports = { isLogged, isAdmin };
