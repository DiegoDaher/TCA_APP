'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SearchBar from './SearchBar';

export default function HeaderSon({ 
  title, 
  searchTerm, 
  setSearchTerm,
  showAdvancedFilter = false,
  columnsEndpoint = null,
  onSearch = null,
  showAddButton = false,
  onAddClick = null,
  defaultSearchColumn = 'Titulo'
}) {
  const router = useRouter();

  const handleBackAction = () => {
    const previousUrl = document.referrer;
    const currentUrl = window.location.href;

    try {
        const previousDomain = new URL(previousUrl).hostname;
        const currentDomain = new URL(currentUrl).hostname;

        if (previousDomain !== currentDomain) {
            // If the previous domain is different, reload the page
            window.location.reload();
        } else {
            // If the previous route is the same as the current route, reload the page
            if (previousUrl === currentUrl) {
                window.location.reload();
            } else {
                // Otherwise, navigate back
                router.back();
            }
        }
    } catch (error) {
        // In case of any error, reload the page as a fallback
        window.location.reload();
    }
};

return (
    <header className="bg-[var(--whitealt)] text-white p-4 flex items-center justify-between">
        {/* Botón para regresar a la página anterior */}
        <div className="flex items-center gap-4">
            <button
                onClick={handleBackAction}
                className="mr-4 flex items-center justify-center w-10 h-10 hover:bg-[var(--hoverselect)] rounded-full transition"
            >
                <Image
                    src="/chevron-left.svg"
                    alt="Volver"
                    width={20}
                    height={20}
                />
            </button>
            <h1 className="text-2xl text-gray-800 font-bold">{title}</h1>
            
        </div>
        
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          showAdvancedFilter={showAdvancedFilter}
          columnsEndpoint={columnsEndpoint}
          onSearch={onSearch}
          defaultSearchColumn={defaultSearchColumn}
          />
          {/* Botón de Agregar (condicional) */}
          {showAddButton && (
              <button
                  onClick={onAddClick}
                  className=" flex items-center ml-4 px-4 py-2 bg-[var(--selected)] hover:bg-[var(--hoverselect)] text-white rounded-md transition"
              >
                  <Image
                      src="/plus.svg"
                      className="filter invert"
                      alt="Agregar"
                      width={20}
                      height={20}
                  />
                  <span className="font-medium">Agregar</span>
              </button>
          )}
    </header>
);
}
