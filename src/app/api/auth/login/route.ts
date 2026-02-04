import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/session/auth';
import { isValidUsername, validateAccessCode } from '@/lib/config/users';

export async function POST(request: NextRequest) {
  try {
    const { token, username } = await request.json();

    if (!token || !username) {
      return NextResponse.json(
        { error: 'Missing access code or username' },
        { status: 400 }
      );
    }

    // Validate username exists in config
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid username' },
        { status: 401 }
      );
    }

    // Verify the provided access code matches the expected code for this user
    if (!validateAccessCode(username, token)) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Create session
    await login(username);

    return NextResponse.json({
      success: true,
      redirectUrl: `/${username}/viewer`,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
