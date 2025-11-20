import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { authenticatedFetch } from '@/lib/auth';

const ModalVerUsuario = ({ isOpen, onClose, usuarioId }) => {
  const [usuarioData, setUsuarioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && usuarioId) {
      console.log('Fetching usuario with ID:', usuarioId);
      setIsLoading(true);
      setError(null);
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      authenticatedFetch(`${apiHost}/api/auth/users/${usuarioId}`, {
        method: 'GET',
      })
        .then((response) => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error(`Error fetching usuario data: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Data received:', data);
          if (data && data.user) {
            setUsuarioData(data.user);
          } else {
            throw new Error('Invalid data format received');
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching usuario data:', error);
          setError(error.message);
          setIsLoading(false);
        });
    } else if (!isOpen) {
      // Reiniciar estado cuando se cierra el modal
      setUsuarioData(null);
      setIsLoading(true);
      setError(null);
    } else {
      console.log('No usuarioId provided');
      setIsLoading(false);
    }
  }, [usuarioId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="mr-4 flex items-center justify-center w-10 h-10 hover:bg-[var(--hoverselect)] rounded-full transition"
            >
              <Image
                src="/chevron-left.svg"
                alt="Volver"
                width={20}
                height={20}
              />
            </button>
            <h2 className="text-xl font-semibold">Ver Usuario</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-[#801530] hover:bg-[#6b1128] text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">Error: {error}</div>
          ) : usuarioData ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Información del usuario</h3>
              
              {/* Grid de información */}
              <div className="space-y-4">
                {/* Fila 1: ID y Status */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID</label>
                    <p className="mt-1 text-gray-900">{usuarioData.Id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        usuarioData.Status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuarioData.Status === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Fila 2: Nombre(s) y Apellido(s) */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre(s)</label>
                    <p className="mt-1 text-gray-900">{usuarioData.Nombres || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Apellido(s)</label>
                    <p className="mt-1 text-gray-900">{usuarioData.Apellidos || 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                {/* Correo Electrónico */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <p className="mt-1 text-gray-900">{usuarioData.Correo_Electronico}</p>
                </div>

                <Separator />

                {/* Roles */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Rol(es) Asignado(s)</label>
                  {usuarioData.roleSlugs && usuarioData.roleSlugs.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {usuarioData.roleSlugs.map((slug, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {slug}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-500 italic">Sin roles asignados</p>
                  )}
                </div>

                <Separator />

                {/* Información de roles detallada (opcional) */}
                {usuarioData.roles && usuarioData.roles.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Detalles de Roles</label>
                    <div className="mt-2 space-y-2">
                      {usuarioData.roles.map((role, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          <p className="text-sm">
                            <span className="font-medium">Nombre:</span> {role.nombre}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Descripción:</span> {role.descripcion || 'N/A'}
                          </p>
                          {role.asignado_en && (
                            <p className="text-xs text-gray-500 mt-1">
                              Asignado: {new Date(role.asignado_en).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">No se encontró información del usuario</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalVerUsuario;
