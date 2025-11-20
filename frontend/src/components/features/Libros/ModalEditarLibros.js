import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticatedFetch } from '@/lib/auth';

const ModalEditarLibros = ({ isOpen, onClose, libroId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState({}); // Datos originales del libro
  
  const [formData, setFormData] = useState({
    MFN: '',
    Id: '',
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

  // Cargar datos del libro cuando se abre el modal
  useEffect(() => {
    if (isOpen && libroId) {
      console.log('Fetching libro data for edit, ID:', libroId);
      setIsFetching(true);
      setError(null);
      
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      fetch(`${apiHost}/api/libros/byId/${libroId}`)
        .then((response) => {
          console.log('Response status:', response.status);
          if (!response.ok) {
            throw new Error(`Error fetching libro data: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Data received for edit:', data);
          if (data && data.data) {
            // Prellenar el formulario con los datos del libro
            const libroData = {
              MFN: data.data.MFN || '',
              Id: data.data.Id || '',
              Idioma: data.data.Idioma || '',
              Autor: data.data.Autor || '',
              Autor_Corporativo: data.data.Autor_Corporativo || '',
              Autor_Uniforme: data.data.Autor_Uniforme || '',
              Titulo: data.data.Titulo || '',
              Edicion: data.data.Edicion || '',
              Lugar_Publicacion: data.data.Lugar_Publicacion || '',
              Descripcion: data.data.Descripcion || '',
              Serie: data.data.Serie || '',
              Notas: data.data.Notas || '',
              Encuadernado_con: data.data.Encuadernado_con || '',
              Bibliografia: data.data.Bibliografia || '',
              Contenido: data.data.Contenido || '',
              Tema_general: data.data.Tema_general || '',
              Coautor_personal: data.data.Coautor_personal || '',
              Memorico_2020: data.data.Memorico_2020 || '',
              Memorico_2024: data.data.Memorico_2024 || '',
              Coleccion: data.data.Coleccion || ''
            };
            
            setFormData(libroData);
            setOriginalData(libroData); // Guardar los datos originales
          } else {
            throw new Error('Invalid data format received');
          }
          setIsFetching(false);
        })
        .catch((error) => {
          console.error('Error fetching libro data:', error);
          setError(error.message);
          setIsFetching(false);
        });
    } else if (!isOpen) {
      // Reiniciar estado cuando se cierra el modal
      setFormData({
        MFN: '',
        Id: '',
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
      setIsFetching(true);
      setError(null);
      setOriginalData({});
    }
  }, [libroId, isOpen]);

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

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
      
      // Comparar formData con originalData y solo enviar los campos modificados
      const modifiedFields = {};
      
      Object.keys(formData).forEach(key => {
        // Convertir valores vacíos a null para comparación consistente
        const formValue = formData[key] === '' ? null : formData[key];
        const originalValue = originalData[key] === '' ? null : originalData[key];
        
        // Solo incluir si el valor ha cambiado
        if (formValue !== originalValue) {
          // Convertir MFN a número si está presente y modificado
          if (key === 'MFN' && formValue !== null) {
            modifiedFields[key] = parseInt(formValue, 10);
          } else {
            modifiedFields[key] = formValue;
          }
        }
      });

      console.log('Campos modificados:', modifiedFields);

      // Si no hay campos modificados, no hacer la petición
      if (Object.keys(modifiedFields).length === 0) {
        toast.error('No se han realizado cambios', {
          duration: 3000,
          style: {
            background: '#f59e0b',
            color: 'white',
            border: 'none',
          },
        });
        setIsLoading(false);
        return;
      }

      const response = await authenticatedFetch(`${apiHost}/api/libros/${libroId}`, {
        method: 'PUT',
        body: JSON.stringify(modifiedFields)
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el libro: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Libro actualizado exitosamente:', result);
      
      // Mostrar notificación de éxito en verde
      toast.success('¡Libro actualizado exitosamente!', {
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
        // Recargar la página para ver los cambios
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error al actualizar el libro:', error);
      toast.error('Error al actualizar el libro', {
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
      MFN: '',
      Id: '',
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
    setOriginalData({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCancel}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
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
            <h2 className="text-xl font-semibold">Editar Libro</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              disabled={isLoading || isFetching}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="bg-[#801530] hover:bg-[#6b1128] text-white px-4 py-2 rounded text-sm transition-colors disabled:bg-gray-400"
              disabled={isLoading || isFetching}
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

          {isFetching ? (
            <div className="text-center py-12">Cargando datos del libro...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold mb-4">Información del libro</h3>
              
              {/* Grid de formulario */}
              <div className="space-y-4">
                {/* Fila 1: MFN y Número */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="MFN">
                      MFN <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="MFN"
                      name="MFN"
                      type="number"
                      value={formData.MFN}
                      onChange={handleInputChange}
                      placeholder="Ingrese MFN"
                      required
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Id">
                      Número (no se puede editar) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="Id"
                      name="Id"
                      value={formData.Id}
                      onChange={handleInputChange}
                      placeholder="Ingrese número"
                      required
                      disabled
                    />
                  </div>
                </div>

                <Separator />

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
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    required
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEditarLibros;
