import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { adminPassword } = await request.json();

    if (!adminPassword) {
      return NextResponse.json(
        { error: '관리자 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Fetch the admin password hash from app_settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('admin_password_hash')
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: '설정을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // Compare the provided admin password with the stored hash
    const isValid = await bcrypt.compare(adminPassword, settings.admin_password_hash);

    return NextResponse.json({ verified: isValid });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { error: '관리자 인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
