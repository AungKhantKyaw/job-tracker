import { apiFetch } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

    // Forward the request to backend logout endpoint
    const backendRes = await apiFetch(`${backendUrl}/user/logout`, {
      method: 'POST',
      headers: {        
        Cookie: request.headers.get('cookie') || '',
      },
    });

    // Create response
    const response = NextResponse.json({ success: true });

    // Clear the token cookie on the frontend domain
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: -1,
    });
    
    const backendSetCookie = backendRes.headers.get('set-cookie');
    if (backendSetCookie) {
      response.headers.set('Set-Cookie', backendSetCookie);
    }

    return response;
  } catch (error) {
    console.error('Logout proxy error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}