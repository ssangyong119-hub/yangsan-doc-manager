import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // List companies with document counts
    const { data: companies, error } = await supabaseAdmin
      .from('companies')
      .select('*, documents(id)')
      .eq('is_active', true)
      .eq('documents.is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Companies list error:', error);
      return NextResponse.json(
        { error: '업체 목록을 불러올 수 없습니다.' },
        { status: 500 }
      );
    }

    // Transform to include document_count instead of raw documents array
    const companiesWithCounts = companies.map((company) => {
      const { documents, ...rest } = company;
      return {
        ...rest,
        document_count: Array.isArray(documents) ? documents.length : 0,
      };
    });

    return NextResponse.json(companiesWithCounts);
  } catch (error) {
    console.error('Companies list error:', error);
    return NextResponse.json(
      { error: '업체 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('companies')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Company creation error:', error);
      return NextResponse.json(
        { error: '업체 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Company creation error:', error);
    return NextResponse.json(
      { error: '업체 생성 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
