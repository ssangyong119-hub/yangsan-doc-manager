import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { renewal_date, new_expiry_date, notes } = await request.json();

    if (!renewal_date || !new_expiry_date) {
      return NextResponse.json(
        { error: '갱신일과 새 만료일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Verify the document exists
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, expiry_date')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: '문서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Create renewal history record
    const { error: renewalError } = await supabaseAdmin
      .from('renewal_history')
      .insert({
        document_id: id,
        renewal_date,
        previous_expiry_date: document.expiry_date,
        new_expiry_date,
        notes,
      });

    if (renewalError) {
      console.error('Renewal history creation error:', renewalError);
      return NextResponse.json(
        { error: '갱신 이력 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Update the document's expiry_date
    const { data: updatedDoc, error: updateError } = await supabaseAdmin
      .from('documents')
      .update({ expiry_date: new_expiry_date })
      .eq('id', id)
      .select('*, company:companies(*)')
      .single();

    if (updateError) {
      console.error('Document expiry update error:', updateError);
      return NextResponse.json(
        { error: '문서 만료일 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '문서가 갱신되었습니다.',
      document: updatedDoc,
    });
  } catch (error) {
    console.error('Document renewal error:', error);
    return NextResponse.json(
      { error: '문서 갱신 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
