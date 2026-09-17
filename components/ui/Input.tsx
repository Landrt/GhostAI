import React from "react";
import clsx from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            "w-full px-3.5 py-2.5 bg-surface text-ink text-sm rounded-input border border-line transition-colors duration-150 placeholder:text-ink-quiet/60 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink disabled:bg-paper disabled:text-ink-quiet disabled:cursor-not-allowed",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {helperText && !error && <span className="text-xs text-ink-quiet">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
