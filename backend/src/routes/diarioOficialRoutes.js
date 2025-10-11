import express from 'express';
import diarioOficialController from '../controllers/diarioOficialController.js';

const router = express.Router();

router.post('/add', diarioOficialController.createDiarioOficial);

router.get('/', diarioOficialController.getDiarioOficial);
router.get('/byId/:id', diarioOficialController.getById);
router.get('/columns', diarioOficialController.getAvailableColumns);

router.put('/:id', diarioOficialController.update);

router.put('/deactivate/:id', diarioOficialController.deactivate);
router.put('/restore/:id', diarioOficialController.restore);

export default router;