import express from 'express';
import librosController from '../controllers/librosController.js';

const router = express.Router();

router.post('/add', librosController.createLibro);

router.get('/', librosController.getLibros);
router.get('/byId/:id', librosController.getById);
router.get('/columns', librosController.getAvailableColumns);

router.put('/:id', librosController.update);

router.put('/deactivate/:id', librosController.deactivate);
router.put('/restore/:id', librosController.restore);

export default router;