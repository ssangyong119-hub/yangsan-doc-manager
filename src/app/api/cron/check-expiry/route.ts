import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const THRESHOLDS = [
  { days: 90, type: 'D-90', message: '만료 90일 전' },
  { days: 30, type: 'D-30', message: '만료 30일 전' },
  { days: 7, type: 'D-7', message: '만료 7일 전' },
  { days: 1, type: 'D-1', message: '만료 1일 전' },
  { days: 0, type: 'D-Day', message: '만료일 당일' },
];

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Fetch all active documents with expiry dates
    const { data: documents, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, title, expiry_date, company_id, company:companies(name)')
      .eq('is_active', true)
      .not('expiry_date', 'is', null);

    if (docError) {
      console.error('Fetch documents error:', docError);
      return NextResponse.json(
        { error: '문서 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notificationsCreated: string[] = [];

    for (const doc of documents || []) {
      const expiryDate = new Date(doc.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      for (const threshold of THRESHOLDS) {
        if (diffDays !== threshold.days) continue;

        // Check if a notification of the same type already exists for this document in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: existing, error: existError } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('document_id', doc.id)
          .eq('type', threshold.type)
          .gte('created_at', twentyFourHoursAgo)
          .limit(1);

        if (existError) {
          console.error('Notification check error:', existError);
          continue;
        }

        if (existing && existing.length > 0) {
          // Notification already exists within 24 hours, skip
          continue;
        }

        // Determine company name from the joined data
        const companyName =
          doc.company && typeof doc.company === 'object' && 'name' in doc.company
            ? (doc.company as { name: string }).name
            : '';

        // Create the notification
        const { error: insertError } = await supabaseAdmin
          .from('notifications')
          .insert({
            document_id: doc.id,
            type: threshold.type,
            title: `[${threshold.type}] ${doc.title}`,
            message: `${companyName ? companyName + ' - ' : ''}${doc.title}: ${threshold.message}입니다. (만료일: ${doc.expiry_date})`,
          });

        if (insertError) {
          console.error('Notification creation error:', insertError);
          continue;
        }

        notificationsCreated.push(`${doc.title} - ${threshold.type}`);
      }
    }

    return NextResponse.json({
      success: true,
      checked: documents?.length || 0,
      notifications_created: notificationsCreated.length,
      details: notificationsCreated,
    });
  } catch (error) {
    console.error('Cron check-expiry error:', error);
    return NextResponse.json(
      { error: '만료 확인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
