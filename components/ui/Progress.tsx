import React from "react";
import clsx from "clsx";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  indicatorColor?: "mark" | "confirm" | "ink" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Progress({
  className,
  value = 0,
  max = 100,
  indicatorColor = "secondary",
  size = "md",
  ...props
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorStyles = {
    secondary: "bg-secondary",
    mark: "bg-secondary",
    confirm: "bg-confirm",
    ink: "bg-ink",
  };

  const sizeStyles = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div
      className={clsx(
        "w-full bg-paper border border-line rounded-full overflow-hidden p-0.5 shadow-inner",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-300 ease-out shadow-sm",
          colorStyles[indicatorColor]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
