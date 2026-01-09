// // const express = require('express');
// // const router = express.Router();
// // const controller = require('../controllers/listaEsperaController');

// // router.get('/', controller.index);
// // router.post('/', controller.store);
// // router.post('/eliminar/:id', controller.eliminar);

// // module.exports = router;



// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/listaEsperaController');

// router.get('/', controller.index);
// router.get('/create', controller.create);
// router.post('/', controller.store);
// router.post('/delete/:id', controller.eliminar);

// module.exports = router;


const express = require('express');
const router = express.Router();
const ListaEsperaController = require('../controllers/listaEsperaController');

// LISTAR
router.get('/', ListaEsperaController.index);

// FORM CREAR
router.get('/create', ListaEsperaController.create);

// GUARDAR
router.post('/', ListaEsperaController.store);

// ELIMINAR
router.post('/delete/:id', ListaEsperaController.eliminar);

module.exports = router;
