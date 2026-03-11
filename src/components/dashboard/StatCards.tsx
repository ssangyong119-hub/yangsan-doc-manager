'use client';

import { DocumentWithStatus } from '@/types';

interface StatCardsProps {
  documents: DocumentWithStatus[];
}

export default function StatCards({ documents }: StatCardsProps) {
  const total = documents.length;
  const expired = documents.filter((d) => d.status === 'expired' || d.status === 'today').length;
  const urgent = documents.filter((d) => d.status === 'urgent').length;
  const safe = documents.filter((d) => d.status === 'safe' || d.status === 'interest').length;

  const stats = [
    { label: '전체', value: total, color: '#1a365d', bg: '#EBF8FF', icon: '📊' },
    { label: '만료', value: expired, color: '#E53E3E', bg: '#FED7D7', icon: '🚨' },
    { label: '긴급', value: urgent, color: '#DD6B20', bg: '#FEEBC8', icon: '⚡' },
    { label: '양호', value: safe, color: '#38A169', bg: '#C6F6D5', icon: '✅' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{stat.icon}</span>
            <span className="text-sm text-[#718096] font-medium">{stat.label}</span>
          </div>
          <p
            className="text-3xl font-bold font-mono"
            style={{ color: stat.color }}
          >
            {stat.value}
            <span className="text-sm font-sans font-normal text-[#718096] ml-1">건</span>
          </p>
        </div>
      ))}
    </div>
  );
}
