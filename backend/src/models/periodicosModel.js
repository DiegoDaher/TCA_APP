// src/models/periodicosModel.js
import { DataTypes } from 'sequelize';
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


const create = async (data) => {
  return await Periodico.create(data);
};

const findAll = async ({ page = 1, limit = 10, column = null, value = null, filters = {}, q = null }) => {
  try {
  const offset = (page - 1) * limit;
  const where = {};

  // Filtros por columna (opcional)
  if (filters.titulo) where.Titulo = { [DataTypes.Op.like]: `%${filters.titulo}%` };
  if (filters.año)    where.Año    = { [DataTypes.Op.like]: `%${filters.año}%` };
  if (filters.tomo)   where.Tomo   = parseInt(filters.tomo);
  if (filters.status !== undefined) where.Status = filters.status;

  // Búsqueda general (q) sobre campos de texto
  if (q && !column) {
    where[DataTypes.Op.or] = [
      { Titulo: { [DataTypes.Op.like]: `%${q}%` } },
      { Año:    { [DataTypes.Op.like]: `%${q}%` } },
      { Observaciones: { [DataTypes.Op.like]: `%${q}%` } },
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
    const [updated] = await Periodico.update(data, { where: { Id: id } });
    if (updated === 0) throw new Error('Registro no encontrado o sin cambios');
    return await Periodico.findByPk(id);
  } catch (error) {
    throw new Error(`Error al actualizar el registro: ${error.message}`);
  }
};

sequelize
  .sync({ alter: true })
  .then(() => console.log("Tabla 'periodicos' sincronizada"))
  .catch((err) => console.error('Error sincronizando periodicos:', err));

export default Periodico;
export { create, findAll, findById, update };