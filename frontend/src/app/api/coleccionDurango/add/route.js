export async function POST(request) {
  try {
    const body = await request.json();
    
    const host = process.env.NEXT_PUBLIC_API_HOST;
    const url = `${host}/api/colecciondurango/add`;
    
    console.log('Proxy adding coleccionDurango:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Error adding data to API', status: response.status },
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
