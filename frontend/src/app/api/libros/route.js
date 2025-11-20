export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const column = searchParams.get('column');
    const value = searchParams.get('value');
    
    const host = process.env.NEXT_PUBLIC_API_HOST;
    let url = `${host}/api/libros?page=${page}&limit=${limit}`;
    
    // Si hay búsqueda por columna, agregar parámetros de búsqueda
    if (column && value) {
      url += `&column=${encodeURIComponent(column)}&value=${encodeURIComponent(value)}`;
    }
    
    console.log('Proxy fetching libros:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Error fetching data from API', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
