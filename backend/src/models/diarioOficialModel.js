import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DiarioOficial = sequelize.define(
  'DiarioOficial',
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Año: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    Tomo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Periodo: {
      type: DataTypes.STRING(150),
      allowNull: true, // Puede ser NULL
    },
    Fecha_de_creacion: {
      type: DataTypes.DATEONLY, // Usamos DATEONLY para solo fecha (sin hora)
      defaultValue: DataTypes.NOW, // Default: fecha actual
    },
    Status: {
      type: DataTypes.BOOLEAN, // TINYINT(1) se mapea como BOOLEAN
      allowNull: false,
      defaultValue: true, // Default: 1 (true)
    },
  },
  {
    timestamps: false, // No usamos createdAt/updatedAt
    tableName: 'diario_oficial', // Nombre exacto de la tabla en la DB
  }
);

const create = async (req, res) => {
  const { Año, Tomo, Periodo, Fecha_de_creacion, Status } = req.body;

  if (!Año || typeof Año !== 'string') {
    return res.status(400).json({ error: 'El campo "Año" es requerido y debe ser una cadena de texto.' });
  }
  if (Año.length > 16) {
    return res.status(400).json({ error: 'El campo "Año" no puede exceder los 16 caracteres.' });
  }
  if (!Tomo || typeof Tomo !== 'number' || !Number.isInteger(Tomo)) {
    return res.status(400).json({ error: 'El campo "Tomo" es requerido y debe ser un número entero.' });
  }
  if (Periodo && (typeof Periodo !== 'string' || Periodo.length > 150)) {
    return res.status(400).json({ error: 'El campo "Periodo" debe ser una cadena de texto de máximo 150 caracteres.' });
  }
  if (Fecha_de_creacion && isNaN(Date.parse(Fecha_de_creacion))) {
    return res.status(400).json({ error: 'El campo "Fecha_de_creacion" debe ser una fecha válida (formato YYYY-MM-DD).' });
  }
  if (Status !== undefined && typeof Status !== 'boolean') {
    return res.status(400).json({ error: 'El campo "Status" debe ser un booleano (true/false).' });
  }

  try {
    const newEntry = await DiarioOficial.create({
      Año,
      Tomo,
      Periodo: Periodo || null,
      Fecha_de_creacion: Fecha_de_creacion || null,
      Status: Status !== undefined ? Status : undefined,
    });
    res.status(201).json({ message: 'Registro agregado exitosamente', data: newEntry });
  } catch (error) {
    res.status(500).json({ error: `Error al crear el registro: ${error.message}` });
  }
};

// Función para obtener nombres de columnas disponibles
const getColumns = () => {
  return Object.keys(DiarioOficial.rawAttributes); // Devuelve ["Id", "Año", "Tomo", "Periodo", "Fecha_de_creacion", "Status"]
};

// Función para listar registros con paginación y filtrado dinámico
const findAll = async ({ page = 1, limit = 10, column = null, value = null, q = null }) => {
  try {
    const offset = (page - 1) * limit;
    let where = {};

    // Filtrado dinámico por columna específica (opcional)
    if (column && value) {
      const normalizedColumn = column.trim(); // Normalizar nombre de columna
      switch (normalizedColumn) {
        case 'Año':
          where.Año = { [Op.like]: `%${value}%` };
          break;
        case 'Tomo':
          const tomoNum = parseInt(value);
          if (!isNaN(tomoNum)) where.Tomo = tomoNum;
          break;
        case 'Periodo':
          where.Periodo = { [Op.like]: `%${value}%` };
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
          // Ignorar si la columna no existe
          break;
      }
    }

    // Búsqueda general (q) si no hay filtrado por columna
    if (q && !column) {
      where = {
        [Op.or]: [
          { Año: { [Op.like]: `%${q}%` } },
          { Periodo: { [Op.like]: `%${q}%` } },
        ],
      };
    }

    const { count, rows } = await DiarioOficial.findAndCountAll({
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

// Función para buscar un registro por ID
const findById = async (id) => {
  try {
    const entry = await DiarioOficial.findByPk(id);
    if (!entry) {
      throw new Error('Registro no encontrado');
    }
    return entry;
  } catch (error) {
    throw new Error(`Error al buscar el registro: ${error.message}`);
  }
};

// Función para actualizar un registro por ID
const update = async (id, data) => {
  try {
    const [updated] = await DiarioOficial.update(data, {
      where: { Id: id },
    });
    if (updated === 0) {
      throw new Error('Registro no encontrado o sin cambios');
    }
    const updatedEntry = await DiarioOficial.findByPk(id);
    return updatedEntry;
  } catch (error) {
    throw new Error(`Error al actualizar el registro: ${error.message}`);
  }
};

// Sincronizar el modelo con la base de datos
sequelize
  .sync({ alter: false }) // alter: true ajusta la tabla si hay cambios
  .then(() => console.log("Tabla 'diario_oficial' sincronizada correctamente"))
  .catch((err) => console.error("Error al sincronizar la tabla 'diario_oficial':", err));

export default DiarioOficial;
export { create, findAll, update, findById, getColumns };