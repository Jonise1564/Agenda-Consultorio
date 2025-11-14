// const Paciente = require('../models/pacientesModels')// Modelo de médicos
// const Persona = require('../models/personasModels')// Modelo de Personas
// const Usuario = require('../models/usuariosModels')// Modelo de Usuarios


// const { validatePacientes, validatePartialPacientes } = require('../schemas/validation')
// const { obtenerFechaFormateada } = require('../utils/dateFormatter');

// class PacientesController {

//     //Mostrar todas los medicos
//     async get(req, res, next) {
//         console.log('Controller: Get All pacientes');
//         try {
//             const pacientes = await Paciente.getAll();
//             const pacientesConFechaFormateada = pacientes.map(paciente => {
//                 const fechaFormateada = obtenerFechaFormateada(new Date(paciente.nacimiento));
//                 return { ...paciente, nacimiento: fechaFormateada };
//             });

//             const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;

//             let mensaje = null;
//             if (nombreInactivo) {
//                 mensaje = 'Se ha dado de Baja a un Paciente';
//             } else if (nombreActivo) {
//                 mensaje = 'Paciente ha dado de Alta a un Paciente';
//             } else if (nombreUpdate) {
//                 mensaje = 'Paciente Actualizado correctamente';
//             } else if (nombreStore) {
//                 mensaje = 'Paciente Creado correctamente';
//             }
//             res.render('pacientes/index', { pacientes: pacientesConFechaFormateada, mensaje });
//         } catch (error) {
//             console.error('Error al obtener pacientes desde el controlador:', error);
//             next(error);
//         }
//     }
//     // Mostrar Obras sociales
//     async getCreateForm(req, res, next) {
//         console.log('Controller: Obras Sociales get');
//         try {
//             const obra_sociales = await Paciente.getAllOS();
//             if (obra_sociales) {
//                 console.log('obra_sociales enviadas al formulario');
//                 res.render('pacientes/crear', { obra_sociales });
//             } else {
//                 res.status(404).json({ message: 'Error al cargar las obra_sociales al formulario crear' });
//             }
//         } catch (error) {
//             console.error('Error al obtener obra_sociales:', error);
//             next(error);
//         }
//     }
//     //Muestra la vista vista crear
//     create(req, res) {
//         res.render('pacientes/crear')
//     }
//     //Inserta en la tabla paciente
//     async store(req, res, next) {
//         console.log('Controller: Create paciente');
//         try {
//             // Extraer datos del formulario
//             const { dni, nombre, apellido, nacimiento: fechaNacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
//             const { nombreStore } = req.query;

//             // Validar datos
//             const dateNacimiento = new Date(fechaNacimiento)
//             const result = validatePacientes({ dni, nombre, apellido, fechaNacimiento: dateNacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales });
//             if (!result.success) {
//                 console.log('Error al validar datos');
//                 return res.status(422).json({ error: result.error.issues });
//             } else { console.log('Datos Validados...'); }
//             //le paso datos validados y parseados
//             const { dni: dniNumero, fechaNacimiento: nacimientoDate, id_rol: rolId, estado: estadoId, telefonos: telefonoNumero, obra_sociales: obrasociales } = result.data;
//             // Validar que las contraseñas coincidan
//             if (password !== repeatPassword) {
//                 return res.status(400).json({ error: 'Las contraseñas no coinciden' });
//             }
//             // Eliminar el dominio del email
//             const emailSinDominio = email.split('@')[0];
//             // Convertir la fecha de nacimiento al formato YYYY-MM-DD
//             const nacimientoFinal = nacimientoDate.toISOString().split('T')[0];


//             // Verificar si el DNI ya existe en la tabla personas
//             const existingPersona = await Persona.getById({ dni: dniNumero });
//             if (existingPersona) {
//                 return res.status(409).json({ message: 'Controller Paciente: Ya existe una persona con ese dni' });
//             }
//             // Crear Persona
//             const personaCreada = await Persona.create({
//                 //datos ya validados.
//                 dni: dniNumero,
//                 nombre,
//                 apellido,
//                 nacimiento: nacimientoFinal,
//             });
//             //ESTOS MENSAJES DEBERIAN SALIR EN EL FORmULARIO QUE NO LLEVE A otrA PARTE
//             if (!personaCreada) {
//                 return res.status(500).json({ message: 'Controller Paciente: Error al crear la persona' });
//             }

//             // Crear Usuario
//             console.log('Controller: Crear usuario')
//             const usuarioCreado = await Usuario.create({
//                 dni: dniNumero, // Usar el dni heredado de Persona
//                 email: emailSinDominio,
//                 password,
//                 id_rol: rolId
//             });
//             console.log('Controller Paciente: insertado usuario', usuarioCreado)
//             if (!usuarioCreado) {
//                 return res.status(500).json({ message: 'Error al crear el usuario' });
//             }

//             //traigo el id del usuario creado
//             const { id } = usuarioCreado;

//             // Crear Paciente
//             const pacienteCreado = await Paciente.create({
//                 dni: dniNumero,
//                 id_usuario: id,
//                 estado: estadoId,
//                 telefonos: telefonoNumero,
//                 obra_sociales
//             });

//             if (pacienteCreado) {
//                 console.log('Controller: Paciente insertado con éxito');
//                 res.redirect(`/pacientes?nombreStore=${nombreStore}`);
//             } else {
//                 res.status(404).json({ message: 'Controller Paciente: Error al crear el paciente' });
//             }
//         } catch (error) {
//             console.error('Error al crear paciente desde el controlador Paciente:', error);
//             next(error);
//         }
//     }
//     //editar (vista)
//     async edit(req, res, next) {
//         try {
//             const { dni } = req.params;

//             console.log(`Controller: edit, Buscando paciente por DNI: ${dni}`);

//             //Obtengo las datos de la obra social perteneciente a un dni paciente
//             const obra_social = await Paciente.getObraSocialByDni(dni)
//             if (!obra_social || obra_social.length === 0) {
//                 console.log('Controller Paciente: obra social no encontrada');
//                 return res.status(404).send('Obra social no encontrada');
//             }
//             console.log('Controller Paciente: obrasocial encontrada:', obra_social);

//             // Dividir las especialidades y matrículas en arrays
//             //Obtengo Todos datos de la obra social disponibles
//             const allObrasSociales = await Paciente.getAllOS()
//             if (!allObrasSociales) {
//                 console.log('Controller Paciente: las obras sociales no fueron encontradas');
//                 return res.status(404).send('Obras sociales no encontradas');
//             }
//             console.log('Controller Paciente: obras sociales encontradas:', allObrasSociales);

//             const obras_sociales = allObrasSociales[0].nombre.split(', ');
//             console.log('---OBRAS SOCIALES', obras_sociales)

//             // Obtengo los datos Persona
//             const persona = await Persona.getByDni(dni);
//             if (!persona) {
//                 console.log('Controller Paciente: Persona no encontrada');
//                 return res.status(404).send('Persona no encontrada');
//             }
//             console.log('Controller Paciente: Persona encontrada:', persona);

//             // Obtengo los datos de usuario y telefonos
//             const { usuario, telefonos } = await Usuario.getByDni(dni);
//             if (!usuario) {
//                 console.log('Controller Paciente: Usuario no encontrado');
//                 return res.status(404).send('Usuario no encontrado');
//             }
//             console.log('Controller Paciente: USUARIO encontrado:', usuario);
//             console.log('Controller Paciente: Teléfonos encontrados:', telefonos);

//             // Obtengo los datos del Medico
//             const paciente = await Paciente.getPacienteByDni(dni);
//             if (!paciente) {
//                 console.log('Controller Pacientes: paciente no encontrado');
//                 return res.status(404).send('Controller: paciente no encontrado');
//             }
//             console.log('Controller Pacientes: paciente encontrado:', paciente);

//             // Verificar y mostrar el estado del paciente
//             const { estado } = paciente;
//             console.log('estado paciente antes:', estado);

//             console.log('Enviando a la vista editar...');

//             res.render('pacientes/editar', { persona, usuario, paciente, obra_social, allObrasSociales, telefonos });
//         } catch (error) {
//             console.error('Error los datos', error);
//             next(error);
//         }
//     }
//     // editar
//     async update(req, res, next) {
//         console.log('Controller: Update paciente');
//         try {
//             const { dni } = req.params;
//             const { nombre, apellido, nacimiento: fechaNacimiento, email, password, telefonoAlternativo, obras_sociales } = req.body;
//             const nombreUpdate = nombre;

//             // Validar datos
//             const dateNacimiento = new Date(fechaNacimiento);
//             const segundotelefono = parseInt(telefonoAlternativo)
//             const result = validatePartialPacientes({ nombre, apellido, fechaNacimiento: dateNacimiento, email, password, telefono_alternativo: segundotelefono, obras_sociales });

//             if (!result.success) {
//                 console.log('Error al validar datos');
//                 return res.status(400).json({ error: JSON.parse(result.error.message) });
//             } else {
//                 console.log('Datos Validados...');
//             }

//             // Extraer datos validados y parseados
//             const { fechaNacimiento: nacimientoDate, telefonoAlternativo: telefonosegundo } = result.data;

//             // Eliminar el dominio del email
//             const emailSinDominio = email.split('@')[0];

//             // Convertir la fecha de nacimiento al formato YYYY-MM-DD
//             const nacimientoFinal = nacimientoDate.toISOString().split('T')[0];

//             // Actualizar persona
//             console.log('Controller Medico: Update persona');
//             const updateP = { nombre, apellido, nacimiento: nacimientoFinal };
//             const updatedPersona = await Persona.updatePersona(dni, updateP);
//             if (!updatedPersona) {
//                 return res.status(404).json({ message: 'Error al modificar la persona desde MedicoController' });
//             }

//             // Actualizar usuario
//             console.log('Controller Medico: Update usuario');
//             const updateU = { email: emailSinDominio, password };
//             const updatedUsuario = await Usuario.updateUsuario(dni, updateU);
//             console.log('Resultado de updateUsuario:', updatedUsuario);
//             if (!updatedUsuario) {
//                 return res.status(404).json({ message: 'Error al modificar el usuario desde MedicoController' });
//             }

//             // Actualizar obra_social paciente SI SELECCIONO UN CAMBIO
//             if (obras_sociales || obras_sociales !== "") {
//                 console.log('Controller Paciente: Update paciente obrasocial:', obras_sociales);
//                 const updatePa = { id_obra_social: obras_sociales };
//                 const updatedPaciente = await Paciente.updatePaciente(dni, updatePa);
//                 console.log('Resultado de updatePaciente:', updatedPaciente);
//                 if (!updatedPaciente) {
//                     return res.status(404).json({ message: 'Error al modificar el paciente desde PacienteController' });
//                 }
//             }

//             // Obtengo los datos de usuario y telefonos
//             const { usuario } = await Usuario.getByDni(dni);
//             if (!usuario) {
//                 console.log('Controller Paciente: Usuario no encontrado');
//                 return res.status(404).send('Usuario no encontrado');
//             }
//             console.log('Controller Paciente: USUARIO encontrado:', usuario);
//             const { id } = usuario
//             // Guardar el teléfono alternativo si se proporciona
//             if (telefonoAlternativo) {
//                 const addTA = await Usuario.addTelefonoAlternativo(id, segundotelefono);
//                 if (!addTA) { return res.status(404).send('Error al tratar de guardar telefono alternativo') }
//                 console.log('Teléfono alternativo guardado:', segundotelefono);
//             } else { console.log('No hay Teléfono alternativo') }

//             // Verificar y redirigir
//             console.log('Nombre Update:', nombreUpdate);
//             if (!nombreUpdate) {
//                 return res.redirect('/pacientes');
//             }
//             res.redirect(`/pacientes?nombreUpdate=${nombreUpdate}`);
//         } catch (error) {
//             next(error);
//         }
//     }
//     // Delete logico (activar/inactivar), si pide un delete, se debe borrar atravez de las tablas de forma permanente
//     // Inactivate
//     async inactivar(req, res, next) {
//         console.log('Controller: Inactivar Paciente');
//         try {
//             let flag = false
//             const { dni } = req.params; // Asegúrate de que req.params.dni esté definido correctamente
//             console.log('dni', dni);

//             const result = await Paciente.inactivarPaciente(dni);
//             if (!result) {
//                 return res.status(404).json({ message: 'Error al inactivar el paciente desde pacienteController' });
//             }
//             flag = true
//             res.redirect(`/pacientes?nombreInactivo=${flag}`);
//         } catch (error) {
//             next(error);
//         }
//     }
//     // Activate
//     async activar(req, res, next) {
//         console.log('Controller: activar Paciente');
//         try {
//             let flag = false
//             const { dni } = req.params; // Asegúrate de que req.params.dni esté definido correctamente
//             console.log('dni', dni);

//             const result = await Paciente.activarPaciente(dni);
//             if (!result) {
//                 return res.status(404).json({ message: 'Error al activar el paciente desde PacienteController' });
//             }
//             flag = true
//             res.redirect(`/pacientes?nombreActivo=${flag}`);
//         } catch (error) {
//             next(error);
//         }
//     }
// }

// module.exports = new PacientesController()


// Versión corregida y optimizada del PacientesController
// Incluye validaciones correctas, manejo adecuado de obras sociales,
// corrección de errores lógicos, nombres coherentes y limpieza general.

const Paciente = require('../models/pacientesModels');
const Persona = require('../models/personasModels');
const Usuario = require('../models/usuariosModels');

const { validatePacientes, validatePartialPacientes } = require('../schemas/validation');
const { obtenerFechaFormateada } = require('../utils/dateFormatter');

class PacientesController {
    // Get all pacientes
    async get(req, res, next) {
        console.log('Controller: Get All pacientes');
        try {
            const pacientes = await Paciente.getAll();
            const pacientesConFechaFormateada = pacientes.map(p => ({
                ...p,
                nacimiento: obtenerFechaFormateada(new Date(p.nacimiento))
            }));

            const { nombreUpdate, nombreStore, nombreActivo, nombreInactivo } = req.query;

            let mensaje = null;
            if (nombreInactivo) mensaje = 'Se ha dado de Baja a un Paciente';
            else if (nombreActivo) mensaje = 'Se ha dado de Alta a un Paciente';
            else if (nombreUpdate) mensaje = 'Paciente Actualizado correctamente';
            else if (nombreStore) mensaje = 'Paciente Creado correctamente';

            res.render('pacientes/index', { pacientes: pacientesConFechaFormateada, mensaje });
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            next(error);
        }
    }

    // Form crear paciente
    async getCreateForm(req, res, next) {
        try {
            const obrasSociales = await Paciente.getAllOS();
            res.render('pacientes/crear', { obrasSociales });
        } catch (error) {
            console.error('Error al cargar obras sociales:', error);
            next(error);
        }
    }

    create(req, res) {
        res.render('pacientes/crear');
    }

    // Crear paciente
    async store(req, res, next) {
        console.log('Controller: Create paciente');
        try {
            const { dni, nombre, apellido, nacimiento, email, password, repeatPassword, id_rol, estado, telefonos, obra_sociales } = req.body;
            const { nombreStore } = req.query;

            if (password !== repeatPassword)
                return res.status(400).json({ error: 'Las contraseñas no coinciden' });

            const result = validatePacientes({
                dni,
                nombre,
                apellido,
                fechaNacimiento: new Date(nacimiento),
                email,
                password,
                id_rol,
                estado,
                telefonos,
                obra_sociales
            });

            if (!result.success)
                return res.status(422).json({ error: result.error.issues });

            const data = result.data;

            // Verificar si existe persona
            const existePersona = await Persona.getById({ dni: data.dni });
            if (existePersona)
                return res.status(409).json({ message: 'Ya existe una persona con ese DNI' });

            // Crear persona
            const persona = await Persona.create({
                dni: data.dni,
                nombre,
                apellido,
                nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
            });
            if (!persona) throw new Error('Error al crear Persona');

            // Crear usuario
            const usuario = await Usuario.create({
                dni: data.dni,
                email,
                password,
                id_rol: data.id_rol
            });
            if (!usuario) throw new Error('Error al crear Usuario');

            // Crear paciente
            const paciente = await Paciente.create({
                dni: data.dni,
                id_usuario: usuario.id,
                estado: data.estado,
                telefonos: data.telefonos,
                obra_sociales: data.obra_sociales
            });
            if (!paciente) throw new Error('Error al crear Paciente');

            res.redirect(`/pacientes?nombreStore=${nombreStore}`);
        } catch (error) {
            console.error('Error al crear paciente:', error);
            next(error);
        }
    }

    // Editar paciente (vista)
    async edit(req, res, next) {
        try {
            const { dni } = req.params;

            const obraSocialActual = await Paciente.getObraSocialByDni(dni);
            const todasObras = await Paciente.getAllOS();
            const persona = await Persona.getByDni(dni);
            const { usuario, telefonos } = await Usuario.getByDni(dni);
            const paciente = await Paciente.getPacienteByDni(dni);

            if (!persona || !usuario || !paciente)
                return res.status(404).send('Paciente no encontrado');

            res.render('pacientes/editar', {
                persona,
                usuario,
                paciente,
                obra_social: obraSocialActual,
                obrasSociales: todasObras,
                telefonos
            });
        } catch (error) {
            console.error('Error cargando edición:', error);
            next(error);
        }
    }

    // Actualizar paciente
    async update(req, res, next) {
        console.log('Controller: Update paciente');
        try {
            const { dni } = req.params;
            const { nombre, apellido, nacimiento, email, password, telefonoAlternativo, obras_sociales } = req.body;

            const result = validatePartialPacientes({
                nombre,
                apellido,
                fechaNacimiento: new Date(nacimiento),
                email,
                password,
                telefonoAlternativo: telefonoAlternativo ? parseInt(telefonoAlternativo) : null,
                obras_sociales
            });

            if (!result.success)
                return res.status(400).json({ error: JSON.parse(result.error.message) });

            const data = result.data;

            // Actualizar persona
            await Persona.updatePersona(dni, {
                nombre,
                apellido,
                nacimiento: data.fechaNacimiento.toISOString().split('T')[0]
            });

            // Actualizar usuario
            await Usuario.updateUsuario(dni, {
                email: email,
                password
            });

            // Actualizar obra social
            if (data.obras_sociales) {
                await Paciente.updatePaciente(dni, {
                    id_obra_social: data.obras_sociales
                });
            }

            // Guardar teléfono alternativo
            const { usuario } = await Usuario.getByDni(dni);
            if (telefonoAlternativo) {
                await Usuario.addTelefonoAlternativo(usuario.id, parseInt(telefonoAlternativo));
            }

            res.redirect(`/pacientes?nombreUpdate=${nombre}`);
        } catch (error) {
            next(error);
        }
    }

    // Inactivar paciente
    async inactivar(req, res, next) {
        try {
            const { dni } = req.params;
            await Paciente.inactivarPaciente(dni);
            res.redirect(`/pacientes?nombreInactivo=true`);
        } catch (error) {
            next(error);
        }
    }

    // Activar paciente
    async activar(req, res, next) {
        try {
            const { dni } = req.params;
            await Paciente.activarPaciente(dni);
            res.redirect(`/pacientes?nombreActivo=true`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PacientesController();