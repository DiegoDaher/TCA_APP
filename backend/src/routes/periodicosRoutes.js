import express from 'express';
import periodicosController from '../controllers/periodicosController.js';

const router = express.Router();

router.post('/add', periodicosController.createPeriodicos);

router.get('/', periodicosController.getPeriodicos);
router.get('/byId/:id', periodicosController.getById);
router.get('/columns', periodicosController.getAvailableColumns);

router.put('/:id', periodicosController.update);

router.put('/:id/deactivate', periodicosController.deactivate);
router.put('/:id/restore', periodicosController.restore);

export default router;