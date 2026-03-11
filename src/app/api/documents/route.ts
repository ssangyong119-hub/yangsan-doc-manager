import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('documents')
      .select('*, company:companies(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: '문서 목록을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Documents list error:', error);
    return NextResponse.json(
      { error: '문서 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert(body)
      .select('*, company:companies(*)')
      .single();

    if (error) {
      console.error('Document creation error:', error);
      return NextResponse.json(
        { error: '문서 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: '문서 생성 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
