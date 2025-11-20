// src/components/ui/Sidebar.js
'use client'; // Necesario para usar hooks como usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Book, Newspaper, Scale, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Coleccion Durango', href: '/coleccion', icon: Library },
  { name: 'Libros', href: '/libros', icon: Book },
  { name: 'Periódicos', href: '/periodicos', icon: Newspaper },
  { name: 'Diario Oficial', href: '/diario-oficial', icon: Scale },
  { name: 'Usuarios', href: '/usuarios', icon: User, requiresRole: 'administrador' },
];

export default function Sidebar({ mobile = false }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleSlug) => {
    if (!user || !user.roleSlugs) return false;
    return user.roleSlugs.includes(roleSlug);
  };

  // Filtrar links según los roles del usuario
  const visibleLinks = navLinks.filter(link => {
    if (link.requiresRole) {
      return hasRole(link.requiresRole);
    }
    return true;
  });

  return (
    <aside className={`w-64 flex flex-col bg-[var(--whitealt)] text-black p-4 ${mobile ? '' : 'hidden md:flex'}`}>
      <div className="mb-8 text-center">
        <Image src="/ICEDbn.png" alt="Logo" width={100} height={100} className="mx-auto mb-4" />
      </div>
      <nav className="flex flex-col space-y-2">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[var(--selected)] text-white'
                  : 'text-black hover:bg-[var(--hoverselect)] hover:text-white'
              }`}
            >
              <link.icon className="mr-3 h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}