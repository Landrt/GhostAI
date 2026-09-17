"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

interface PostFeedbackModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasons: string[]) => Promise<void>;
}

const REASONS = [
  { id: "too_formal", label: "Trop formel" },
  { id: "too_generic", label: "Trop générique" },
  { id: "not_me", label: "Ça ne me ressemble pas" },
  { id: "too_long", label: "Trop long" },
  { id: "wrong_tone", label: "Mauvais ton" },
  { id: "other", label: "Autre" },
];

export function PostFeedbackModal({ isOpen, onClose, onSubmit }: PostFeedbackModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onSubmit(selectedReasons);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Qu'est-ce qui ne te ressemble pas ?"
      description="Ces signaux permettent au système d'ajuster ton profil de voix avec précision."
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {REASONS.map((reason) => {
            const isSelected = selectedReasons.includes(reason.id);
            return (
              <button
                key={reason.id}
                type="button"
                onClick={() => toggleReason(reason.id)}
                className={clsx(
                  "p-3 rounded-input text-left text-sm border transition-colors flex items-center justify-between",
                  isSelected
                    ? "border-mark bg-mark-light/40 text-ink font-medium"
                    : "border-line bg-surface text-ink hover:bg-paper"
                )}
              >
                <span>{reason.label}</span>
                <span
                  className={clsx(
                    "w-4 h-4 rounded-sm border flex items-center justify-center text-xs",
                    isSelected ? "border-mark bg-mark text-surface" : "border-line"
                  )}
                >
                  {isSelected && "✓"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-line">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleConfirm}
            loading={loading}
          >
            Envoyer mon retour
          </Button>
        </div>
      </div>
    </Modal>
  );
}
