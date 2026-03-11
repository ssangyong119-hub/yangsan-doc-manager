'use client';

import Link from 'next/link';
import { DocumentWithStatus } from '@/types';
import { formatDday, formatDate } from '@/lib/utils';
import { STATUS_CONFIG, CATEGORY_ICONS } from '@/lib/constants';

interface ExpiryTimelineProps {
  documents: DocumentWithStatus[];
}

export default function ExpiryTimeline({ documents }: ExpiryTimelineProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
      <div className="p-4 border-b border-gray-50">
        <h3 className="font-bold text-[#1A202C]">📅 만료 타임라인</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {documents.slice(0, 10).map((doc) => {
          const config = STATUS_CONFIG[doc.status];
          const icon = CATEGORY_ICONS[doc.category] || '📁';
          return (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors active:bg-gray-100/50"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span
                className="font-mono font-bold text-sm w-16 shrink-0"
                style={{ color: config.color }}
              >
                {formatDday(doc.dday)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A202C] truncate">
                  {icon} {doc.name}
                </p>
                <p className="text-xs text-[#718096] truncate">
                  {doc.company?.name} · {formatDate(doc.expiry_date)}
                </p>
              </div>
              <div
                className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: config.bg, color: config.textColor }}
              >
                {config.label}
              </div>
            </Link>
          );
        })}
        {documents.length === 0 && (
          <div className="p-8 text-center text-[#718096] text-sm">
            등록된 서류가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
