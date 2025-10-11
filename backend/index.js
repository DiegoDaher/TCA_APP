import express from 'express';
import diarioOficialRoutes from './src/routes/diarioOficialRoutes.js';
import periodicosRoutes from './src/routes/periodicosRoutes.js';
import coleccionDurangoRoutes from './src/routes/coleccionDurangoRoutes.js';
import librosRoutes from './src/routes/librosRoutes.js';
import dotenv from 'dotenv';
import sequelize from './src/config/db.js'; // Importamos Sequelize desde config

dotenv.config();

const app = express(); // Definimos la app
app.use(express.json()); // Parsear JSON en el body

// Endpoint de prueba
app.get('/api', (req, res) => {
  res.send('Hello from the Express backend!');
});

// Montar rutas
app.use('/api/diario-oficial', diarioOficialRoutes);
app.use('/api/periodicos', periodicosRoutes);
app.use('/api/colecciondurango', coleccionDurangoRoutes);
app.use('/api/libros', librosRoutes);


// Verificar conexión de Sequelize (opcional, ya que los modelos lo hacen)
sequelize
  .authenticate()
  .then(() => console.log('Conectado a MySQL con Sequelize'))
  .catch((err) => console.error('Error conectando a MySQL con Sequelize:', err));

// Puerto desde .env o default
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});