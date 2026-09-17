import React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-input transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-ink text-surface hover:bg-ink/90 active:bg-ink",
      secondary: "bg-secondary text-surface hover:bg-secondary/90 active:bg-secondary",
      outline: "bg-surface border border-line text-ink hover:bg-paper hover:border-ink/20",
      danger: "bg-danger text-surface hover:bg-danger/90",
      ghost: "bg-transparent text-ink-quiet hover:text-ink hover:bg-paper",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8",
      md: "text-sm px-4 py-2 h-10",
      lg: "text-base px-6 py-3 h-12",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
