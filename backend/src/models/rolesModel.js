// src/models/rolesModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Rol = sequelize.define(
  'Rol',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'creado_en',
    },
    actualizado_en: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: 'actualizado_en',
    },
  },
  {
    timestamps: false,
    tableName: 'roles',
  }
);

// Función para obtener nombres de columnas disponibles
const getColumns = () => {
  return Object.keys(Rol.rawAttributes);
};

const create = async (data) => {
  return await Rol.create(data);
};

const findAll = async () => {
  try {
    const roles = await Rol.findAll({
      order: [['id', 'ASC']],
    });
    return roles;
  } catch (error) {
    throw new Error(`Error al listar roles: ${error.message}`);
  }
};

const findById = async (id) => {
  try {
    const rol = await Rol.findByPk(id);
    if (!rol) throw new Error('Rol no encontrado');
    return rol;
  } catch (error) {
    throw new Error(`Error al buscar el rol: ${error.message}`);
  }
};

const findBySlug = async (slug) => {
  try {
    const rol = await Rol.findOne({ where: { slug } });
    if (!rol) throw new Error('Rol no encontrado');
    return rol;
  } catch (error) {
    throw new Error(`Error al buscar el rol: ${error.message}`);
  }
};

const update = async (id, data) => {
  try {
    if (Object.keys(data).length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }

    // Actualizar el campo actualizado_en
    data.actualizado_en = new Date();

    const [updated] = await Rol.update(data, {
      where: { id },
      fields: Object.keys(data),
    });
    
    if (updated === 0) {
      throw new Error('Rol no encontrado o sin cambios');
    }
    
    const updatedRol = await Rol.findByPk(id);
    return updatedRol;
  } catch (error) {
    throw new Error(`Error al actualizar el rol: ${error.message}`);
  }
};

const remove = async (id) => {
  try {
    const deleted = await Rol.destroy({ where: { id } });
    if (deleted === 0) {
      throw new Error('Rol no encontrado');
    }
    return { message: 'Rol eliminado exitosamente' };
  } catch (error) {
    throw new Error(`Error al eliminar el rol: ${error.message}`);
  }
};

sequelize
  .sync({ alter: false })
  .then(() => console.log("Tabla 'roles' sincronizada"))
  .catch((err) => console.error('Error sincronizando roles:', err));

export default Rol;
export { create, findAll, findById, findBySlug, update, remove, getColumns };