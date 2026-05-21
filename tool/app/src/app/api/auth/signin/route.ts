import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/signin
 * Handles user sign-in with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Add real authentication here
    // For now, accept any email/password (just for testing)
    // In production, you would:
    // 1. Query your database for the user
    // 2. Hash and compare passwords
    // 3. Generate JWT tokens
    // 4. Return session cookies

    // Mock user data
    const user = {
      id: '123',
      email: email,
      name: email.split('@')[0],
      picture: '',
    };

    // In production, create a secure session/token here
    const response = NextResponse.json({
      success: true,
      user: user,
      message: 'Sign-in successful',
    });

    // Set a cookie for the session (optional, for production)
    response.cookies.set({
      name: 'af_session',
      value: JSON.stringify(user),
      maxAge: 7 * 24 * 60 * 60, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
