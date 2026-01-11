const ListaEspera = require('../models/listaEsperaModels');
const Medico = require('../models/medicosModels');
const Especialidad = require('../models/especialidadesModels');
const Paciente = require('../models/pacientesModels');

class ListaEsperaController {
    
    async index(req, res, next) {
        try {
            const espera = await ListaEspera.getPendientes();
            res.render('secretaria/lista_espera/index', { espera });
        } catch (error) { next(error); }
    }

    async create(req, res, next) {
        try {
            const { id_medico, id_especialidad, id_paciente } = req.query;

            const [medicos, especialidades, pacienteData] = await Promise.all([
                Medico.getProfesionalesParaAgendas(),
                typeof Especialidad.getAll === 'function' ? Especialidad.getAll() : Especialidad.listar(),
                id_paciente ? Paciente.getDatosCompletos(id_paciente) : null
            ]);
            
            res.render('secretaria/lista_espera/crear', { 
                medicos, 
                especialidades, 
                id_medico: id_medico || '',
                id_especialidad: id_especialidad || '',
                id_paciente: id_paciente || '',
                paciente: pacienteData 
            });
        } catch (error) { 
            console.error("Error en create ListaEspera:", error.message);
            next(error); 
        }
    }

    // ---  MÉTODO PARA VALIDACIÓN  ---
    async verificarDuplicado(req, res, next) {
        try {
            const { id_paciente, id_medico, id_especialidad } = req.query;

            if (!id_paciente || !id_medico || !id_especialidad) {
                return res.json({ existe: false });
            }

            // Usamos un método del modelo para buscar duplicados activos
            const existe = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
            
            res.json({ existe: !!existe });
        } catch (error) {
            console.error("Error al verificar duplicado:", error);
            res.status(500).json({ existe: false, error: error.message });
        }
    }

    async store(req, res, next) {
        try {
            const { id_paciente, id_medico, id_especialidad, prioridad, motivo_prioridad, observaciones } = req.body;

            if (!id_paciente || !id_medico || !id_especialidad) {
                return res.status(400).send("Error: Faltan datos obligatorios.");
            }

            // SEGURIDAD NIVEL SERVIDOR: Volver a verificar antes de insertar
            const duplicado = await ListaEspera.verificarSiExiste(id_paciente, id_medico, id_especialidad);
            if (duplicado) {
                return res.status(400).send("Error: El paciente ya tiene un registro activo en la lista de espera para este profesional.");
            }

            const data = {
                id_paciente,
                id_medico,
                id_especialidad,
                prioridad: prioridad || 'Media',
                motivo_prioridad: motivo_prioridad || null,
                observaciones: observaciones || null,
                id_usuario_creador: (req.session && req.session.id_usuario) ? req.session.id_usuario : 1
            };

            await ListaEspera.create(data);
            res.redirect('/secretaria/lista-espera');

        } catch (error) {
            console.error("Error al guardar en Lista de Espera:", error);
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            await ListaEspera.delete(id);
            res.redirect('/secretaria/lista-espera');
        } catch (error) { next(error); }
    }

    async actualizarEstado(req, res, next) {
        try {
            const { id } = req.params;
            const { nuevo_estado } = req.body;
            await ListaEspera.updateEstado(id, nuevo_estado);
            res.redirect('/secretaria/lista-espera');
        } catch (error) { next(error); }
    }
}

module.exports = new ListaEsperaController();