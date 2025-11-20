'use client';

import { useState, useEffect } from 'react';
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Search, Library, Book, Newspaper, Scale } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import DataTable from '@/components/DataTableClient';
import { authenticatedFetch } from '@/lib/auth';


// Importar modales de Colección Durango
import ModalVerColeccionDurango from '@/components/features/coleccionDurango/ModalVerColeccionDurango';
import ModalEditarColeccionDurango from '@/components/features/coleccionDurango/ModalEditarColeccionDurango';

// Importar modales de Libros
import ModalVerLibros from '@/components/features/Libros/ModalVerLibros';
import ModalEditarLibros from '@/components/features/Libros/ModalEditarLibros';

// Importar modales de Periódicos
import ModalVerPeriodicos from '@/components/features/Periodicos/ModalVerPeriodicos';
import ModalEditarPeriodicos from '@/components/features/Periodicos/ModalEditarPeriodicos';

// Importar modales de Diario Oficial
import ModalVerDiarioOficial from '@/components/features/DiarioOficial/ModalVerDiarioOficial';
import ModalEditarDiarioOficial from '@/components/features/DiarioOficial/ModalEditarDiarioOficial';

export default function HomePage() {
  const [recentItems, setRecentItems] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para controlar modales de agregados recientes
  const [modalStateRecent, setModalStateRecent] = useState({
    ver: { isOpen: false, type: null, id: null },
    editar: { isOpen: false, type: null, id: null }
  });

  // Estados para controlar modal de eliminados
  const [modalStateDeleted, setModalStateDeleted] = useState({
    ver: { isOpen: false, type: null, id: null }
  });

  // Función para obtener items recientes
  const fetchRecentItems = async () => {
    try {
      const host = process.env.NEXT_PUBLIC_API_HOST;
      const res = await fetch(`${host}/api/auditoria/registros?page=1&limit=5`, {
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error('Error al obtener los datos');
      
      const response = await res.json();
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(item => ({
          type: item.tabla_afectada || 'file',
          number: item.id_registro?.toString() || '',
          title: item.titulo || '',
          period: item.Periodo || '',
          year: item.Año || item.Tema_general || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching recent items:', error);
      return [];
    }
  };

  // Función para obtener items eliminados
  const fetchDeletedItems = async () => {
    try {
      const host = process.env.NEXT_PUBLIC_API_HOST;
      const res = await fetch(`${host}/api/auditoria/eliminados?page=1&limit=5`, {
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error('Error al obtener los datos');
      
      const response = await res.json();
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map(item => ({
          type: item.tabla_afectada || 'file',
          number: item.id_registro?.toString() || '',
          title: item.titulo || '',
          period: item.Periodo || '',
          year: item.Año || item.Tema_general || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      return [];
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [recent, deleted] = await Promise.all([
        fetchRecentItems(),
        fetchDeletedItems()
      ]);
      setRecentItems(recent);
      setDeletedItems(deleted);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Funciones para manejar modales de items recientes
  const handleOpenVerModalRecent = (item) => {
    setModalStateRecent(prev => ({
      ...prev,
      ver: { isOpen: true, type: item.type, id: item.number }
    }));
  };

  const handleCloseVerModalRecent = () => {
    setModalStateRecent(prev => ({
      ...prev,
      ver: { isOpen: false, type: null, id: null }
    }));
  };

  const handleOpenEditarModalRecent = (item) => {
    setModalStateRecent(prev => ({
      ...prev,
      editar: { isOpen: true, type: item.type, id: item.number }
    }));
  };

  const handleCloseEditarModalRecent = () => {
    setModalStateRecent(prev => ({
      ...prev,
      editar: { isOpen: false, type: null, id: null }
    }));
  };

  // Función para eliminar desde items recientes
  const handleDeleteRecent = async (item) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de dar de baja el registro ${item.number}?`,
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#801530",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'rounded-md px-4 py-2',
        cancelButton: 'rounded-md px-4 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        const host = process.env.NEXT_PUBLIC_API_HOST;
        let apiPath = '';
        
        switch(item.type) {
          case 'coleccion_durango': apiPath = 'coleccionDurango'; break;
          case 'libros': apiPath = 'libros'; break;
          case 'periodicos': apiPath = 'periodicos'; break;
          case 'diario_oficial': apiPath = 'diario-oficial'; break;
          default:
            await Swal.fire({
              title: "Error",
              text: "Tipo de tabla no reconocido",
              icon: "error",
              confirmButtonColor: "#801530"
            });
            return;
        }
        
        const response = await authenticatedFetch(`${host}/api/${apiPath}/deactivate/${item.number}`, { method: 'PUT' });
        
        if (response.ok) {
          await Swal.fire({
            title: "¡Eliminado!",
            text: "El registro ha sido dado de baja exitosamente.",
            icon: "success",
            confirmButtonColor: "#801530"
          });
          toast.success('Registro eliminado exitosamente');
          window.location.reload();
        } else {
          const errorData = await response.json();
          await Swal.fire({
            title: "Error",
            text: `Hubo un problema al eliminar el registro: ${errorData.message || response.statusText}`,
            icon: "error",
            confirmButtonColor: "#801530"
          });
        }
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          title: "Error",
          text: "Hubo un problema al eliminar el registro.",
          icon: "error",
          confirmButtonColor: "#801530"
        });
      }
    }
  };

  // Funciones para manejar modales de items eliminados
  const handleOpenVerModalDeleted = (item) => {
    setModalStateDeleted({
      ver: { isOpen: true, type: item.type, id: item.number }
    });
  };

  const handleCloseVerModalDeleted = () => {
    setModalStateDeleted({
      ver: { isOpen: false, type: null, id: null }
    });
  };

  // Función para restaurar desde items eliminados
  const handleRestoreDeleted = async (item) => {
    const result = await Swal.fire({
      title: `¿Estás seguro de restaurar el registro ${item.number}?`,
      text: "Este registro volverá a estar activo",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#801530",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'rounded-md px-4 py-2',
        cancelButton: 'rounded-md px-4 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        const host = process.env.NEXT_PUBLIC_API_HOST;
        let apiPath = '';
        
        switch(item.type) {
          case 'coleccion_durango': apiPath = 'coleccionDurango'; break;
          case 'libros': apiPath = 'libros'; break;
          case 'periodicos': apiPath = 'periodicos'; break;
          case 'diario_oficial': apiPath = 'diario-oficial'; break;
          default:
            await Swal.fire({
              title: "Error",
              text: "Tipo de tabla no reconocido",
              icon: "error",
              confirmButtonColor: "#801530"
            });
            return;
        }
        
        const response = await authenticatedFetch(`${host}/api/${apiPath}/restore/${item.number}`, { method: 'PUT' });
        
        if (response.ok) {
          await Swal.fire({
            title: "¡Restaurado!",
            text: "El registro ha sido restaurado exitosamente.",
            icon: "success",
            confirmButtonColor: "#801530"
          });
          toast.success('Registro restaurado exitosamente');
          window.location.reload();
        } else {
          const errorData = await response.json();
          await Swal.fire({
            title: "Error",
            text: `Hubo un problema al restaurar el registro: ${errorData.message || response.statusText}`,
            icon: "error",
            confirmButtonColor: "#801530"
          });
        }
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          title: "Error",
          text: "Hubo un problema al restaurar el registro.",
          icon: "error",
          confirmButtonColor: "#801530"
        });
      }
    }
  };
  return (
    <div className="space-y-8">
  {        /* Sección del Buscador */}          
  <div
              className="relative rounded-lg shadow-sm text-center bg-cover bg-center p-8"
              style={{ backgroundImage: "url('/TCALandPage.png')" }}
          >
              <h1 className="text-4xl font-bold text-white mb-4">Torre de Colecciones Antiguas</h1>
              <div className="max-w-xl mx-auto relative">
              <Input
                type="search"
                placeholder="Buscar libro"
                className="pl-10 h-12 placeholder-[var(--selected)] focus:placeholder-[var(--selected)] transition-colors w-full"
                style={{ color: 'white' }}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--selected)]" />
              </div>
          </div>

          {/* Sección de Agregados Recientemente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agregados Recientemente</CardTitle>
          <Button variant="outline"><Link href="/agregados">Ver más →</Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <DataTable 
              items={recentItems} 
              onView={handleOpenVerModalRecent}
              onEdit={handleOpenEditarModalRecent}
              onDelete={handleDeleteRecent}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Sección de Eliminados Recientemente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Eliminados Recientemente</CardTitle>
          <Button variant="outline"><Link href="/eliminados">Ver más →</Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <DataTable 
              items={deletedItems} 
              showRestoreOnly={true}
              onView={handleOpenVerModalDeleted}
              onRestore={handleRestoreDeleted}
            />
          )}
        </CardContent>
      </Card>

      {/* Modales de Ver para items recientes */}
      {modalStateRecent.ver.type === 'coleccion_durango' && (
        <ModalVerColeccionDurango
          isOpen={modalStateRecent.ver.isOpen}
          onClose={handleCloseVerModalRecent}
          libroId={modalStateRecent.ver.id}
        />
      )}
      {modalStateRecent.ver.type === 'libros' && (
        <ModalVerLibros
          isOpen={modalStateRecent.ver.isOpen}
          onClose={handleCloseVerModalRecent}
          libroId={modalStateRecent.ver.id}
        />
      )}
      {modalStateRecent.ver.type === 'periodicos' && (
        <ModalVerPeriodicos
          isOpen={modalStateRecent.ver.isOpen}
          onClose={handleCloseVerModalRecent}
          libroId={modalStateRecent.ver.id}
        />
      )}
      {modalStateRecent.ver.type === 'diario_oficial' && (
        <ModalVerDiarioOficial
          isOpen={modalStateRecent.ver.isOpen}
          onClose={handleCloseVerModalRecent}
          libroId={modalStateRecent.ver.id}
        />
      )}

      {/* Modales de Editar para items recientes */}
      {modalStateRecent.editar.type === 'coleccion_durango' && (
        <ModalEditarColeccionDurango
          isOpen={modalStateRecent.editar.isOpen}
          onClose={handleCloseEditarModalRecent}
          libroId={modalStateRecent.editar.id}
        />
      )}
      {modalStateRecent.editar.type === 'libros' && (
        <ModalEditarLibros
          isOpen={modalStateRecent.editar.isOpen}
          onClose={handleCloseEditarModalRecent}
          libroId={modalStateRecent.editar.id}
        />
      )}
      {modalStateRecent.editar.type === 'periodicos' && (
        <ModalEditarPeriodicos
          isOpen={modalStateRecent.editar.isOpen}
          onClose={handleCloseEditarModalRecent}
          libroId={modalStateRecent.editar.id}
        />
      )}
      {modalStateRecent.editar.type === 'diario_oficial' && (
        <ModalEditarDiarioOficial
          isOpen={modalStateRecent.editar.isOpen}
          onClose={handleCloseEditarModalRecent}
          libroId={modalStateRecent.editar.id}
        />
      )}

      {/* Modales de Ver para items eliminados */}
      {modalStateDeleted.ver.type === 'coleccion_durango' && (
        <ModalVerColeccionDurango
          isOpen={modalStateDeleted.ver.isOpen}
          onClose={handleCloseVerModalDeleted}
          libroId={modalStateDeleted.ver.id}
        />
      )}
      {modalStateDeleted.ver.type === 'libros' && (
        <ModalVerLibros
          isOpen={modalStateDeleted.ver.isOpen}
          onClose={handleCloseVerModalDeleted}
          libroId={modalStateDeleted.ver.id}
        />
      )}
      {modalStateDeleted.ver.type === 'periodicos' && (
        <ModalVerPeriodicos
          isOpen={modalStateDeleted.ver.isOpen}
          onClose={handleCloseVerModalDeleted}
          libroId={modalStateDeleted.ver.id}
        />
      )}
      {modalStateDeleted.ver.type === 'diario_oficial' && (
        <ModalVerDiarioOficial
          isOpen={modalStateDeleted.ver.isOpen}
          onClose={handleCloseVerModalDeleted}
          libroId={modalStateDeleted.ver.id}
        />
      )}
    </div>
  );
}

// Función para obtener el ícono según el tipo de tabla
function getTableIcon(type) {
  switch (type) {
    case 'coleccion_durango':
      return Library;
    case 'libros':
      return Book;
    case 'periodicos':
      return Newspaper;
    case 'diario_oficial':
      return Scale;
    default:
      return Library; // Icono por defecto
  }
}

// DataTable is rendered by a client component `DataTableClient` to allow interactivity