import { Router } from 'express';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUsersByRole,
  checkUserHasRole,
  getUsersWithRoleCount,
} from '../controllers/rolesController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas para gestión de roles (protegidas con autenticación)
router.post('/', authenticate, createRole);  
router.get('/', authenticate, getAllRoles);              // Obtener todos los roles
router.get('/:id', authenticate, getRoleById);           // Obtener rol por ID
router.put('/:id', authenticate, updateRole);            // Actualizar rol
router.delete('/:id', authenticate, deleteRole); 

// Rutas para gestión de asignaciones de roles a usuarios
router.post('/assign', authenticate, assignRoleToUser);        // Asignar rol a usuario

// Rutas para consultas de roles y usuarios
router.get('/user/:usuario_id', authenticate, getUserRoles);              // Obtener roles de un usuario
router.get('/users-by-role/:slug', authenticate, getUsersByRole);         // Obtener usuarios con un rol específico
router.get('/check/:usuario_id/:slug', authenticate, checkUserHasRole);   // Verificar si usuario tiene un rol
router.get('/users/role-count', authenticate, getUsersWithRoleCount);     // Listar usuarios con conteo de roles

export default router;
