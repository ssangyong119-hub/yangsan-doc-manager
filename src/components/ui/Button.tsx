'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type ButtonVariant = 'primary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#3182CE] text-white hover:bg-[#2B6CB0] active:bg-[#2C5282] shadow-sm',
  danger:
    'bg-[#E53E3E] text-white hover:bg-[#C53030] active:bg-[#9B2C2C] shadow-sm',
  outline:
    'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100',
  ghost:
    'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          color={variant === 'primary' || variant === 'danger' ? '#ffffff' : undefined}
        />
      )}
      {children}
    </button>
  );
}
