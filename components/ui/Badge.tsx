import React from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "mark" | "confirm" | "warn" | "danger";
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-paper text-ink-quiet border border-line",
    mark: "bg-mark-light text-mark border border-mark/20",
    confirm: "bg-confirm/10 text-confirm border border-confirm/20",
    warn: "bg-warn/10 text-warn border border-warn/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
