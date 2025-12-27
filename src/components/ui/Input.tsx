import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-base font-medium text-textMuted">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'flex h-12 w-full rounded-xl border border-border bg-surfaceHover px-4 py-3 text-base text-textMain file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              isPassword && 'pr-12',
              error && 'border-error focus-visible:ring-error',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && <span className="mt-1 text-xs text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };