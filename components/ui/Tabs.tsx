import React from "react";
import clsx from "clsx";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx("flex items-center border-b border-line gap-1", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium transition-colors relative border-b-2 -mb-px flex items-center gap-2",
              isActive
                ? "border-mark text-ink font-semibold"
                : "border-transparent text-ink-quiet hover:text-ink hover:border-line"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-mark-light text-mark" : "bg-paper text-ink-quiet"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
