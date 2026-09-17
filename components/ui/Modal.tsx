import React, { useEffect } from "react";
import clsx from "clsx";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop sombre et discret */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-none transition-opacity"
        onClick={onClose}
      />
      {/* Conteneur modal */}
      <div
        className={clsx(
          "relative w-full bg-surface rounded-modal border border-line p-6 z-10 max-h-[90vh] overflow-y-auto",
          maxWidthStyles[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-3 border-b border-line mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
            {description && <p className="text-sm text-ink-quiet mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-ink-quiet hover:text-ink p-1 rounded transition-colors"
            aria-label="Fermer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
