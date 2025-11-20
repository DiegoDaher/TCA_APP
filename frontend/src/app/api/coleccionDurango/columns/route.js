export async function GET(request) {
  try {
    const host = process.env.NEXT_PUBLIC_API_HOST;
    const url = `${host}/api/colecciondurango/columns`;
    
    console.log('Proxy fetching coleccionDurango columns:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Error fetching columns from API', status: response.status },
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
