import React from "react";
import clsx from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "accent";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-surface border border-line",
    muted: "bg-paper border border-line",
    accent: "bg-mark-light/30 border border-mark/20",
  };

  return (
    <div
      className={clsx(
        "rounded-card p-5 sm:p-6 transition-colors duration-150",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex flex-col gap-1 pb-4 border-b border-line/60 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx("text-lg font-semibold text-ink tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("text-sm text-ink-quiet", className)} {...props}>
      {children}
    </p>
  );
}
