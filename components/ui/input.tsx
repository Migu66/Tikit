import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="tk-label mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn('tk-input', error && 'tk-input-error', className)}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 font-mono text-xs font-bold tracking-wide text-thermal">
            ▲ {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
