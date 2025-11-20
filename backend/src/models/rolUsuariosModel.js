// src/models/rolUsuariosModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './userModel.js';
import Rol from './rolesModel.js';

const RolUsuario = sequelize.define(
  'RolUsuario',
  {
    usuario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'Id',
      },
    },
    rol_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    asignado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'usuarios',
        key: 'Id',
      },
    },
    asignado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'asignado_en',
    },
  },
  {
    timestamps: false,
    tableName: 'rolUsuarios',
  }
);

// Definir relaciones
RolUsuario.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
RolUsuario.belongsTo(Rol, { foreignKey: 'rol_id', as: 'rol' });
RolUsuario.belongsTo(User, { foreignKey: 'asignado_por', as: 'asignador' });

// Función para asignar un rol a un usuario
const assignRoleToUser = async (usuario_id, rol_id, asignado_por = null) => {
  try {
    const assignment = await RolUsuario.create({
      usuario_id,
      rol_id,
      asignado_por,
    });
    return assignment;
  } catch (error) {
    throw new Error(`Error al asignar rol: ${error.message}`);
  }
};

// Función para obtener todos los roles de un usuario
const getUserRoles = async (usuario_id) => {
  try {
    const roles = await RolUsuario.findAll({
      where: { usuario_id },
      include: [
        {
          model: Rol,
          as: 'rol',
        },
      ],
    });
    return roles;
  } catch (error) {
    throw new Error(`Error al obtener roles del usuario: ${error.message}`);
  }
};

// Función para obtener todos los usuarios con un rol específico
const getUsersByRole = async (rol_id) => {
  try {
    const users = await RolUsuario.findAll({
      where: { rol_id },
      include: [
        {
          model: User,
          as: 'usuario',
        },
      ],
    });
    return users;
  } catch (error) {
    throw new Error(`Error al obtener usuarios con el rol: ${error.message}`);
  }
};

// Función para remover un rol de un usuario
const removeRoleFromUser = async (usuario_id, rol_id) => {
  try {
    const deleted = await RolUsuario.destroy({
      where: {
        usuario_id,
        rol_id,
      },
    });
    if (deleted === 0) {
      throw new Error('Asignación de rol no encontrada');
    }
    return { message: 'Rol removido exitosamente' };
  } catch (error) {
    throw new Error(`Error al remover rol: ${error.message}`);
  }
};

// Función para verificar si un usuario tiene un rol específico
const userHasRole = async (usuario_id, rol_slug) => {
  try {
    const role = await Rol.findOne({ where: { slug: rol_slug } });
    if (!role) return false;

    const assignment = await RolUsuario.findOne({
      where: {
        usuario_id,
        rol_id: role.id,
      },
    });
    return !!assignment;
  } catch (error) {
    throw new Error(`Error al verificar rol del usuario: ${error.message}`);
  }
};

sequelize
  .sync({ alter: false })
  .then(() => console.log("Tabla 'rolUsuarios' sincronizada"))
  .catch((err) => console.error('Error sincronizando rolUsuarios:', err));

export default RolUsuario;
export {
  assignRoleToUser,
  getUserRoles,
  getUsersByRole,
  removeRoleFromUser,
  userHasRole,
};
