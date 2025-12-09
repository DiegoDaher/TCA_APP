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

const ModalEditarUsuario = ({ isOpen, onClose, usuario }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [selectedRolId, setSelectedRolId] = useState('');

  // Cargar roles y rol actual del usuario al abrir el modal
  useEffect(() => {
    if (isOpen && usuario) {
      fetchRoles();
      fetchUserRole();
    }
  }, [isOpen, usuario]);

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

  const fetchUserRole = async () => {
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      const response = await authenticatedFetch(`${apiHost}/api/roles/user/${usuario.Id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Error al obtener rol del usuario: ${response.statusText}`);
      }

      const result = await response.json();
      // Si el usuario tiene un rol asignado, establecerlo
      if (result.roles && result.roles.length > 0) {
        setSelectedRolId(result.roles[0].id.toString());
      }
    } catch (error) {
      console.error('Error al cargar rol del usuario:', error);
      // No mostrar error si el usuario no tiene rol asignado
      if (!error.message.includes('no encontrado')) {
        toast.error('Error al cargar rol del usuario', {
          description: error.message,
          duration: 4000,
        });
      }
    }
  };

  const handleRoleChange = (value) => {
    setSelectedRolId(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!selectedRolId) {
      toast.error('Error', {
        description: 'Debe seleccionar un rol',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      const response = await authenticatedFetch(`${apiHost}/api/roles/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: usuario.Id,
          rol_id: parseInt(selectedRolId, 10)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al actualizar rol: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Rol actualizado exitosamente:', result);
      
      // Mostrar notificación de éxito
      toast.success(result.message || '¡Rol actualizado exitosamente!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });

      // Cerrar el modal después de 1 segundo
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar para mostrar los cambios
      }, 1000);

    } catch (error) {
      console.error('Error al actualizar rol:', error);
      toast.error('Error al actualizar rol', {
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
    setError(null);
    setSelectedRolId('');
    onClose();
  };

  if (!isOpen || !usuario) return null;

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
            <h2 className="text-xl font-semibold">Editar Usuario</h2>
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
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
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
                {/* Nombre(s) - Bloqueado */}
                <div className="space-y-2">
                  <Label htmlFor="Nombres">Nombre(s)</Label>
                  <Input
                    id="Nombres"
                    name="Nombres"
                    value={usuario.Nombres || ''}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Apellido(s) - Bloqueado */}
                <div className="space-y-2">
                  <Label htmlFor="Apellidos">Apellido(s)</Label>
                  <Input
                    id="Apellidos"
                    name="Apellidos"
                    value={usuario.Apellidos || ''}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                {/* Correo Electrónico - Bloqueado */}
                <div className="space-y-2">
                  <Label htmlFor="Correo_Electronico">Correo Electrónico</Label>
                  <Input
                    id="Correo_Electronico"
                    name="Correo_Electronico"
                    type="email"
                    value={usuario.Correo_Electronico || ''}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Rol - Editable */}
                <div className="space-y-2">
                  <Label htmlFor="rol_id">
                    Rol <span className="text-red-500">*</span>
                  </Label>
                  {isLoadingRoles ? (
                    <div className="text-sm text-gray-500">Cargando roles...</div>
                  ) : (
                    <Select
                      value={selectedRolId}
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
    
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;
