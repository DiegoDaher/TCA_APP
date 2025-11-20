export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const host = process.env.NEXT_PUBLIC_API_HOST;
    const url = `${host}/api/colecciondurango/byId/${id}`;
    
    console.log('Proxy fetching coleccionDurango by ID:', url);
    
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
