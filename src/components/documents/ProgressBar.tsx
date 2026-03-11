'use client';

import { getProgressPercentage, getDocumentStatus } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';

interface ProgressBarProps {
  dday: number;
  renewalCycle: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  dday,
  renewalCycle,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const percentage = getProgressPercentage(dday, renewalCycle);
  const status = getDocumentStatus(dday);
  const config = STATUS_CONFIG[status];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">갱신 주기 진행률</span>
          <span
            className="text-xs font-semibold"
            style={{ color: config.color }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: config.color,
          }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`갱신 주기 ${Math.round(percentage)}% 경과`}
        />
      </div>
    </div>
  );
}
