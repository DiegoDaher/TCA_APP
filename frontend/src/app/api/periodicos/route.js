import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const column = searchParams.get('column');
    const value = searchParams.get('value');

    console.log('API Periodicos - Params recibidos:', { page, limit, column, value });

    // Construir URL base con página y límite
    const host = process.env.NEXT_PUBLIC_API_HOST;
    let url = `${host}/api/periodicos?page=${page}&limit=${limit}`;

    // Si hay búsqueda por columna, agregar parámetros
    if (column && value) {
      url += `&column=${encodeURIComponent(column)}&value=${encodeURIComponent(value)}`;
    }

    console.log('API Periodicos - URL construida:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET /api/periodicos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los periódicos' },
      { status: 500 }
    );
  }
}
