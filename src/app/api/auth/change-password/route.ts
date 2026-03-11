import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword, type } = await request.json();

    if (!currentPassword || !newPassword || !type) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (type !== 'app' && type !== 'admin') {
      return NextResponse.json(
        { error: '유효하지 않은 비밀번호 유형입니다.' },
        { status: 400 }
      );
    }

    // Fetch current password hashes from app_settings
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

    // Verify admin password first (currentPassword must match admin password)
    const isAdminValid = await bcrypt.compare(currentPassword, settings.admin_password_hash);

    if (!isAdminValid) {
      return NextResponse.json(
        { error: '관리자 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // Hash the new password with 10 rounds
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update the appropriate password hash
    const updateField = type === 'app' ? 'app_password_hash' : 'admin_password_hash';

    const { error: updateError } = await supabaseAdmin
      .from('app_settings')
      .update({ [updateField]: newHash })
      .eq('id', 1);

    if (updateError) {
      return NextResponse.json(
        { error: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    // If changing app password, delete the auth-token cookie to force re-login
    if (type === 'app') {
      const cookieStore = await cookies();
      cookieStore.delete('auth-token');
    }

    return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: '비밀번호 변경 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
