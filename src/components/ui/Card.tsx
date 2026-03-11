'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Card({ children, onClick, className = '' }: CardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-sm p-5
        ${isClickable ? 'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-150' : ''}
        ${className}
      `.trim()}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
