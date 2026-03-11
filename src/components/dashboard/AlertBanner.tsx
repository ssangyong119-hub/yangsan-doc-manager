'use client';

import { DocumentWithStatus } from '@/types';
import { formatDday } from '@/lib/utils';
import Link from 'next/link';

interface AlertBannerProps {
  documents: DocumentWithStatus[];
}

export default function AlertBanner({ documents }: AlertBannerProps) {
  const critical = documents.filter(
    (d) => d.status === 'expired' || d.status === 'today' || d.status === 'urgent'
  );

  if (critical.length === 0) return null;

  return (
    <div className="space-y-2">
      {critical.slice(0, 3).map((doc) => {
        const isExpired = doc.status === 'expired' || doc.status === 'today';
        return (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className={`block rounded-2xl p-4 transition-transform active:scale-[0.98] ${
              isExpired
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">
                  {doc.company?.name}
                </p>
                <p className="font-bold text-base">{doc.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono">
                  {formatDday(doc.dday)}
                </p>
                <p className="text-xs opacity-80">
                  {isExpired ? '즉시 갱신 필요!' : '갱신 준비'}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
