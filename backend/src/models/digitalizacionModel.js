// models/Digitalizacion.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Digitalizacion = sequelize.define(
  'Digitalizacion',
  {
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    carpeta_raiz: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    portada_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: 'digitalizaciones' }
);

// models/Hoja.js
const Hoja = sequelize.define(
  'Hoja',
  {
    ruta_archivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numero_pagina: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: 'hojas_digitalizadas' }
);

// Relaciones
Digitalizacion.hasMany(Hoja, { as: 'hojas', foreignKey: 'digitalizacion_id' });
Hoja.belongsTo(Digitalizacion, { foreignKey: 'digitalizacion_id' });

export { Digitalizacion, Hoja };
export default { Digitalizacion, Hoja };