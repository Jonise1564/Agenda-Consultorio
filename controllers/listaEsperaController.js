const ListaEspera = require('../models/listaEsperaModel');

class ListaEsperaController {

  // =========================
  // LISTAR
  // =========================
  async index(req, res, next) {
    try {
      const lista = await ListaEspera.listar();
      res.render('secretaria/listaEspera', { lista });
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // FORM CREAR
  // =========================
  async create(req, res, next) {
    try {
      res.render('secretaria/crearListaEspera');
    } catch (err) {
      next(err);
    }
  }

  // =========================
  // GUARDAR
  // =========================
  // async store(req, res, next) {
  //   try {
  //     const { id_paciente, id_medico, observaciones } = req.body;

  //     await ListaEspera.crear({
  //       id_paciente,
  //       id_medico,
  //       observaciones
  //     });

  //     // 🔁 POST → REDIRECT → GET
  //     res.redirect('/secretaria/listaEspera');

  //   } catch (err) {
  //     next(err);
  //   }
  // }
async store(req, res, next) {
  try {
    const { id_paciente, id_medico, id_especialidad, observaciones } = req.body;

    if (!id_paciente || !id_medico || !id_especialidad) {
      return res.status(400).send('Faltan datos obligatorios');
    }

    await ListaEspera.crear({
      id_paciente,
      id_medico,
      id_especialidad,
      observaciones
    });

    res.redirect('/secretaria/lista-espera');
  } catch (err) {
    next(err);
  }
}





  // =========================
  // ELIMINAR
  // =========================
  async eliminar(req, res, next) {
    try {
      await ListaEspera.eliminar(req.params.id);
      res.redirect('/secretaria/listaEspera');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ListaEsperaController();
