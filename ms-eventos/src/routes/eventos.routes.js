// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/eventos.controller');
const { verificarToken, requiereRol } = require('../middlewars/auth');

const router = Router();

router.use(verificarToken); //todas las rutas exigen token


router.get('/', controller.listar);      // listar todos los eventos
router.get('/:id', controller.obtener);  // obtener un evento por id
router.post('/', requiereRol('administrador'), controller.crear);      // crear un evento
router.put('/:id', requiereRol('administrador'), controller.actualizar); //actualizar un evento
router.delete('/:id', requiereRol('administrador'), controller.eliminar); //eliminar un evento


module.exports = router;
