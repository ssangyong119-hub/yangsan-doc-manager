'use client';

import { formatDday, getDocumentStatus } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';

interface DdayBadgeProps {
  dday: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm px-2 py-0.5',
  md: 'text-lg px-3 py-1',
  lg: 'text-2xl px-4 py-1.5',
};

export default function DdayBadge({ dday, size = 'md', className = '' }: DdayBadgeProps) {
  const status = getDocumentStatus(dday);
  const config = STATUS_CONFIG[status];
  const formatted = formatDday(dday);

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-mono font-bold
        rounded-xl
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      style={{
        backgroundColor: config.bg,
        color: config.textColor,
      }}
      aria-label={`만료일까지 ${formatted}`}
    >
      {formatted}
    </span>
  );
}
