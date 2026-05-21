import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/oauth
 * Handles OAuth callbacks from Google and GitHub
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, code, email, name, picture } = body;

    if (!provider || !code) {
      return NextResponse.json(
        { error: 'Provider and code are required' },
        { status: 400 }
      );
    }

    // TODO: Exchange OAuth code for token
    // In production, you would:
    // 1. Call GitHub/Google API with the code
    // 2. Get user info from the OAuth provider
    // 3. Create or update user in your database
    // 4. Generate JWT token or session

    let user = {
      id: `${provider}_${Date.now()}`,
      email: email || '',
      name: name || 'User',
      picture: picture || '',
      provider: provider,
    };

    const response = NextResponse.json({
      success: true,
      user: user,
      message: `${provider} authentication successful`,
    });

    response.cookies.set({
      name: 'af_session',
      value: JSON.stringify(user),
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'OAuth authentication failed' },
      { status: 500 }
    );
  }
}
