'use client';

import React, { useState } from 'react';
import { X, Mail, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ModalForgotPassword = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    // Limpiar mensajes al escribir
    if (error) {
      setError('');
    }
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El correo electrónico no es válido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      const response = await fetch(`${apiHost}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        // Respuesta exitosa (200)
        setMessage(data.message);
        setMessageType('success');
      } else {
        // Error del servidor
        setMessage(data.message || 'Error al procesar la solicitud');
        setMessageType('error');
      }

    } catch (error) {
      console.error('Error en forgot-password:', error);
      setMessage('Error de conexión. Por favor, intenta nuevamente.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail('');
    setError('');
    setMessage('');
    setMessageType('');
    onClose();
  };

  const handleBackToLogin = () => {
    setEmail('');
    setError('');
    setMessage('');
    setMessageType('');
    onBackToLogin();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[var(--selected)] rounded-full flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Recuperar Contraseña</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <p className="text-sm text-gray-600 mb-4">
            Ingresa tu correo electrónico y te enviaremos una contraseña temporal para que puedas acceder a tu cuenta.
          </p>

          <div className="space-y-4">
            {/* Correo Electrónico */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  className={`pl-10 ${error ? 'border-red-500' : ''}`}
                  placeholder="correo@ejemplo.com"
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              
              {/* Mensaje de respuesta */}
              {message && (
                <div className={`text-sm p-3 rounded-md ${
                  messageType === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={handleBackToLogin}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#801530] hover:bg-[#6b1128] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForgotPassword;
