const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Worker que procesa cada job de email
const emailWorker = new Worker('emailQueue', async (job) => {
  const { to, subject, text, html, tempPassword, userName } = job.data;

  const mailOptions = {
    from: `"Mi App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: html.replace('${tempPassword}', tempPassword).replace('${userName}', userName || 'usuario')
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`Email enviado a ${to}: ${result.messageId}`);
  
  return { success: true, messageId: result.messageId };
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  }
});

// Manejo de errores y completados
emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completado para ${job.data.to}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} falló para ${job.data.to}:`, err);
  // BullMQ reintentará automáticamente hasta 3 veces por defecto
});

module.exports = emailWorker;