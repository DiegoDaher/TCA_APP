import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authenticatedFetch } from '@/lib/auth';

const ModalAgregarUsuario = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  const [formData, setFormData] = useState({
    Nombres: '',
    Apellidos: '',
    Correo_Electronico: '',
    rol_id: ''
  });

  // Cargar roles al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      const response = await authenticatedFetch(`${apiHost}/api/roles`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error al obtener roles: ${response.statusText}`);
      }

      const result = await response.json();
      setRoles(result.roles || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      toast.error('Error al cargar roles', {
        description: error.message,
        duration: 4000,
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rol_id: parseInt(value, 10)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      const response = await fetch(`${apiHost}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al registrar usuario: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Usuario registrado exitosamente:', result);
      
      // Mostrar notificación de éxito
      toast.success(result.message || '¡Usuario registrado exitosamente!', {
        description: result.emailSent ? 'Se ha enviado la contraseña por correo.' : '',
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });
      
      // Resetear el formulario
      setFormData({
        Nombres: '',
        Apellidos: '',
        Correo_Electronico: '',
        rol_id: ''
      });

      // Cerrar el modal después de 1 segundo
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar para mostrar el nuevo usuario
      }, 1000);

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      toast.error('Error al registrar usuario', {
        description: error.message,
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Resetear el formulario
    setFormData({
      Nombres: '',
      Apellidos: '',
      Correo_Electronico: '',
      rol_id: ''
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCancel}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="mr-4 flex items-center justify-center w-10 h-10 hover:bg-[var(--hoverselect)] rounded-full transition"
            >
              <Image
                src="/chevron-left.svg"
                alt="Volver"
                width={20}
                height={20}
              />
            </button>                        
            <h2 className="text-xl font-semibold">Agregar Usuario</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="bg-[#801530] hover:bg-[#6b1128] text-white px-4 py-2 rounded text-sm transition-colors disabled:bg-gray-400"
              disabled={isLoading || isLoadingRoles}
            >
              {isLoading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold mb-4">Información del usuario</h3>
            
            {/* Grid de formulario */}
            <div className="space-y-4">
             <div className="grid grid-cols-2 gap-6">
              {/* Nombre(s) */}
              <div className="space-y-2">
                <Label htmlFor="Nombres">
                  Nombre(s) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Nombres"
                  name="Nombres"
                  value={formData.Nombres}
                  onChange={handleInputChange}
                  className="placeholder:text-[var(--selected)]"
                  placeholder="Ingrese el nombre del usuario"
                  required
                />
              </div>


              {/* Apellido(s) */}
              <div className="space-y-2">
                <Label htmlFor="Apellidos">
                  Apellido(s) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Apellidos"
                  name="Apellidos"
                  value={formData.Apellidos}
                  onChange={handleInputChange}
                  className="placeholder:text-[var(--selected)]"
                  placeholder="Ingrese los apellidos del usuario"
                  required
                />
              </div>
            </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
              {/* Correo Electrónico */}
              <div className="space-y-2">
                <Label htmlFor="Correo_Electronico">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Correo_Electronico"
                  name="Correo_Electronico"
                  type="email"
                  value={formData.Correo_Electronico}
                  onChange={handleInputChange}
                  className="placeholder:text-[var(--selected)]"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>


              {/* Rol */}
              <div className="space-y-2">
                <Label htmlFor="rol_id">
                  Rol <span className="text-red-500">*</span>
                </Label>
                {isLoadingRoles ? (
                  <div className="text-sm text-gray-500">Cargando roles...</div>
                ) : (
                  <Select
                    value={formData.rol_id.toString()}
                    onValueChange={handleRoleChange}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.id} value={rol.id.toString()}>
                          {rol.nombre} - {rol.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                </div>
              </div>

              <Separator />

              {/* Nota informativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>📧 Nota:</strong> Se generará una contraseña automáticamente y se enviará al correo electrónico del usuario.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarUsuario;
