import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/db.js';

const ColeccionDurango = sequelize.define(
  'ColeccionDurango',
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Letra: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    Titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    Autor: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Año: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Editorial: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Edición: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ISBN: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    Ejemplares: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Fecha_de_creacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: false,
    tableName: 'coleccion_durango',
  }
);

const create = async (data) => {
  return await ColeccionDurango.create(data);
};

const getColumns = () => {
  return Object.keys(ColeccionDurango.rawAttributes);
};

const findAll = async ({ page = 1, limit = 10, column = null, value = null, q = null }) => {
  try {
    const offset = (page - 1) * limit;
    let where = {};

    if (column && value) {
      const normalizedColumn = column.trim();
      switch (normalizedColumn) {
        case 'Letra':
          where.Letra = { [Op.like]: `%${value}%` };
          break;
        case 'Titulo':
          where.Titulo = { [Op.like]: `%${value}%` };
          break;
        case 'Autor':
          where.Autor = { [Op.like]: `%${value}%` };
          break;
        case 'Año':
          where.Año = { [Op.like]: `%${value}%` };
          break;
        case 'Editorial':
          where.Editorial = { [Op.like]: `%${value}%` };
          break;
        case 'Edición':
          where.Edición = { [Op.like]: `%${value}%` };
          break;
        case 'ISBN':
          where.ISBN = { [Op.like]: `%${value}%` };
          break;
        case 'Ejemplares':
          const ejemplaresNum = parseInt(value);
          if (!isNaN(ejemplaresNum)) where.Ejemplares = ejemplaresNum;
          break;
        case 'Fecha_de_creacion':
          if (!isNaN(Date.parse(value))) where.Fecha_de_creacion = value;
          break;
        case 'Status':
          const statusBool = value === 'true' || value === '1';
          where.Status = statusBool;
          break;
        case 'Id':
          const idNum = parseInt(value);
          if (!isNaN(idNum)) where.Id = idNum;
          break;
        default:
          break;
      }
    }

    if (q && !column) {
      where = {
        [Op.or]: [
          { Letra: { [Op.like]: `%${q}%` } },
          { Titulo: { [Op.like]: `%${q}%` } },
          { Autor: { [Op.like]: `%${q}%` } },
          { Año: { [Op.like]: `%${q}%` } },
          { Editorial: { [Op.like]: `%${q}%` } },
          { Edición: { [Op.like]: `%${q}%` } },
          { ISBN: { [Op.like]: `%${q}%` } },
        ],
      };
    }

    const { count, rows } = await ColeccionDurango.findAndCountAll({
      where,
      offset,
      limit,
      order: [['Id', 'DESC']],
    });

    return { total: count, data: rows };
  } catch (error) {
    throw new Error(`Error al listar registros: ${error.message}`);
  }
};

const findById = async (id) => {
  try {
    const entry = await ColeccionDurango.findByPk(id);
    if (!entry) {
      throw new Error('Registro no encontrado');
    }
    return entry;
  } catch (error) {
    throw new Error(`Error al buscar el registro: ${error.message}`);
  }
};

const update = async (id, data) => {
  try {
    const [updated] = await ColeccionDurango.update(data, {
      where: { Id: id },
    });
    if (updated === 0) {
      throw new Error('Registro no encontrado o sin cambios');
    }
    const updatedEntry = await ColeccionDurango.findByPk(id);
    return updatedEntry;
  } catch (error) {
    throw new Error(`Error al actualizar el registro: ${error.message}`);
  }
};

sequelize
  .sync({ alter: false })
  .then(() => console.log("Tabla 'coleccion_durango' sincronizada correctamente"))
  .catch((err) => console.error("Error al sincronizar la tabla 'coleccion_durango':", err));

export default ColeccionDurango;
export { create, findAll, update, findById, getColumns };