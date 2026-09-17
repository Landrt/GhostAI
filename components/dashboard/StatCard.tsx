import React from "react";
import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  className?: string;
}

export function StatCard({ label, value, subtext, className }: StatCardProps) {
  return (
    <div
      className={clsx(
        "bg-surface border border-line rounded-card p-5 flex flex-col justify-between transition-colors",
        className
      )}
    >
      <span className="text-xs font-medium text-ink-quiet">{label}</span>
      <div className="my-2">
        <span className="text-2xl sm:text-3xl font-bold text-ink font-mono tracking-tight">
          {value}
        </span>
      </div>
      {subtext && <span className="text-xs text-ink-quiet/80">{subtext}</span>}
    </div>
  );
}
