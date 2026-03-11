import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*, document:documents(*, company:companies(*))')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Notifications list error:', error);
      return NextResponse.json(
        { error: '알림 목록을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Notifications list error:', error);
    return NextResponse.json(
      { error: '알림 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '읽음 처리할 알림 ID를 입력해주세요.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids);

    if (error) {
      console.error('Notifications mark read error:', error);
      return NextResponse.json(
        { error: '알림 읽음 처리에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: '알림이 읽음 처리되었습니다.' });
  } catch (error) {
    console.error('Notifications mark read error:', error);
    return NextResponse.json(
      { error: '알림 읽음 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
