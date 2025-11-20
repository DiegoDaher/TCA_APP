import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { generateRandomPassword } from '../utils/generatePassword.js';
import User from '../models/userModel.js';

const router = express.Router();

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar usuario por Correo_Electronico (campo correcto del modelo)
    const user = await User.findOne({ 
      where: { Correo_Electronico: email } 
    });
    
    if (!user) {
      // Seguridad: no reveles si existe
      return res.status(200).json({ 
        message: 'Si el correo existe, recibirás instrucciones para recuperar tu cuenta.' 
      });
    }

    // Generar contraseña temporal
    const tempPassword = generateRandomPassword(10);

    // Actualizar contraseña (el hook beforeUpdate hasheará automáticamente)
    user.Contraseña = tempPassword;
    await user.save();

    // Configurar transporter de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Configurar el email
    const mailOptions = {
      from: `"TCA - Acervo Bibliográfico" <${process.env.EMAIL_USER}>`,
      to: user.Correo_Electronico,
      subject: 'Recuperación de contraseña - TCA',
      text: `
¡Hola ${user.Nombres || 'usuario'}!

Hemos generado una nueva contraseña temporal para tu cuenta:

Contraseña temporal: ${tempPassword}

Esta contraseña tiene 10 caracteres y contiene mayúsculas, minúsculas, números y símbolos.

Por seguridad, te recomendamos cambiarla lo antes posible después de iniciar sesión.

Si no solicitaste este cambio, ignora este correo o contacta al administrador.

Saludos,
El equipo de TCA - Acervo Bibliográfico
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #801530; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
            .password-box { background: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #801530; }
            .password { font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #801530; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <p>¡Hola <strong>${user.Nombres || 'usuario'} ${user.Apellidos || ''}</strong>!</p>
              
              <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
              
              <p>Tu nueva contraseña temporal es:</p>
              
              <div class="password-box">
                <div class="password">${tempPassword}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Esta contraseña es temporal. Por tu seguridad, cámbiala inmediatamente después de iniciar sesión.
              </div>
              
              <p><strong>Características de la contraseña:</strong></p>
              <ul>
                <li>✓ 10 caracteres</li>
                <li>✓ Contiene mayúsculas y minúsculas</li>
                <li>✓ Incluye números</li>
                <li>✓ Incluye símbolos especiales</li>
              </ul>
              
              <p>Si no solicitaste este cambio, por favor ignora este correo o contacta al administrador del sistema.</p>
              
              <div class="footer">
                <hr>
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p><strong>TCA - Sistema de Acervo Bibliográfico</strong></p>
                <p>📧 ${process.env.EMAIL_USER}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Enviar el email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('='.repeat(50));
      console.log('✅ EMAIL ENVIADO EXITOSAMENTE');
      console.log('='.repeat(50));
      console.log(`Usuario: ${user.Nombres || 'Sin nombre'} ${user.Apellidos || ''}`);
      console.log(`Email: ${user.Correo_Electronico}`);
      console.log(`Message ID: ${info.messageId}`);
      console.log(`Contraseña temporal: ${tempPassword}`);
      console.log('='.repeat(50));
    } catch (emailError) {
      console.error('❌ Error al enviar el email:', emailError);
      // Aunque falle el email, ya actualizamos la contraseña
      console.log('='.repeat(50));
      console.log('⚠️ CONTRASEÑA ACTUALIZADA (Email no enviado)');
      console.log('='.repeat(50));
      console.log(`Usuario: ${user.Nombres || 'Sin nombre'} ${user.Apellidos || ''}`);
      console.log(`Email: ${user.Correo_Electronico}`);
      console.log(`Contraseña temporal: ${tempPassword}`);
      console.log('='.repeat(50));
    }

    res.status(200).json({ 
      message: 'Si el correo existe, recibirás una contraseña temporal en breve.' 
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;