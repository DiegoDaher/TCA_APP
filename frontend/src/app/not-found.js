'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-20 w-20 text-[var(--selected)]" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">404</CardTitle>
          <p className="text-xl text-gray-600 mt-2">Página no encontrada</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              Volver atrás
            </Button>
            <Link href="/">
              <Button className="flex items-center gap-2 bg-[var(--selected)] hover:bg-[var(--hoverselect)] text-white w-full sm:w-auto">
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
