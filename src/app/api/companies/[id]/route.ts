import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('*, documents(*, renewal_history(*))')
      .eq('id', id)
      .eq('is_active', true)
      .eq('documents.is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Company detail error:', error);
    return NextResponse.json(
      { error: '업체 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('companies')
      .update(body)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Company update error:', error);
      return NextResponse.json(
        { error: '업체 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Company update error:', error);
    return NextResponse.json(
      { error: '업체 수정 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete: set is_active to false
    const { error } = await supabaseAdmin
      .from('companies')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Company delete error:', error);
      return NextResponse.json(
        { error: '업체 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: '업체가 삭제되었습니다.' });
  } catch (error) {
    console.error('Company delete error:', error);
    return NextResponse.json(
      { error: '업체 삭제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
