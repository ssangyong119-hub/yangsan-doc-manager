'use client';

import Link from 'next/link';
import { DocumentWithStatus } from '@/types';
import { formatDday, formatDate, getProgressPercentage } from '@/lib/utils';
import { STATUS_CONFIG, CATEGORY_ICONS } from '@/lib/constants';

interface DocumentCardProps {
  document: DocumentWithStatus;
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
  const config = STATUS_CONFIG[doc.status];
  const icon = CATEGORY_ICONS[doc.category] || '📁';
  const progress = getProgressPercentage(doc.dday, doc.renewal_cycle);

  return (
    <Link
      href={`/documents/${doc.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        {/* D-day */}
        <div
          className="shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center"
          style={{ backgroundColor: config.bg }}
        >
          <span
            className="font-mono font-bold text-lg leading-tight"
            style={{ color: config.color }}
          >
            {formatDday(doc.dday)}
          </span>
          <span
            className="text-[10px] font-medium"
            style={{ color: config.textColor }}
          >
            {config.label}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{icon}</span>
            <span className="text-xs text-[#718096]">{doc.category}</span>
            {doc.company && (
              <>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-[#718096]">{doc.company.name}</span>
              </>
            )}
          </div>
          <p className="font-semibold text-[#1A202C] text-sm truncate">
            {doc.name}
          </p>
          <p className="text-xs text-[#718096] mt-0.5">
            만료일 {formatDate(doc.expiry_date)}
          </p>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
        </div>

        {/* Arrow */}
        <svg className="w-5 h-5 text-gray-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
