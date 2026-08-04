import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const compilerUrl = process.env.NODE_ENV === 'production'
       ? 'http://192.168.60.92:8000'
       : 'http://labai.polinema.ac.id:90';

    const response = await fetch(compilerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to compile', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Compiler proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error while connecting to compiler' },
      { status: 500 }
    );
  }
}
