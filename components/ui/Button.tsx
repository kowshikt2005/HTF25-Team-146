import React from 'react';
import { cn } from '../../lib/utils';

type TButtonVariant = 
  | "primary"
  | "outline-primary" 
  | "neutral-primary"
  | "link-primary"
  | "danger"
  | "outline-danger"
  | "outline"
  | "secondary";

type TButtonSizes = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSizes;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const buttonSizeStyling = {
  sm: `px-3 py-1.5 font-medium text-xs rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center`,
  md: `px-4 py-1.5 font-medium text-sm rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center`,
  lg: `px-5 py-2 font-medium text-sm rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center`,
};

const buttonStyling = {
  primary: {
    default: `text-white bg-blue-600`,
    hover: `hover:bg-blue-700`,
    disabled: `cursor-not-allowed !bg-blue-300 hover:bg-blue-300`,
  },
  "outline-primary": {
    default: `text-blue-600 bg-transparent border border-blue-600`,
    hover: `hover:bg-blue-50`,
    disabled: `cursor-not-allowed !text-blue-300 !border-blue-300`,
  },
  "neutral-primary": {
    default: `text-gray-700 bg-white border border-gray-300`,
    hover: `hover:bg-gray-50`,
    disabled: `cursor-not-allowed !text-gray-400`,
  },
  "link-primary": {
    default: `text-blue-600 bg-transparent`,
    hover: `hover:text-blue-700`,
    disabled: `cursor-not-allowed !text-blue-300`,
  },
  danger: {
    default: `text-white bg-red-500`,
    hover: `hover:bg-red-600`,
    disabled: `cursor-not-allowed !bg-red-300`,
  },
  "outline-danger": {
    default: `text-red-500 bg-transparent border border-red-500`,
    hover: `hover:bg-red-50`,
    disabled: `cursor-not-allowed !text-red-300 !border-red-300`,
  },
  // Add missing variants that might be used
  outline: {
    default: `text-gray-700 bg-transparent border border-gray-300`,
    hover: `hover:bg-gray-50`,
    disabled: `cursor-not-allowed !text-gray-400 !border-gray-300`,
  },
  secondary: {
    default: `text-gray-700 bg-gray-100`,
    hover: `hover:bg-gray-200`,
    disabled: `cursor-not-allowed !text-gray-400 !bg-gray-50`,
  },
};

const getButtonStyling = (variant: TButtonVariant, size: TButtonSizes, disabled: boolean = false): string => {
  // Handle legacy variant names
  let actualVariant = variant;
  if (variant === 'outline' as any) {
    actualVariant = 'outline-primary';
  }
  
  const currentVariant = buttonStyling[actualVariant] || buttonStyling.primary; // Fallback to primary
  const variantClasses = `${currentVariant.default} ${disabled ? currentVariant.disabled : currentVariant.hover}`;
  const sizeClasses = buttonSizeStyling[size] || buttonSizeStyling.md; // Fallback to md
  return `${variantClasses} ${sizeClasses}`;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = "primary",
    size = "md",
    className = "",
    type = "button",
    loading = false,
    disabled = false,
    children,
    ...rest
  } = props;

  const buttonStyle = getButtonStyling(variant, size, disabled || loading);

  return (
    <button 
      ref={ref} 
      type={type} 
      className={cn(buttonStyle, className)} 
      disabled={disabled || loading} 
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";