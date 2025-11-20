import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define(
  'User',
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'Id' // Nombre real de la columna en la BD
    },
    Nombres: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: 'Nombre(s)'
    },
    Apellidos: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: 'Apellido(s)'
    },
    Correo_Electronico: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    Contraseña: {
      type: DataTypes.STRING(255), // Cambiado a 255 para soportar hashes bcrypt
      allowNull: true,
    },
    Fecha_de_Creacion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    Status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: false,
    tableName: 'usuarios',
    hooks: {
      beforeCreate: async (user) => {
        if (user.Contraseña) {
          const salt = await bcrypt.genSalt(10);
          user.Contraseña = await bcrypt.hash(user.Contraseña, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('Contraseña')) {
          const salt = await bcrypt.genSalt(10);
          user.Contraseña = await bcrypt.hash(user.Contraseña, salt);
        }
      },
    },
  }
);

// Método para comparar contraseñas
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.Contraseña);
};

// Sincronizar la tabla
sequelize
  .sync({ alter: false })
  .then(() => console.log("Tabla 'usuarios' sincronizada correctamente"))
  .catch((err) => console.error("Error al sincronizar la tabla 'usuarios':", err));

export default User;
