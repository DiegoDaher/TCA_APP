import express from 'express';
import auditoriasController from '../controllers/auditoriasController.js';

const router = express.Router();

// ============================================
// RUTAS PARA AUDITORIA_REGISTROS
// ============================================

/**
 * @route   GET /api/auditoria-registros
 * @desc    Obtener todos los registros de auditoría con paginación y filtros
 * @query   page, limit, tabla_afectada, usuario, fecha_desde, fecha_hasta
 */
router.get('/registros', auditoriasController.getAuditoriaRegistros);

/**
 * @route   GET /api/auditoria-registros/:id
 * @desc    Obtener un registro de auditoría por ID
 * @param   id
 */
router.get('/registros/:id', auditoriasController.getAuditoriaRegistroById);

/**
 * @route   GET /api/auditoria-registros/:id/consultar
 * @desc    Consultar el registro original asociado a una auditoría
 * @param   id
 */
router.get('/registros/:id/consultar', auditoriasController.consultarRegistroAuditado);

// ============================================
// RUTAS PARA AUDITORIA_ELIMINADOS
// ============================================

/**
 * @route   GET /api/auditoria-eliminados
 * @desc    Obtener todos los registros eliminados de auditoría con paginación y filtros
 * @query   page, limit, tabla_afectada, usuario, fecha_desde, fecha_hasta
 */
router.get('/eliminados', auditoriasController.getAuditoriaEliminados);

/**
 * @route   GET /api/auditoria-eliminados/:id
 * @desc    Obtener un registro eliminado de auditoría por ID
 * @param   id
 */
router.get('/eliminados/:id', auditoriasController.getAuditoriaEliminadoById);

/**
 * @route   GET /api/auditoria-eliminados/:id/consultar
 * @desc    Consultar el registro original asociado a una auditoría de eliminados
 * @param   id
 */
router.get('/eliminados/:id/consultar', auditoriasController.consultarRegistroEliminado);

export default router;
