'use client';

import React, { useState, useCallback } from 'react';
import { X, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { authenticatedFetch } from '@/lib/auth';

const ModalChangePassword = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [validationStatus, setValidationStatus] = useState({
    oldPassword: { isValid: false, message: '' },
    newPassword: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' }
  });
  const [isValidating, setIsValidating] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    symbols: false
  });

  const validatePassword = useCallback((password) => {
    if (!password) return '';
    
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[@#$!%*?&]/.test(password)
    };

    setPasswordChecks(checks);

    const allValid = Object.values(checks).every(check => check);
    
    if (!allValid) {
      return { checks, isValid: false };
    }
    
    return '';
  }, []);

  const validateFieldRealTime = useCallback(async (field, value) => {
    try {
      setIsValidating(prev => ({ ...prev, [field]: true }));
      let isValid = false;
      let message = '';

      switch (field) {
        case 'oldPassword':
          if (value) {
            isValid = true;
            message = 'Contraseña ingresada ✓';
          }
          break;

        case 'newPassword':
          if (value) {
            const passwordError = validatePassword(value);
            if (passwordError && typeof passwordError === 'object') {
              isValid = false;
              message = 'Completa todos los requisitos de contraseña';
            } else if (passwordError) {
              isValid = false;
              message = passwordError;
            } else {
              isValid = true;
              message = 'Nueva contraseña válida ✓';
            }
            
            if (formData.confirmPassword) {
              setTimeout(() => validateFieldRealTime('confirmPassword', formData.confirmPassword), 100);
            }
          }
          break;

        case 'confirmPassword':
          if (value) {
            isValid = value === formData.newPassword;
            message = isValid ? 'Las contraseñas coinciden ✓' : 'Las contraseñas no coinciden';
          }
          break;

        default:
          break;
      }

      setValidationStatus(prev => ({
        ...prev,
        [field]: { isValid, message }
      }));

    } catch (error) {
      console.error(`Error en validación de ${field}:`, error);
      setValidationStatus(prev => ({
        ...prev,
        [field]: { isValid: false, message: 'Error en validación' }
      }));
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }
  }, [formData.newPassword, formData.confirmPassword, validatePassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validar en tiempo real
    validateFieldRealTime(name, value);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén llenos
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Completa todos los campos', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
      return;
    }

    // Validar que la nueva contraseña sea válida
    if (!validationStatus.newPassword.isValid) {
      toast.error('La nueva contraseña no cumple con los requisitos', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
      return;
    }

    // Validar que las contraseñas coincidan
    if (!validationStatus.confirmPassword.isValid) {
      toast.error('Las contraseñas no coinciden', {
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      const response = await authenticatedFetch(`${apiHost}/api/auth/change-password`, {
        method: 'PUT',
        body: JSON.stringify({
          Contraseña: formData.oldPassword,
          Nueva_Contraseña: formData.newPassword,
          Confirmar_Contraseña: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      await Swal.fire({
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña ha sido cambiada exitosamente',
        icon: 'success',
        confirmButtonColor: '#801530',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'rounded-md px-4 py-2'
        }
      });

      toast.success('Contraseña cambiada exitosamente', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });

      // Limpiar formulario
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setValidationStatus({
        oldPassword: { isValid: false, message: '' },
        newPassword: { isValid: false, message: '' },
        confirmPassword: { isValid: false, message: '' }
      });
      setPasswordChecks({
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false
      });

      onClose();

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      await Swal.fire({
        title: 'Error al cambiar contraseña',
        text: error.message || 'Verifica que tu contraseña actual sea correcta',
        icon: 'error',
        confirmButtonColor: '#801530',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'rounded-md px-4 py-2'
        }
      });

      toast.error('Error al cambiar contraseña', {
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
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setValidationStatus({
      oldPassword: { isValid: false, message: '' },
      newPassword: { isValid: false, message: '' },
      confirmPassword: { isValid: false, message: '' }
    });
    setPasswordChecks({
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[var(--selected)] rounded-full flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
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
            {/* Contraseña Actual */}
            <div className="space-y-2">
              <Label htmlFor="oldPassword">
                Contraseña Actual <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showPassword.oldPassword ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('oldPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword.oldPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationStatus.oldPassword.message && (
                <p className={`text-sm flex items-center gap-1 ${validationStatus.oldPassword.isValid ? 'text-green-600' : 'text-red-500'}`}>
                  {validationStatus.oldPassword.isValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {validationStatus.oldPassword.message}
                </p>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                Nueva Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword.newPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword.newPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Requisitos de contraseña */}
              {formData.newPassword && (
                <div className="bg-gray-50 rounded-md p-3 space-y-1 text-xs">
                  <p className="font-semibold text-gray-700 mb-2">Requisitos de contraseña:</p>
                  <div className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordChecks.length ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordChecks.uppercase ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Al menos una letra mayúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordChecks.lowercase ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Al menos una letra minúscula</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordChecks.numbers ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordChecks.numbers ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Al menos un número</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordChecks.symbols ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordChecks.symbols ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Al menos un símbolo (@#$!%*?&)</span>
                  </div>
                </div>
              )}

              {validationStatus.newPassword.message && (
                <p className={`text-sm flex items-center gap-1 ${validationStatus.newPassword.isValid ? 'text-green-600' : 'text-amber-600'}`}>
                  {validationStatus.newPassword.isValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {validationStatus.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword.confirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationStatus.confirmPassword.message && (
                <p className={`text-sm flex items-center gap-1 ${validationStatus.confirmPassword.isValid ? 'text-green-600' : 'text-red-500'}`}>
                  {validationStatus.confirmPassword.isValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {validationStatus.confirmPassword.message}
                </p>
              )}
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
              disabled={isLoading || !validationStatus.newPassword.isValid || !validationStatus.confirmPassword.isValid}
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalChangePassword;
