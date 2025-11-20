import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validar campos requeridos
    const requiredFields = [ 'Idioma', 'Titulo', 'Lugar_Publicacion', 'Descripcion', 'Contenido', 'Tema_general', 'Coleccion'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos requeridos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // URL del backend real
    const backendUrl = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:3000';
    
    // Hacer la petición al backend
    const response = await fetch(`${backendUrl}/api/libros/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      return NextResponse.json(
        { error: errorData.error || 'Error al agregar el libro' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Libro agregado exitosamente',
        data 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en POST /api/libros/add:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
