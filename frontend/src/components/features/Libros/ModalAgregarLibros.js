import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ModalAgregarLibros = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    Idioma: '',
    Autor: '',
    Autor_Corporativo: '',
    Autor_Uniforme: '',
    Titulo: '',
    Edicion: '',
    Lugar_Publicacion: '',
    Descripcion: '',
    Serie: '',
    Notas: '',
    Encuadernado_con: '',
    Bibliografia: '',
    Contenido: '',
    Tema_general: '',
    Coautor_personal: '',
    Memorico_2020: '',
    Memorico_2024: '',
    Coleccion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validar campos requeridos antes de enviar
    const requiredFields = [
      'Idioma',
      'Titulo',
      'Lugar_Publicacion',
      'Descripcion',
      'Contenido',
      'Tema_general',
      'Coleccion'
    ];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    if (missingFields.length > 0) {
      toast.error(`Faltan campos requeridos: ${missingFields.join(', ')}`, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
        },
      });
      setIsLoading(false);
      return;
    }

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      // Limpiar campos vacíos o solo espacios
      const dataToSend = {};
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'string' && formData[key].trim() !== '') {
          dataToSend[key] = formData[key].trim();
        }
      });
      // Asegura que el campo es 'Titulo' sin tilde
      dataToSend.Titulo = formData.Titulo.trim();

      const response = await fetch(`${apiHost}/api/libros/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (!response.ok) {
        // Mostrar mensaje de error real del backend si existe
        toast.error(result?.error || `Error al guardar el libro: ${response.statusText}`, {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: 'white',
            border: 'none',
          },
        });
        setError(result?.error || response.statusText);
        setIsLoading(false);
        return;
      }

      console.log('Libro guardado exitosamente:', result);
      // Mostrar notificación de éxito en verde
      toast.success('¡Libro guardado exitosamente!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
        },
      });
      // Resetear el formulario
      setFormData({
        Idioma: '',
        Autor: '',
        Autor_Corporativo: '',
        Autor_Uniforme: '',
        Titulo: '',
        Edicion: '',
        Lugar_Publicacion: '',
        Descripcion: '',
        Serie: '',
        Notas: '',
        Encuadernado_con: '',
        Bibliografia: '',
        Contenido: '',
        Tema_general: '',
        Coautor_personal: '',
        Memorico_2020: '',
        Memorico_2024: '',
        Coleccion: ''
      });
      // Cerrar el modal después de 1 segundo
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar para mostrar el nuevo libro
      }, 1000);
    } catch (error) {
      console.error('Error al guardar el libro:', error);
      toast.error('Error al guardar el libro', {
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
      Idioma: '',
      Autor: '',
      Autor_Corporativo: '',
      Autor_Uniforme: '',
      Titulo: '',
      Edicion: '',
      Lugar_Publicacion: '',
      Descripcion: '',
      Serie: '',
      Notas: '',
      Encuadernado_con: '',
      Bibliografia: '',
      Contenido: '',
      Tema_general: '',
      Coautor_personal: '',
      Memorico_2020: '',
      Memorico_2024: '',
      Coleccion: ''
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCancel}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            {/* Botón para regresar a la página anterior */}
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
          <h2 className="text-xl font-semibold">Agregar Libro</h2>
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
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Registro'}
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
            <h3 className="text-lg font-semibold mb-4">Información del libro</h3>
            
            {/* Grid de formulario */}
            <div className="space-y-4">
              {/* Fila 2: Idioma y Autor(es) */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Idioma">
                    Idioma <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Idioma"
                    name="Idioma"
                    value={formData.Idioma}
                    onChange={handleInputChange}
                    placeholder="Ej: Español"
                    className="placeholder:text-[var(--selected)]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Autor">Autor(es)</Label>
                  <Input
                    id="Autor"
                    name="Autor"
                    value={formData.Autor}
                    onChange={handleInputChange}
                    placeholder="Ingrese autor(es)"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
              </div>

              <Separator />

              {/* Fila 3: Autor Uniforme y Autor Corporativo */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Autor_Uniforme">Autor Uniforme</Label>
                  <Input
                    id="Autor_Uniforme"
                    name="Autor_Uniforme"
                    value={formData.Autor_Uniforme}
                    onChange={handleInputChange}
                    placeholder="Ingrese autor uniforme"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Autor_Corporativo">Autor Corporativo</Label>
                  <Input
                    id="Autor_Corporativo"
                    name="Autor_Corporativo"
                    value={formData.Autor_Corporativo}
                    onChange={handleInputChange}
                    placeholder="Ingrese autor corporativo"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
              </div>

              <Separator />

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="Titulo">
                  Título <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="Titulo"
                  name="Titulo"
                  value={formData.Titulo}
                    className="placeholder:text-[var(--selected)] flex h-20 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={handleInputChange}
                  placeholder="Ingrese título del libro"
                  required
                />
              </div>

              <Separator />

              {/* Fila 4: Edición y Lugar Publicación */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Edicion">Edición</Label>
                  <Input
                    id="Edicion"
                    name="Edicion"
                    value={formData.Edicion}
                    onChange={handleInputChange}
                    placeholder="Ej: Primera edición"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Lugar_Publicacion">
                    Lugar Publicación <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Lugar_Publicacion"
                    name="Lugar_Publicacion"
                    value={formData.Lugar_Publicacion}
                    onChange={handleInputChange}
                    placeholder="Ej: Ciudad, País"
                    className="placeholder:text-[var(--selected)]"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Fila 5: Descripción y Serie */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Descripcion">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Descripcion"
                    name="Descripcion"
                    value={formData.Descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripción del libro"
                    className="placeholder:text-[var(--selected)]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Serie">Serie</Label>
                  <Input
                    id="Serie"
                    name="Serie"
                    value={formData.Serie}
                    onChange={handleInputChange}
                    placeholder="Ingrese serie"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
              </div>

              <Separator />

              {/* Fila 6: Contenido y Bibliografía */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Contenido">
                    Contenido <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="Contenido"
                    name="Contenido"
                    value={formData.Contenido}
                    onChange={handleInputChange}
                    placeholder="Contenido del libro"
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--selected)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Bibliografia">Bibliografía</Label>
                  <textarea
                    id="Bibliografia"
                    name="Bibliografia"
                    value={formData.Bibliografia}
                    onChange={handleInputChange}
                    placeholder="Bibliografía"
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--selected)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <Separator />

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="Notas">Notas</Label>
                <textarea
                  id="Notas"
                  name="Notas"
                  value={formData.Notas}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales"
                  className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--selected)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Separator />

              {/* Fila 7: Encuadernado con y Coautor personal */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Encuadernado_con">Encuadernado con</Label>
                  <Input
                    id="Encuadernado_con"
                    name="Encuadernado_con"
                    value={formData.Encuadernado_con}
                    onChange={handleInputChange}
                    placeholder="Encuadernado con"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Coautor_personal">Coautor personal</Label>
                  <Input
                    id="Coautor_personal"
                    name="Coautor_personal"
                    value={formData.Coautor_personal}
                    onChange={handleInputChange}
                    placeholder="Coautor personal"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
              </div>

              <Separator />

              {/* Fila 8: Memorico 2020 y Memorico 2024 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Memorico_2020">Memorico 2020</Label>
                  <Input
                    id="Memorico_2020"
                    name="Memorico_2020"
                    value={formData.Memorico_2020}
                    onChange={handleInputChange}
                    placeholder="Memorico 2020"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Memorico_2024">Memorico 2024</Label>
                  <Input
                    id="Memorico_2024"
                    name="Memorico_2024"
                    value={formData.Memorico_2024}
                    onChange={handleInputChange}
                    placeholder="Memorico 2024"
                    className="placeholder:text-[var(--selected)]"
                  />
                </div>
              </div>

              <Separator />

              {/* Fila 9: Tema General */}
              <div className="space-y-2">
                <Label htmlFor="Tema_general">
                  Tema General <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Tema_general"
                  name="Tema_general"
                  value={formData.Tema_general}
                  onChange={handleInputChange}
                  placeholder="Tema general del libro"
                  className="placeholder:text-[var(--selected)]"
                  required
                />
              </div>

              <Separator />

              {/* Fila 10: Colección */}
              <div className="space-y-2">
                <Label htmlFor="Coleccion">
                  Colección <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="Coleccion"
                  name="Coleccion"
                  value={formData.Coleccion}
                  onChange={handleInputChange}
                  placeholder="Colección"
                  className="placeholder:text-[var(--selected)]"
                  required
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarLibros;
