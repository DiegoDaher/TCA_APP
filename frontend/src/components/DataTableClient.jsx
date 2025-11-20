"use client";

import React from 'react';
import Image from 'next/image';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Library, Book, Newspaper, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/auth';

function getIconComponent(type) {
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
      return Library;
  }
}

export default function DataTable({ items = [], showRestoreOnly = false, onView, onEdit, onDelete, onRestore }) {
  const { isAuthenticated } = useAuth();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Número</TableHead>
          <TableHead>Título / Periodo</TableHead>
          <TableHead>Año / Tema General</TableHead>
          <TableHead>Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items && items.length > 0 ? (
          items.map((item, index) => {
            const IconComponent = getIconComponent(item.type);
            return (
              <TableRow key={item.number || index}>
                <TableCell>
                  {IconComponent ? <IconComponent className="h-5 w-5 text-[var(--selected)]" /> : <span className="h-5 w-5 inline-block" />}
                </TableCell>
                <TableCell>{item.number}</TableCell>
                <TableCell className="font-medium">{item.title} {item.period}</TableCell>
                <TableCell>{item.year}</TableCell>
                {showRestoreOnly ? (
                  <TableCell className="flex space-x-4">
                    <button type="button" onClick={() => onView && onView(item)} aria-label={`Ver ${item.number}`}>
                      <Image width={25} height={25} src="/read.png" alt="Ver Detalles" className="h-5 w-5" />
                    </button>
                    {isAuthenticated && (
                      <button type="button" onClick={() => onRestore && onRestore(item)} aria-label={`Restaurar ${item.number}`}>
                        <Image width={25} height={25} src="/restore.png" alt="Restaurar" className="h-5 w-5" />
                      </button>
                    )}
                  </TableCell>
                ) : (
                  <TableCell className="flex space-x-4">
                    <button type="button" onClick={() => onView && onView(item)} aria-label={`Ver ${item.number}`}>
                      <Image width={25} height={25} src="/read.png" alt="Ver Detalles" className="h-5 w-5" />
                    </button>
                    {isAuthenticated && (
                      <>
                        <button type="button" onClick={() => onEdit && onEdit(item)} aria-label={`Editar ${item.number}`}>
                          <Image width={25} height={25} src="/edit.png" alt="Editar" className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => onDelete && onDelete(item)} aria-label={`Eliminar ${item.number}`}>
                          <Image width={25} height={25} src="/delete.png" alt="Eliminar" className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500">
              No hay registros disponibles
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
