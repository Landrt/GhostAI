import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Calendar,
  BookOpen,
  ArrowRight,
  Printer,
  ShieldCheck,
  List,
} from "lucide-react";
import { getAllLegalDocuments, getLegalDocumentBySlug, LegalDocumentMeta } from "@/lib/legal/registry";
import { parseLegalMarkdown } from "@/lib/legal/parser";
import { LegalIcon } from "@/components/legal/LegalIcon";
import { PublicFooter } from "@/components/navigation/PublicFooter";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const documents = getAllLegalDocuments();
  // Génère les routes principales pour les 8 documents
  const params: { slug: string }[] = [];
  documents.forEach((doc) => {
    params.push({ slug: doc.slug });
    // Inclure aussi les alias
    doc.aliases.forEach((alias) => {
      params.push({ slug: alias });
    });
  });
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const doc = getLegalDocumentBySlug(params.slug);
  if (!doc) {
    return {
      title: "Document non trouvé | GhostAI",
    };
  }

  return {
    title: `${doc.title} | GhostAI Légal`,
    description: doc.description,
  };
}

export default function LegalDocumentPage({ params }: PageProps) {
  const doc = getLegalDocumentBySlug(params.slug);
  if (!doc) {
    notFound();
  }

  const parsed = parseLegalMarkdown(doc);
  const allDocs = getAllLegalDocuments();
  const currentIndex = allDocs.findIndex((d) => d.slug === doc.slug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : undefined;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : undefined;

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink">
      {/* En-tête avec fil d'Ariane */}
      <header className="border-b border-line bg-surface sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-lg tracking-tight font-bold hover:opacity-85 transition-opacity">
              GhostAI
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-ink-quiet" />
            <Link href="/legal" className="text-xs text-ink-quiet hover:text-ink transition-colors font-medium">
              Espace Juridique
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-ink-quiet hidden sm:inline" />
            <span className="text-xs text-ink font-semibold truncate max-w-[200px] sm:max-w-none hidden sm:inline">
              {doc.shortTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/legal"
              className="inline-flex items-center gap-1.5 text-xs text-ink-quiet hover:text-ink font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tous les textes</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Corps principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Titre & Métadonnées du Document */}
        <div className="max-w-4xl space-y-4 pb-8 border-b border-line">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-mark bg-mark-light px-2.5 py-1 rounded-full">
              <LegalIcon name={doc.iconName} className="w-3.5 h-3.5" />
              {doc.category}
            </span>
            <span className="inline-flex items-center gap-1 text-ink-quiet bg-surface border border-line px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              Lecture ~ {doc.estimatedReadingTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink font-serif leading-tight">
            {parsed.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-ink-quiet">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-mark" />
              <strong>Statut :</strong> En vigueur ({parsed.lastUpdated})
            </span>
            <span>•</span>
            <span>Document juridique officiel GhostAI</span>
          </div>
        </div>

        {/* Préambule / Avertissement d'en-tête */}
        {parsed.preamble && (
          <div className="max-w-4xl my-6 p-4 rounded-card border border-mark/20 bg-mark-light/50 text-xs sm:text-sm text-ink leading-relaxed">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-mark shrink-0 mt-0.5" />
              <div dangerouslySetInnerHTML={{ __html: parsed.preamble }} />
            </div>
          </div>
        )}

        {/* Disposition 2 colonnes (Contenu principal + Sommaire sticky) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
          {/* Colonne de gauche : Contenu rédactionnel du document */}
          <article className="lg:col-span-8 max-w-none space-y-6">
            <div
              className="legal-content text-ink"
              dangerouslySetInnerHTML={{ __html: parsed.htmlContent }}
            />

            {/* Navigation de bas de document (Précédent / Suivant) */}
            <div className="mt-14 pt-8 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevDoc ? (
                <Link
                  href={`/legal/${prevDoc.slug}`}
                  className="p-4 rounded-card border border-line bg-surface hover:border-mark/40 hover:shadow-sm transition-all group text-left"
                >
                  <span className="text-[10px] uppercase font-semibold text-ink-quiet tracking-wider block mb-1">
                    ← Document précédent
                  </span>
                  <span className="text-xs font-serif font-bold text-ink group-hover:text-mark transition-colors line-clamp-1">
                    {prevDoc.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextDoc ? (
                <Link
                  href={`/legal/${nextDoc.slug}`}
                  className="p-4 rounded-card border border-line bg-surface hover:border-mark/40 hover:shadow-sm transition-all group text-right sm:text-right"
                >
                  <span className="text-[10px] uppercase font-semibold text-ink-quiet tracking-wider block mb-1">
                    Document suivant →
                  </span>
                  <span className="text-xs font-serif font-bold text-ink group-hover:text-mark transition-colors line-clamp-1">
                    {nextDoc.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </article>

          {/* Colonne de droite : Sommaire interactif & Switcher (Sticky Desktop) */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Sommaire (Table des matières) */}
              {parsed.tableOfContents.length > 0 && (
                <div className="p-5 rounded-card border border-line bg-surface shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink border-b border-line pb-2">
                    <List className="w-3.5 h-3.5 text-mark" />
                    <span>Sommaire</span>
                  </div>
                  <nav className="max-h-[380px] overflow-y-auto space-y-1 text-xs pr-1">
                    {parsed.tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block py-1 text-ink-quiet hover:text-mark hover:underline transition-colors leading-snug ${
                          item.level === 3 ? "pl-3 text-[11px]" : "font-medium text-ink"
                        }`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Accès rapide aux autres textes légaux */}
              <div className="p-5 rounded-card border border-line bg-surface shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink border-b border-line pb-2">
                  <BookOpen className="w-3.5 h-3.5 text-mark" />
                  <span>Tous les documents</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {allDocs.map((item) => {
                    const isActive = item.slug === doc.slug;
                    return (
                      <Link
                        key={item.slug}
                        href={`/legal/${item.slug}`}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-mark-light text-mark font-semibold"
                            : "text-ink-quiet hover:text-ink hover:bg-paper"
                        }`}
                      >
                        <span className="truncate pr-2">{item.shortTitle}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-mark shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
