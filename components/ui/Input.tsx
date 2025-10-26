import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mode?: "primary" | "transparent";
  inputSize?: "sm" | "md";
  hasError?: boolean;
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    id,
    type = "text",
    name,
    mode = "primary",
    inputSize = "sm",
    hasError = false,
    className = "",
    label,
    error,
    ...rest
  } = props;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type={type}
        name={name}
        className={cn(
          "block w-full rounded-md bg-transparent text-sm placeholder-gray-400 focus:outline-none transition-colors",
          {
            "border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500": mode === "primary",
            "border-none bg-transparent ring-0 focus:ring-1 focus:ring-blue-500": mode === "transparent",
            "!border-red-500 focus:!border-red-500 focus:!ring-red-500": hasError || error,
            "px-3 py-2": inputSize === "sm",
            "p-3": inputSize === "md",
          },
          className
        )}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";