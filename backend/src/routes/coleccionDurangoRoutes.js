import express from 'express';
import coleccionDurangoController from '../controllers/coleccionDurangoController.js';

const router = express.Router();

router.post('/add', coleccionDurangoController.createColeccionDurango);

router.get('/', coleccionDurangoController.getColeccionDurango);
router.get('/byId/:id', coleccionDurangoController.getById);
router.get('/columns', coleccionDurangoController.getAvailableColumns);

router.put('/:id', coleccionDurangoController.update);

router.put('/deactivate/:id', coleccionDurangoController.deactivate);
router.put('/restore/:id', coleccionDurangoController.restore);

export default router;