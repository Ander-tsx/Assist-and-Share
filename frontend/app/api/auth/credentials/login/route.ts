import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('[Login] Calling backend:', backendUrl);

    let response;
    try {
      response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (fetchError) {
      console.error("[Login] Error connecting to backend:", fetchError);
      return NextResponse.json(
        { success: false, message: 'El servicio de autenticación no responde' },
        { status: 503 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Error al iniciar sesión' },
        { status: response.status }
      );
    }

    if (!data.success || !data.value?.token) {
      return NextResponse.json(
        { success: false, message: 'Respuesta inválida del servidor' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    };

    cookieStore.set('auth-token', data.value.token, cookieOptions);

    console.log(`[Login] Cookie establecida`);
    console.log(`[Login] Secure: ${isProduction}`);
    console.log(`[Login] Token (primeros 20 chars): ${data.value.token.substring(0, 20)}...`);

    const verification = cookieStore.get('auth-token');
    console.log(`[Login] Cookie verificada: ${!!verification}`);

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: data.value.user,
    });

  } catch (error) {
    console.error('[Login Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}