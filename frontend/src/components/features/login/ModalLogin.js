'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import ModalForgotPassword from './ModalForgotPassword';

const ModalLogin = ({ isOpen, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    Correo_Electronico: '',
    Contraseña: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar correo electrónico
    if (!formData.Correo_Electronico.trim()) {
      newErrors.Correo_Electronico = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Correo_Electronico)) {
      newErrors.Correo_Electronico = 'El correo electrónico no es válido';
    }
    
    // Validar contraseña
    if (!formData.Contraseña) {
      newErrors.Contraseña = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      const response = await fetch(`${apiHost}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Correo_Electronico: formData.Correo_Electronico,
          Contraseña: formData.Contraseña
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar token de forma segura en httpOnly cookie sería lo ideal,
      // pero como alternativa usamos sessionStorage (más seguro que localStorage para tokens)
      // y establecemos una expiración
      const tokenData = {
        token: data.token,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        user: data.user
      };
      
      // Usar sessionStorage en lugar de localStorage para mayor seguridad
      // Se limpia automáticamente al cerrar el navegador
      sessionStorage.setItem('authToken', data.token);
      sessionStorage.setItem('authUser', JSON.stringify(data.user));
      sessionStorage.setItem('tokenExpiry', tokenData.expiresAt.toString());

      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Bienvenido!',
        text: `Hola ${data.user.Nombres} ${data.user.Apellidos}`,
        icon: 'success',
        confirmButtonColor: '#801530',
        confirmButtonText: 'Continuar',
        timer: 2000,
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'rounded-md px-4 py-2'
        }
      });

      toast.success('Sesión iniciada exitosamente', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });

      // Limpiar formulario
      setFormData({
        Correo_Electronico: '',
        Contraseña: ''
      });

      // Llamar callback de éxito
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }

      // Cerrar modal
      onClose();

      // Recargar página para actualizar estado de autenticación
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('Error en login:', error);
      
      await Swal.fire({
        title: 'Error al iniciar sesión',
        text: error.message || 'Verifica tus credenciales e intenta nuevamente',
        icon: 'error',
        confirmButtonColor: '#801530',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'rounded-md px-4 py-2'
        }
      });

      toast.error('Error al iniciar sesión', {
        description: error.message,
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      Correo_Electronico: '',
      Contraseña: ''
    });
    setErrors({});
    onClose();
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
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Iniciar Sesión</h2>
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
          <div className="space-y-4">
            {/* Correo Electrónico */}
            <div className="space-y-2">
              <Label htmlFor="Correo_Electronico">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="Correo_Electronico"
                  name="Correo_Electronico"
                  type="email"
                  value={formData.Correo_Electronico}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.Correo_Electronico ? 'border-red-500' : ''}`}
                  placeholder="correo@ejemplo.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.Correo_Electronico && (
                <p className="text-sm text-red-500">{errors.Correo_Electronico}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="Contraseña">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="Contraseña"
                  name="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.Contraseña}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.Contraseña ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.Contraseña && (
                <p className="text-sm text-red-500">{errors.Contraseña}</p>
              )}
            </div>

            {/* Recuperar Contraseña */}
            <div className="text-right">
              <a 
                href="#" 
                className="text-sm text-[var(--selected)] hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#801530] hover:bg-[#6b1128] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal de Recuperar Contraseña */}
      <ModalForgotPassword
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default ModalLogin;
