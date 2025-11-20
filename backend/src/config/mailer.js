import nodemailer from 'nodemailer';

// Crear transporter de prueba con Ethereal (para desarrollo)
const createTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

// En producción puedes cambiar esto por Gmail, Outlook, SendGrid, etc.
export const getTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Ejemplo con Gmail (necesitas app password)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    return await createTestTransporter();
  }
};

export default { getTransporter };