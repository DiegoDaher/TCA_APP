import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const emailQueue = new Queue('emailQueue', {
  connection: {
    host: 'localhost',
    port: 6379,
    // En producción: usa REDIS_URL de .env, ej: url: process.env.REDIS_URL
  }
});

export default emailQueue;