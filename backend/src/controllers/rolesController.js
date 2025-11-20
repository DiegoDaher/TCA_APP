import Rol from '../models/rolesModel.js';
import RolUsuario from '../models/rolUsuariosModel.js';
import User from '../models/userModel.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

// Crear un nuevo rol
export const createRole = async (req, res) => {
  try {
    const { nombre, slug, descripcion } = req.body;

    if (!nombre || !slug) {
      return res.status(400).json({ 
        error: 'Los campos nombre y slug son obligatorios.' 
      });
    }

    const newRole = await Rol.create({
      nombre,
      slug,
      descripcion: descripcion || null,
    });

    res.status(201).json({
      message: 'Rol creado exitosamente',
      role: newRole,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al crear rol: ${error.message}` });
  }
};

// Obtener todos los roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll({
      order: [['id', 'ASC']],
    });

    res.status(200).json({
      message: 'Roles obtenidos exitosamente',
      roles,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener roles: ${error.message}` });
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Rol.findByPk(id);

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    res.status(200).json({
      message: 'Rol obtenido exitosamente',
      role,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener rol: ${error.message}` });
  }
};

// Actualizar un rol
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, slug, descripcion } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        error: 'No se proporcionaron campos para actualizar.' 
      });
    }

    const role = await Rol.findByPk(id);

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    const updatedRole = await role.update({
      nombre: nombre !== undefined ? nombre : role.nombre,
      slug: slug !== undefined ? slug : role.slug,
      descripcion: descripcion !== undefined ? descripcion : role.descripcion,
      actualizado_en: new Date(),
    });

    res.status(200).json({
      message: 'Rol actualizado exitosamente',
      role: updatedRole,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al actualizar rol: ${error.message}` });
  }
};

// Eliminar un rol
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Rol.findByPk(id);

    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Verificar si el rol está asignado a usuarios
    const assignedUsers = await RolUsuario.count({ where: { rol_id: id } });

    if (assignedUsers > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar el rol. Está asignado a ${assignedUsers} usuario(s).` 
      });
    }

    await role.destroy();

    res.status(200).json({
      message: 'Rol eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar rol: ${error.message}` });
  }
};

// Asignar o actualizar rol de un usuario (solo permite un rol por usuario)
export const assignRoleToUser = async (req, res) => {
  try {
    const { usuario_id, rol_id, asignado_por } = req.body;

    if (!usuario_id || !rol_id) {
      return res.status(400).json({ 
        error: 'Los campos usuario_id y rol_id son obligatorios.' 
      });
    }

    // Verificar que el usuario existe
    const user = await User.findByPk(usuario_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el rol existe
    const role = await Rol.findByPk(rol_id);
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Buscar si el usuario ya tiene un rol asignado
    const existingAssignment = await RolUsuario.findOne({
      where: { usuario_id }
    });

    let assignment;
    let created = false;

    if (existingAssignment) {
      // Si el rol es el mismo, no hacer nada
      if (existingAssignment.rol_id === rol_id) {
        return res.status(200).json({
          message: 'El usuario ya tiene este rol asignado',
          assignment: existingAssignment,
        });
      }

      // Eliminar la asignación anterior y crear una nueva
      // (necesario porque rol_id es parte de la primary key)
      await RolUsuario.destroy({
        where: {
          usuario_id,
          rol_id: existingAssignment.rol_id
        }
      });
      
      assignment = await RolUsuario.create({
        usuario_id,
        rol_id,
        asignado_por: asignado_por || req.user?.id || null,
        asignado_en: new Date(),
      });
    } else {
      // Crear nueva asignación
      assignment = await RolUsuario.create({
        usuario_id,
        rol_id,
        asignado_por: asignado_por || req.user?.id || null,
        asignado_en: new Date(),
      });
      created = true;
    }

    res.status(created ? 201 : 200).json({
      message: created ? 'Rol asignado exitosamente' : 'Rol actualizado exitosamente',
      assignment,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al asignar rol: ${error.message}` });
  }
};

// Quitar rol de un usuario
export const removeRoleFromUser = async (req, res) => {
  try {
    const { usuario_id, rol_id } = req.body;

    if (!usuario_id || !rol_id) {
      return res.status(400).json({ 
        error: 'Los campos usuario_id y rol_id son obligatorios.' 
      });
    }

    const deleted = await RolUsuario.destroy({
      where: {
        usuario_id,
        rol_id,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Asignación de rol no encontrada' });
    }

    res.status(200).json({
      message: 'Rol removido exitosamente del usuario',
    });
  } catch (error) {
    res.status(500).json({ error: `Error al remover rol: ${error.message}` });
  }
};

// Obtener todos los roles de un usuario
export const getUserRoles = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const user = await User.findByPk(usuario_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const roles = await sequelize.query(`
      SELECT r.id, r.nombre, r.slug, r.descripcion, ru.asignado_en
      FROM roles r
      JOIN rolUsuarios ru ON r.id = ru.rol_id
      WHERE ru.usuario_id = :usuario_id
    `, {
      replacements: { usuario_id },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      message: 'Roles del usuario obtenidos exitosamente',
      usuario_id,
      roles,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener roles del usuario: ${error.message}` });
  }
};

// Obtener todos los usuarios con un rol específico
export const getUsersByRole = async (req, res) => {
  try {
    const { slug } = req.params;

    const role = await Rol.findOne({ where: { slug } });
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    const users = await sequelize.query(`
      SELECT u.Id, u.\`Nombre(s)\` AS Nombres, u.\`Apellido(s)\` AS Apellidos, 
             u.Correo_Electronico, ru.asignado_en
      FROM usuarios u
      JOIN rolUsuarios ru ON u.Id = ru.usuario_id
      JOIN roles r ON r.id = ru.rol_id
      WHERE r.slug = :slug
    `, {
      replacements: { slug },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      message: 'Usuarios con el rol obtenidos exitosamente',
      role: {
        id: role.id,
        nombre: role.nombre,
        slug: role.slug,
      },
      users,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener usuarios por rol: ${error.message}` });
  }
};

// Verificar si un usuario tiene un rol específico
export const checkUserHasRole = async (req, res) => {
  try {
    const { usuario_id, slug } = req.params;

    const user = await User.findByPk(usuario_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const result = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM rolUsuarios ru
        JOIN roles r ON r.id = ru.rol_id
        WHERE ru.usuario_id = :usuario_id AND r.slug = :slug
      ) AS tiene_rol
    `, {
      replacements: { usuario_id, slug },
      type: sequelize.QueryTypes.SELECT,
    });

    const hasRole = result[0]?.tiene_rol === 1;

    res.status(200).json({
      message: 'Verificación completada',
      usuario_id,
      slug,
      tiene_rol: hasRole,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al verificar rol del usuario: ${error.message}` });
  }
};

// Listar usuarios con cantidad de roles
export const getUsersWithRoleCount = async (req, res) => {
  try {
    const usersWithRoles = await sequelize.query(`
      SELECT u.Id AS usuario_id, 
             u.\`Nombre(s)\` AS Nombres,
             u.\`Apellido(s)\` AS Apellidos,
             u.Correo_Electronico,
             COUNT(ru.rol_id) AS cantidad_roles
      FROM usuarios u
      LEFT JOIN rolUsuarios ru ON u.Id = ru.usuario_id
      GROUP BY u.Id, u.\`Nombre(s)\`, u.\`Apellido(s)\`, u.Correo_Electronico
      ORDER BY cantidad_roles DESC, u.Id ASC
    `, {
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      message: 'Usuarios con cantidad de roles obtenidos exitosamente',
      users: usersWithRoles,
    });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener usuarios con conteo de roles: ${error.message}` });
  }
};

export default {
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
};
