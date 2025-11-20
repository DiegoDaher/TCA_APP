'use client';

import { useState, useEffect } from 'react';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from "@/lib/utils";

export default function SearchBar({ 
  searchTerm, 
  setSearchTerm, 
  showAdvancedFilter = false,
  columnsEndpoint = null,
  onSearch = null,
  defaultSearchColumn = 'Titulo'
}) {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [columns, setColumns] = useState([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Cargar columnas disponibles si se proporciona el endpoint
  useEffect(() => {
    async function fetchColumns() {
      setIsLoadingColumns(true);
      try {
        // Usar NEXT_PUBLIC_API_HOST si el endpoint no es una URL completa
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
        const fullUrl = columnsEndpoint.startsWith('http') 
          ? columnsEndpoint 
          : `${apiHost}${columnsEndpoint}`;
        
        const res = await fetch(fullUrl);
        if (!res.ok) {
          throw new Error("Error al cargar columnas");
        }
        const data = await res.json();
        const mappedColumns = Array.isArray(data) 
          ? data.map((col) => ({ value: col, label: col }))
          : data.columns?.map((col) => ({ value: col, label: col })) || [];
        setColumns(mappedColumns);
      } catch (error) {
        console.error("Error al cargar columnas:", error);
        setColumns([]);
      } finally {
        setIsLoadingColumns(false);
      }
    }

    if (showAdvancedFilter && columnsEndpoint) {
      fetchColumns();
    }
  }, [showAdvancedFilter, columnsEndpoint]);

  const handleSearch = () => {
    if (onSearch && searchTerm) {
      const columnToSearch = selectedColumn || defaultSearchColumn;
      console.log('SearchBar - Buscando:', { searchTerm, column: columnToSearch });
      onSearch({
        searchTerm,
        column: columnToSearch, // Si no hay columna seleccionada, usar defaultSearchColumn
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm) {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-2xl">
      {/* Barra de búsqueda - Ocupa todo el espacio disponible si no hay filtro */}
      <div className={cn(
        "flex items-center border border-[var(--selected)] rounded-md px-3 py-2 bg-white",
        showAdvancedFilter ? "flex-1" : "w-full"
      )}>
        <input
          type="search"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-1 outline-none text-black"
        />
        <button 
          className="ml-2 focus:outline-none w-6 h-6 flex items-center justify-center"
          onClick={handleSearch}
          disabled={!searchTerm}
        >
          <Search className="text-[var(--selected)]" />
        </button>
      </div>

      {/* Filtro de columnas - Solo aparece si showAdvancedFilter es true */}
      {showAdvancedFilter && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isPopoverOpen}
              className="w-[200px] justify-between bg-[var(--selected)] hover:bg-[var(--hoverselect)] flex-shrink-0"
            >
              {selectedColumn
                ? columns.find((col) => col.value === selectedColumn)?.label
                : "Seleccionar columna"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Buscar columna..." className="h-9" />
              <CommandList>
                <CommandEmpty>No se encontraron columnas.</CommandEmpty>
                <CommandGroup>
                  {columns.map((col) => (
                    <CommandItem
                      key={col.value}
                      value={col.value}
                      onSelect={() => {
                        setSelectedColumn(col.value === selectedColumn ? "" : col.value);
                        setIsPopoverOpen(false);
                      }}
                    >
                      <span>{col.label}</span>
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedColumn === col.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
