'use client';

import { DocumentStatus } from '@/types';
import { STATUS_CONFIG } from '@/lib/constants';

interface BadgeProps {
  status: DocumentStatus;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-semibold rounded-full
        transition-colors duration-150
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
