"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PostCard, PostCardData } from "@/components/posts/PostCard";
import { Plus, Search, Filter } from "lucide-react";

export default function MyPostsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [toneFilter, setToneFilter] = useState("");
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (search) params.set("search", search);
      if (formatFilter) params.set("format", formatFilter);
      if (toneFilter) params.set("tone", toneFilter);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Impossible de charger les posts.");
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, formatFilter, toneFilter]);

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { id: "all", label: "Tous" },
    { id: "draft", label: "Brouillons" },
    { id: "completed", label: "Terminés" },
    { id: "archived", label: "Archivés" },
  ];

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "draft":
        return "Aucun brouillon. Crée un post pour commencer.";
      case "completed":
        return "Aucun post terminé. Finalise un brouillon pour l'archiver ici.";
      case "archived":
        return "Aucun post archivé.";
      default:
        return "Aucun post ne correspond à ta recherche.";
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Mes posts</h1>
          <p className="text-xs text-ink-quiet mt-0.5">Historique et gestion de tes contenus rédigés.</p>
        </div>

        <Link href="/app/create">
          <Button variant="secondary" size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Nouveau post</span>
          </Button>
        </Link>
      </div>

      {/* Onglets de statuts */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Barre de filtres et recherche */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchPosts();
          }}
          className="relative flex-1 w-full"
        >
          <Search className="w-4 h-4 text-ink-quiet absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans l'idée ou le contenu..."
            className="w-full pl-9 pr-4 py-2 bg-surface text-ink text-sm rounded-input border border-line focus:outline-none focus:border-ink placeholder:text-ink-quiet/60"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-3 py-2 bg-surface text-ink text-xs rounded-input border border-line focus:outline-none focus:border-ink"
          >
            <option value="">Tous les formats</option>
            <option value="opinion">Opinion</option>
            <option value="text">Texte libre</option>
            <option value="story">Histoire</option>
            <option value="educational">Éducatif</option>
            <option value="case_study">Étude de cas</option>
            <option value="personal_experience">Expérience personnelle</option>
          </select>

          <select
            value={toneFilter}
            onChange={(e) => setToneFilter(e.target.value)}
            className="px-3 py-2 bg-surface text-ink text-xs rounded-input border border-line focus:outline-none focus:border-ink"
          >
            <option value="">Tous les tons</option>
            <option value="direct">Direct</option>
            <option value="conversational">Conversationnel</option>
            <option value="professional">Professionnel</option>
            <option value="provocative">Provocateur</option>
            <option value="thoughtful">Réfléchi</option>
          </select>
        </div>
      </div>

      {/* Liste des posts ou états */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-line rounded-card p-5 h-44 animate-pulse space-y-3">
              <div className="h-4 bg-line/60 rounded w-1/3" />
              <div className="h-6 bg-line/60 rounded w-3/4" />
              <div className="h-12 bg-line/40 rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-surface border border-line rounded-card p-8 text-center space-y-3">
          <p className="text-sm text-danger">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchPosts}>
            Réessayer
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-surface border border-line rounded-card p-12 text-center space-y-3 max-w-md mx-auto my-8">
          <p className="text-sm text-ink-quiet">{getEmptyMessage()}</p>
          <Link href="/app/create">
            <Button variant="secondary" size="sm">
              Créer un post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
