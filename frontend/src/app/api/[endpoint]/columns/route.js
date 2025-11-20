export async function GET(request, { params }) {
  try {
    // Obtener el endpoint dinámico de los parámetros
    const { endpoint } = params;
    
    // Obtener el host del backend
    const host = process.env.NEXT_PUBLIC_API_HOST;
    const url = `${host}/api/${endpoint}/columns`;
    
    console.log('Fetching columns from:', url);
    
    // Hacer la petición al backend
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Error al obtener columnas del backend', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // El backend devuelve { message: "...", columns: [...] }
    // Devolver solo las columnas en formato de array
    if (data.columns && Array.isArray(data.columns)) {
      return Response.json(data.columns);
    }
    
    // Si no tiene el formato esperado, devolver el data completo
    return Response.json(data);
  } catch (error) {
    console.error('Error al obtener columnas:', error);
    return Response.json(
      { error: 'Error al obtener las columnas disponibles', message: error.message },
      { status: 500 }
    );
  }
}
