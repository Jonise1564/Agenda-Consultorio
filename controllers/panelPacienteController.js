// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');

// class PanelPacienteController {

//     // 1. Dashboard principal del paciente
//     async getInicio(req, res, next) {
//         try {
//             // Verificamos que el middleware de auth haya inyectado al usuario
//             if (!res.locals.usuario) {
//                 return res.redirect('/auth/login');
//             }

//             // Obtenemos el ID del paciente vinculado al usuario logueado
//             const infoPaciente = await Paciente.getByUsuarioId(res.locals.usuario.id);
            
//             if (!infoPaciente) {
//                 return res.status(404).send("No se encontró perfil de paciente para este usuario.");
//             }

//             // Buscamos sus turnos (próximos e históricos)
//             const turnos = await Turno.getByPacienteId(infoPaciente.id);

//             // Renderizamos la vista ubicada en views/paciente/dashboard.pug
//             res.render('paciente/dashboard', {
//                 page: 'Mis Turnos',
//                 paciente: infoPaciente,
//                 turnos: turnos || []
//             });
//         } catch (error) {
//             console.error("Error en panelPacienteController:", error);
//             next(error); // Lo enviamos al manejador de errores de app.js
//         }
//     }

//     // 2. Vista de Perfil del paciente
//     async verPerfil(req, res, next) {
//         try {
//             const infoPaciente = await Paciente.getByUsuarioId(res.locals.usuario.id);
//             res.render('paciente/perfil', {
//                 page: 'Mi Perfil',
//                 paciente: infoPaciente
//             });
//         } catch (error) {
//             next(error);
//         }
//     }
// }


// module.exports = new PanelPacienteController();


// const Turno = require('../models/turnosModels');
// const Paciente = require('../models/pacientesModels');

// class PanelPacienteController {

//     // // 1. Dashboard principal del paciente
//     // async getInicio(req, res, next) {
//     //     try {
//     //         // El middleware 'verificarAcceso' ya inyectó el usuario en req.user
//     //         const usuarioLogueado = req.user || res.locals.usuario;

//     //         if (!usuarioLogueado) {
//     //             return res.redirect('/auth/login');
//     //         }

//     //         // Obtenemos el ID del paciente vinculado al usuario logueado
//     //         // Usamos usuarioLogueado.id (el ID del usuario en la DB)
//     //         const infoPaciente = await Paciente.getByUsuarioId(usuarioLogueado.id);
            
//     //         if (!infoPaciente) {
//     //             console.log("⚠️ No se encontró perfil de paciente para el usuario ID:", usuarioLogueado.id);
//     //             return res.status(404).send("No se encontró perfil de paciente vinculado a esta cuenta.");
//     //         }

//     //         // Buscamos sus turnos
//     //         const turnos = await Turno.getByPacienteId(infoPaciente.id);

//     //         // IMPORTANTE: 'paciente/dashboard' (singular) según tu estructura de carpetas
//     //         res.render('paciente/dashboard', {
//     //             page: 'Mis Turnos',
//     //             paciente: infoPaciente,
//     //             usuario: usuarioLogueado,
//     //             turnos: turnos || []
//     //         });
//     //     } catch (error) {
//     //         console.error("🔥 Error en panelPacienteController (getInicio):", error);
//     //         next(error); 
//     //     }
//     // }



//     async getInicio(req, res, next) {
//         try {
//             const usuarioLogueado = req.user || res.locals.usuario;
//             if (!usuarioLogueado) return res.redirect('/auth/login');

//             // 1. OJO AQUÍ: Asegúrate que el ID sea el correcto (id vs id_usuario)
//             const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
//             const infoPaciente = await Paciente.getByUsuarioId(idUsuario);
            
//             console.log("DEBUG: infoPaciente es:", infoPaciente); // Mira esto en la consola

//             if (!infoPaciente) {
//                 return res.status(404).send("No se encontró perfil de paciente.");
//             }

//             const turnos = await Turno.getByPacienteId(infoPaciente.id);
//             console.log("DEBUG: cantidad de turnos:", turnos ? turnos.length : 0);

//             res.render('paciente/dashboard', {
//                 page: 'Mis Turnos',
//                 paciente: infoPaciente,
//                 usuario: usuarioLogueado,
//                 turnos: turnos || []
//             });
//         } catch (error) {
//             console.error("🔥 Error en panelPacienteController (getInicio):", error);
//             next(error); 
//         }
//     }

//     // 2. Vista de Perfil del paciente
//     async verPerfil(req, res, next) {
//         try {
//             const usuarioLogueado = req.user || res.locals.usuario;
//             const infoPaciente = await Paciente.getByUsuarioId(usuarioLogueado.id);
            
//             // Renderizamos 'paciente/perfil' (singular)
//             res.render('paciente/perfil', {
//                 page: 'Mi Perfil',
//                 paciente: infoPaciente,
//                 usuario: usuarioLogueado
//             });
//         } catch (error) {
//             console.error("🔥 Error en panelPacienteController (verPerfil):", error);
//             next(error);
//         }
//     }
// }

// // Exportamos la instancia para el router
// module.exports = new PanelPacienteController();


const Turno = require('../models/turnosModels');
const Paciente = require('../models/pacientesModels');

class PanelPacienteController {

    // // 1. Dashboard principal del paciente
    // async getInicio(req, res, next) {
    //     try {
    //         // Recuperamos el usuario del token (req.user) o de res.locals
    //         const usuarioLogueado = req.user || res.locals.usuario;

    //         if (!usuarioLogueado) {
    //             return res.redirect('/auth/login');
    //         }

    //         // Usamos el ID del usuario para obtener los datos de la persona/paciente
    //         // Verificamos ambos posibles nombres de propiedad del token
    //         const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
    //         const infoPaciente = await Paciente.getByUsuarioId(idUsuario);
            
    //         if (!infoPaciente) {
    //             console.log("⚠️ No se encontró perfil de paciente para el usuario ID:", idUsuario);
    //             return res.status(404).send("No se encontró perfil de paciente vinculado a esta cuenta.");
    //         }

    //         // CLAVE: Según tu consola, el ID del paciente es 'id_paciente'
    //         const idParaTurnos = infoPaciente.id_paciente;
    //         const turnos = await Turno.getByPacienteId(idParaTurnos);

    //         // Renderizamos la vista enviando los datos exactos que el PUG necesita
    //         res.render('paciente/dashboard', {
    //             page: 'Mis Turnos',
    //             paciente: infoPaciente, // Contiene nombre, apellido, obra_social_nombre, etc.
    //             usuario: usuarioLogueado,
    //             turnos: turnos || []
    //         });

    //     } catch (error) {
    //         console.error("🔥 Error en panelPacienteController (getInicio):", error);
    //         next(error); 
    //     }
    // }





    async getInicio(req, res, next) {
    try {
        const usuarioLogueado = req.user || res.locals.usuario;
        const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
        const infoPaciente = await Paciente.getByUsuarioId(idUsuario);

        if (!infoPaciente) return res.status(404).send("Perfil no encontrado");

        const turnos = await Turno.getByPacienteId(infoPaciente.id_paciente);

        res.render('paciente/dashboard', {
            paciente: infoPaciente,
            turnos: turnos || []
        });
    } catch (error) {
        next(error);
    }
}
    // 2. Vista de Perfil del paciente
    async verPerfil(req, res, next) {
        try {
            const usuarioLogueado = req.user || res.locals.usuario;
            const idUsuario = usuarioLogueado.id || usuarioLogueado.id_usuario;
            const infoPaciente = await Paciente.getByUsuarioId(idUsuario);
            
            res.render('paciente/perfil', {
                page: 'Mi Perfil',
                paciente: infoPaciente,
                usuario: usuarioLogueado
            });
        } catch (error) {
            console.error("🔥 Error en panelPacienteController (verPerfil):", error);
            next(error);
        }
    }

    async confirmarReserva(req, res, next) {
    try {
        const { id_paciente, fecha, hora_inicio, id_agenda, motivo } = req.body;

        // 1. Validación de campos obligatorios (Igual que secretaria)
        if (!id_paciente || !fecha || !hora_inicio || !id_agenda) {
            return res.status(400).send("Error: Faltan datos obligatorios para agendar el turno.");
        }

        // 2. Validación de Fecha Pasada (Igual que secretaria)
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaSeleccionada = new Date(fecha + 'T00:00:00');

        if (fechaSeleccionada < hoy) {
            return res.status(400).send("No puedes solicitar turnos en fechas que ya pasaron.");
        }

        // 3. Ejecutar el agendado usando el modelo de Turnos
        // Reutilizamos 'agendarTurnoVirtual' que es el proceso completo en tu DB
        await Turno.agendarTurnoVirtual({
            fecha,
            hora_inicio,
            id_agenda,
            id_paciente,
            motivo: motivo || 'Turno solicitado desde el Panel del Paciente',
            archivo_dni: null // El paciente ya está registrado, no solemos pedirlo aquí
        });

        // 4. Redirigir al dashboard con aviso de éxito
        res.redirect('/pacientes/dashboard?status=success');

    } catch (error) {
        console.error("🔥 Error en panelPacienteController (confirmarReserva):", error);
        next(error);
    }
}



}

module.exports = new PanelPacienteController();