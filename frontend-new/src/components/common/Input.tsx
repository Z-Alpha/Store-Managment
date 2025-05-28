import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            ref={ref}
            {...props}
            className={`
              block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset
              focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
              ${error
                ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500'
                : 'ring-gray-300 placeholder:text-gray-400 focus:ring-blue-500'
              }
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : undefined}
          />
        </div>
        {error ? (
          <p className="mt-2 text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-2 text-sm text-gray-500" id={`${props.id}-description`}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 