import React from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";

interface VoiceProfileCardProps {
  completeness: number; // 0-100
}

export function VoiceProfileCard({ completeness }: VoiceProfileCardProps) {
  const rounded = Math.round(completeness);

  return (
    <div className="bg-surface border border-line rounded-card p-6 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-base font-semibold text-ink">Ton profil de voix</h4>
          <p className="text-xs text-ink-quiet mt-0.5">
            Plus tu publies et renseignes d&apos;exemples, plus tes posts sonnent fidèlement comme toi.
          </p>
        </div>
        <span className="text-lg font-extrabold font-mono text-secondary px-2.5 py-0.5 rounded bg-secondary-light border border-secondary/20">
          {rounded}%
        </span>
      </div>

      <div className="space-y-2">
        <Progress value={rounded} indicatorColor="secondary" size="md" />
        <div className="flex items-center justify-between text-[11px] text-ink-quiet font-medium">
          <span>Apprentissage continu</span>
          <span className="text-secondary font-bold">{rounded}% complet</span>
        </div>
      </div>

      <div className="pt-2 border-t border-line/50">
        <Link href="/app/voice">
          <Button variant="outline" size="sm" className="w-full">
            Voir le profil
          </Button>
        </Link>
      </div>
    </div>
  );
}
