"use client";

import React from "react";
import clsx from "clsx";

export interface SliderProps {
  label: string;
  value: number; // 0-100
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  onChange = () => {},
  min = 0,
  max = 100,
  step = 1,
  description,
  disabled = false,
}: SliderProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-ink">{label}</label>
        <span className="text-xs font-bold text-secondary font-mono px-2 py-0.5 rounded bg-secondary-light border border-secondary/20">
          {Math.round(value)}%
        </span>
      </div>
      {description && <p className="text-xs text-ink-quiet">{description}</p>}

      {disabled ? (
        <div className="w-full bg-surface border-2 border-line/80 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <div className="relative flex items-center py-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className={clsx(
              "w-full h-2.5 bg-line/80 rounded-lg appearance-none cursor-pointer accent-secondary transition-all focus:outline-none"
            )}
          />
        </div>
      )}
    </div>
  );
}
