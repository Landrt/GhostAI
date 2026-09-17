"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MoreHorizontal, Copy, ExternalLink, Archive, FileEdit } from "lucide-react";

export interface PostItem {
  id: string;
  idea: string;
  content: string;
  status: "draft" | "completed" | "archived";
  voiceMatchScore: number | null;
  compositeQualityScore?: number | null;
  createdAt: string | Date;
}

interface RecentPostsProps {
  posts: PostItem[];
  onDuplicate?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function RecentPosts({ posts, onDuplicate, onArchive }: RecentPostsProps) {
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
    return first.length > 85 ? first.slice(0, 85) + "…" : first;
  };

  return (
    <div className="bg-surface border border-line rounded-card overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
        <h4 className="text-base font-semibold text-ink">Posts récents</h4>
        <Link href="/app/posts" className="text-xs font-medium text-ink hover:text-mark transition-colors">
          Voir tout
        </Link>
      </div>

      <div className="divide-y divide-line/60">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 sm:p-5 hover:bg-paper/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/app/posts/${post.id}`}
                className="text-sm font-medium text-ink hover:text-mark transition-colors block truncate"
              >
                {getFirstLine(post.content || post.idea)}
              </Link>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-quiet">
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                {getStatusBadge(post.status)}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-center">
              <div className="flex items-center gap-3 text-xs font-mono">
                {post.voiceMatchScore !== null && (
                  <div className="text-right">
                    <span className="text-[10px] text-ink-quiet block">Voix</span>
                    <span className="font-semibold text-ink">{post.voiceMatchScore}%</span>
                  </div>
                )}
                {post.compositeQualityScore !== undefined && post.compositeQualityScore !== null && (
                  <div className="text-right">
                    <span className="text-[10px] text-ink-quiet block">Qualité</span>
                    <span className="font-semibold text-confirm">{post.compositeQualityScore}%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Link href={`/app/posts/${post.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 px-2" title="Éditer">
                    <FileEdit className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    title="Dupliquer"
                    onClick={() => onDuplicate(post.id)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onArchive && post.status !== "archived" && (
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
        ))}
      </div>
    </div>
  );
}
