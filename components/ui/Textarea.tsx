import React from "react";
import clsx from "clsx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={clsx(
            "w-full px-3.5 py-2.5 bg-surface text-ink text-sm rounded-input border border-line transition-colors duration-150 placeholder:text-ink-quiet/60 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink disabled:bg-paper disabled:text-ink-quiet disabled:cursor-not-allowed resize-y",
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

Textarea.displayName = "Textarea";
