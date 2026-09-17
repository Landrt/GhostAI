"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileEdit, Copy, Archive, RotateCcw } from "lucide-react";

export interface PostCardData {
  id: string;
  idea: string;
  content: string;
  status: "draft" | "completed" | "archived";
  format: string;
  tone: string;
  voiceMatchScore: number | null;
  compositeQualityScore?: number | null;
  createdAt: string | Date;
}

interface PostCardProps {
  post: PostCardData;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive?: (id: string) => void;
}

export function PostCard({ post, onDuplicate, onArchive, onUnarchive }: PostCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="confirm">Terminé</Badge>;
      case "draft":
        return <Badge variant="neutral">Brouillon</Badge>;
      case "archived":
        return <Badge variant="warn">Archivé</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFirstLine = (text: string) => {
    if (!text) return "";
    const first = text.split("\n")[0].trim();
    return first.length > 90 ? first.slice(0, 90) + "…" : first;
  };

  return (
    <div className="bg-surface border border-line rounded-card p-5 hover:border-ink/20 transition-all flex flex-col justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getStatusBadge(post.status)}
            <span className="text-xs text-ink-quiet capitalize">{post.format} • {post.tone}</span>
          </div>
          <span className="text-xs text-ink-quiet">{formatDate(post.createdAt)}</span>
        </div>

        <Link
          href={`/app/posts/${post.id}`}
          className="text-base font-semibold text-ink hover:text-mark transition-colors line-clamp-2 leading-snug"
        >
          {getFirstLine(post.content || post.idea)}
        </Link>

        <p className="text-xs text-ink-quiet line-clamp-3 leading-relaxed">
          {post.content || post.idea}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-line/60">
        <div className="flex items-center gap-3 text-xs font-mono">
          {post.voiceMatchScore !== null ? (
            <div>
              <span className="text-[10px] text-ink-quiet block">Voix</span>
              <span className="font-semibold text-ink">{post.voiceMatchScore}%</span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-ink-quiet block">Voix</span>
              <span className="text-xs text-ink-quiet italic">-</span>
            </div>
          )}
          {post.compositeQualityScore !== undefined && post.compositeQualityScore !== null && (
            <div>
              <span className="text-[10px] text-ink-quiet block">Qualité</span>
              <span className="font-semibold text-confirm">{post.compositeQualityScore}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link href={`/app/posts/${post.id}`}>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <FileEdit className="w-3.5 h-3.5" />
              <span>Éditer</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            title="Dupliquer"
            onClick={() => onDuplicate(post.id)}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          {post.status === "archived" && onUnarchive ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-confirm hover:bg-confirm/10"
              title="Désarchiver"
              onClick={() => onUnarchive(post.id)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:text-warn"
              title="Archiver"
              onClick={() => onArchive(post.id)}
            >
              <Archive className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
