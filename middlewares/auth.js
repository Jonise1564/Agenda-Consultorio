
const jwt = require('jsonwebtoken');

/**
 * Función de orden superior que recibe los roles que SÍ pueden entrar a la ruta.
 * Ejemplo de uso: verificarAcceso([1, 2]) -> solo roles 1 y 2.
 */
const verificarAcceso = (rolesPermitidos) => {
    // Retorna la función middleware estándar de Express (req, res, next)
    return (req, res, next) => {
        
        // 1. EXTRACCIÓN: Intentamos obtener el token de las cookies del navegador.
        const token = req.cookies.token_acceso;

        // Si no hay token, el usuario ni siquiera ha iniciado sesión.
        if (!token) {
            return res.redirect('/auth/login');
        }

        try {
            // 2. VALIDACIÓN: Verificamos que el token sea auténtico y no haya expirado.
            // jwt.verify compara el token con nuestra "llave maestra" (secret).
            // const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            
            // Si todo está bien, guardamos los datos del usuario en el objeto 'req'.
            // Esto permite que las siguientes funciones (el controlador) sepan quién es el usuario.
            req.user = decoded; // Ejemplo: { id_usuario: 10, id_rol: 1, ... }

            // 3. AUTORIZACIÓN: ¿El rol guardado en el token está en la lista de permitidos?
            if (rolesPermitidos.includes(decoded.id_rol)) {
                // Si el rol es válido, next() le abre la puerta a la siguiente función.
                return next();
            }

            // Si el rol no está en la lista, el token es válido pero el usuario no tiene permiso.
            return res.status(403).render('errors/403', { mensaje: 'No tienes permiso' });

        } catch (err) {
            // 4. MANEJO DE ERRORES: Si jwt.verify falla (token manipulado, expirado o secreto incorrecto)
            
            // Limpiamos la cookie porque ya no sirve para evitar errores futuros.
            res.clearCookie('token_acceso');
            
            // Redirigimos al login para que el usuario vuelva a autenticarse.
            return res.redirect('/auth/login');
        }
    };
};

// Exportamos para usarlo en el archivo de rutas.
module.exports = { verificarAcceso };