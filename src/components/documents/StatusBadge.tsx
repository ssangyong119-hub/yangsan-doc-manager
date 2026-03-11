'use client';

import { DocumentStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/constants';

interface StatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        whitespace-nowrap
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      style={{
        backgroundColor: config.bg,
        color: config.textColor,
      }}
    >
      {config.label}
    </span>
  );
}
