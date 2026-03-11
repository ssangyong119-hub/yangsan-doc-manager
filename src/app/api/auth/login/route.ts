import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-server';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Fetch the app password hash from app_settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('app_password_hash')
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: '설정을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // Compare the provided password with the stored hash
    const isValid = await bcrypt.compare(password, settings.app_password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({ authenticated: true });

    // Set httpOnly cookie with 7-day expiry
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
