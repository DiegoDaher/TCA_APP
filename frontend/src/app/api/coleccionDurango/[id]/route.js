export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const host = process.env.NEXT_PUBLIC_API_HOST;
    const url = `${host}/api/colecciondurango/${id}`;
    
    console.log('Proxy updating coleccionDurango:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return Response.json(
        { error: 'Error updating data in API', status: response.status },
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
