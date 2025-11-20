// src/models/periodicosModel.js
import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/db.js';   // <-- tu instancia de Sequelize (MySQL)

const Periodico = sequelize.define(
  'Periodico',
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Titulo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Año: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Tomo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Observaciones: {
      type: DataTypes.STRING(150),
      allowNull: true,               // NULL permitido
    },
    Fecha_de_creacion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,   // CURDATE() en MySQL
    },
    Status: {
      type: DataTypes.BOOLEAN,       // TINYINT(1) → BOOLEAN (0/1)
      allowNull: false,
      defaultValue: true,            // 1 por defecto
    },
  },
  {
    timestamps: false,               // No usamos createdAt/updatedAt
    tableName: 'periodicos',         // <-- nombre exacto de la tabla en la BD
  }
);

// Función para obtener nombres de columnas disponibles
const getColumns = () => {
  return Object.keys(Periodico.rawAttributes); // Devuelve ["Id", "Año", "Tomo", "Periodo", "Fecha_de_creacion", "Status"]
};

const create = async (data) => {
  return await Periodico.create(data);
};

const findAll = async ({ page = 1, limit = 10, column = null, value = null, filters = {}, q = null}) => {
  try {
    const offset = (page - 1) * limit;
    let where = {...filters};

    // Búsqueda por columna específica
    if (column && value) {
      const normalizedColumn = column.trim();
      switch (normalizedColumn) {
        case 'Titulo':
          where.Titulo = { [Op.like]: `${value}%` };
          break;
        case 'Año':
          where.Año = { [Op.like]: `%${value}%` };
          break;
        case 'Tomo':
          const tomoNum = parseInt(value);
          if (!isNaN(tomoNum)) where.Tomo = tomoNum;
          break;
        case 'Observaciones':
          where.Observaciones = { [Op.like]: `%${value}%` };
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

    // Búsqueda general (q) sobre campos de texto
    if (q && !column) {
      where[Op.or] = [
        { Titulo: { [Op.like]: `${q}%` } },
        { Año:    { [Op.like]: `%${q}%` } },
        { Observaciones: { [Op.like]: `%${q}%` } },
      ];
    }

    const { count, rows } = await Periodico.findAndCountAll({
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
  const entry = await Periodico.findByPk(id);
  if (!entry) throw new Error('Registro no encontrado');
  return entry;
    } catch (error) {
    throw new Error(`Error al buscar el registro: ${error.message}`);
  }
};

const update = async (id, data) => {
  try {
    if (Object.keys(data).length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }

    const [updated] = await Periodico.update(data, {
      where: { Id: id },
      fields: Object.keys(data),  // Asegura que solo se actualicen los campos proporcionados
    });
    if (updated === 0) {
      throw new Error('Registro no encontrado o sin cambios');
    }
    const updatedEntry = await Periodico.findByPk(id);
    return updatedEntry;
  } catch (error) {
    throw new Error(`Error al actualizar el registro: ${error.message}`);
  }
};
sequelize
  .sync({ alter: false })
  .then(() => console.log("Tabla 'periodicos' sincronizada"))
  .catch((err) => console.error('Error sincronizando periodicos:', err));

export default Periodico;
export { create, findAll, findById, update, getColumns };