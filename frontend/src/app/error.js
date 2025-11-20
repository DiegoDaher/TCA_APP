'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-20 w-20 text-orange-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">500</CardTitle>
          <p className="text-xl text-gray-600 mt-2">Error del servidor</p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-2">
            Algo salió mal. Por favor, intenta nuevamente.
          </p>
          {error?.message && (
            <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-50 rounded-md">
              {error.message}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button
              onClick={reset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Intentar de nuevo
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
