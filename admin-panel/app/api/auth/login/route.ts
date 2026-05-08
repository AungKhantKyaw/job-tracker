import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
    const backendRes = await fetch(`${backendUrl}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // Get the JSON body (contains user info, no token)
    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || 'Login failed' },
        { status: backendRes.status }
      );
    }

    // Extract the Set-Cookie header from the backend response
    const setCookieHeader = backendRes.headers.get('set-cookie');
    if (!setCookieHeader) {
      console.error('Backend did not return a token cookie');
      return NextResponse.json(
        { error: 'Authentication failed - no cookie received' },
        { status: 500 }
      );
    }

    // Create the response that will go to the browser
    const response = NextResponse.json({ success: true, user: data.user });
    
    let modifiedCookie = setCookieHeader;
    if (process.env.NODE_ENV === 'production') {      
      modifiedCookie = setCookieHeader.replace(/SameSite=Strict/i, 'SameSite=Lax');
    }

    response.headers.set('Set-Cookie', modifiedCookie);

    return response;
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}