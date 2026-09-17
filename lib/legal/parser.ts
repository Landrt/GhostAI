import * as fs from "fs";
import * as path from "path";
import { LegalDocumentMeta, getLegalDocumentBySlug } from "./registry";
import { LEGAL_DOCS_CONTENT } from "./legalContent";

export interface TableOfContentItem {
  id: string;
  title: string;
  level: number;
}

export interface ParsedLegalDocument {
  meta: LegalDocumentMeta;
  title: string;
  lastUpdated: string;
  preamble?: string;
  tableOfContents: TableOfContentItem[];
  htmlContent: string;
  rawMarkdown: string;
}

// Map des fichiers markdown vers les routes Next.js
const MD_TO_ROUTE_MAP: Record<string, string> = {
  "mentions-legales-ghostai.md": "/legal/mentions-legales",
  "conditions-utilisation-et-vente-ghostai.md": "/legal/cgu-cgv",
  "politique-confidentialite-ghostai.md": "/legal/confidentialite",
  "politique-cookies-ghostai.md": "/legal/cookies",
  "conditions-programme-partenaire-affiliation-ghostai.md": "/legal/programme-partenaire",
  "conditions-retraits-affiliation-ghostai.md": "/legal/retraits-affiliation",
  "decharge-intelligence-artificielle-ghostai.md": "/legal/decharge-ia",
  "accord-traitement-donnees-dpa-ghostai.md": "/legal/dpa",
};

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatInlineText(text: string): string {
  let result = text;

  // 1. Remplacer les liens Markdown [texte](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    let targetUrl = url;
    // Traduction des liens relatifs ./fichier.md vers les routes Next.js
    const cleanUrl = url.replace(/^\.\//, "").trim();
    if (MD_TO_ROUTE_MAP[cleanUrl]) {
      targetUrl = MD_TO_ROUTE_MAP[cleanUrl];
    }
    const isExternal = targetUrl.startsWith("http");
    return `<a href="${targetUrl}" ${
      isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""
    } class="text-mark underline font-medium hover:text-ink transition-colors">${linkText}</a>`;
  });

  // 2. Gras **texte** ou __texte__
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // 3. Italique *texte* ou _texte_
  result = result.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

  // 4. Code inline `code`
  result = result.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-surface border border-line text-ink font-mono text-xs">$1</code>');

  // 5. Mise en valeur des placeholders d'édition [CHAMPS À COMPLÉTER...]
  result = result.replace(
    /\[([A-Z0-9À-ÖØ-ß\s\/\-_–—'’]{3,80})\]/g,
    (match, placeholder) => {
      // Ignorer si c'était déjà traité comme lien ou format court
      if (placeholder.includes("href=") || placeholder.length < 3) return match;
      return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-warn/10 text-warn border border-warn/25 tracking-wide">[${placeholder}]</span>`;
    }
  );

  return result;
}

export function parseLegalMarkdown(doc: LegalDocumentMeta): ParsedLegalDocument {
  let rawMarkdown = LEGAL_DOCS_CONTENT[doc.filename] || "";

  const filePath = path.join(process.cwd(), doc.filename);
  if (fs.existsSync(filePath)) {
    rawMarkdown = fs.readFileSync(filePath, "utf8");
  } else if (!rawMarkdown) {
    throw new Error(`Document introuvable : ${doc.filename}`);
  }

  const lines = rawMarkdown.split("\n");

  let extractedTitle = doc.title;
  let lastUpdated = "Septembre 2026";
  let preamble = "";
  const tableOfContents: TableOfContentItem[] = [];

  const htmlSections: string[] = [];
  let inPreamble = false;
  let inList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let currentBlockquote: string[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      htmlSections.push(
        `<ul class="my-4 space-y-2 text-ink-quiet list-disc list-inside text-sm leading-relaxed">${listItems
          .map((item) => `<li class="pl-1"><span class="text-ink">${item}</span></li>`)
          .join("")}</ul>`
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable) {
      let tableHtml = '<div class="my-6 overflow-x-auto rounded-card border border-line bg-surface shadow-sm">';
      tableHtml += '<table class="w-full text-left text-xs border-collapse">';
      if (tableHeader.length > 0) {
        tableHtml += '<thead class="bg-paper border-b border-line text-ink font-semibold uppercase tracking-wider text-[11px]">';
        tableHtml += '<tr>';
        tableHeader.forEach((h) => {
          tableHtml += `<th class="p-3.5">${formatInlineText(h)}</th>`;
        });
        tableHtml += '</tr></thead>';
      }
      tableHtml += '<tbody class="divide-y divide-line/60">';
      tableRows.forEach((row, i) => {
        tableHtml += `<tr class="${i % 2 === 0 ? 'bg-surface' : 'bg-paper/40'} hover:bg-surface/80 transition-colors">`;
        row.forEach((cell) => {
          tableHtml += `<td class="p-3.5 align-top text-ink leading-relaxed">${formatInlineText(cell)}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';
      htmlSections.push(tableHtml);

      tableHeader = [];
      tableRows = [];
      inTable = false;
    }
  };

  const flushBlockquote = () => {
    if (currentBlockquote.length > 0) {
      const bqContent = currentBlockquote.join(" ");
      htmlSections.push(
        `<div class="my-5 p-4 rounded-card border border-line bg-surface/90 border-l-4 border-l-mark text-ink text-xs sm:text-sm leading-relaxed shadow-sm">
          <div class="flex items-start gap-2.5">
            <span class="text-mark font-bold text-base leading-none select-none">›</span>
            <div class="flex-1">${formatInlineText(bqContent)}</div>
          </div>
        </div>`
      );
      currentBlockquote = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Ligne vide
    if (!line) {
      flushList();
      flushTable();
      flushBlockquote();
      continue;
    }

    // 1. Titre H1
    if (line.startsWith("# ")) {
      flushList();
      flushTable();
      flushBlockquote();
      extractedTitle = line.replace(/^#\s+/, "").replace(/— GhostAI$/, "").trim();
      continue;
    }

    // 2. Date de mise à jour / date d'effet
    if (line.includes("Dernière mise à jour :") || line.includes("Date d’effet :")) {
      flushList();
      flushTable();
      flushBlockquote();
      const match = line.match(/\*\*(Dernière mise à jour|Date d’effet)\s*:\s*([^\\*]+)\*\*/i);
      if (match && match[2]) {
        lastUpdated = match[2].trim();
      }
      continue;
    }

    // 3. Préambule / Encart initial de tête
    if (line.startsWith("> ") && htmlSections.length === 0) {
      const pText = line.replace(/^>\s+/, "").trim();
      preamble = preamble ? `${preamble} ${pText}` : pText;
      continue;
    }

    // 4. Blockquotes dans le corps
    if (line.startsWith("> ")) {
      flushList();
      flushTable();
      currentBlockquote.push(line.replace(/^>\s+/, "").trim());
      continue;
    } else {
      flushBlockquote();
    }

    // 5. Tableaux Markdown (| col | col |)
    if (line.startsWith("|") && line.endsWith("|")) {
      flushList();
      // Si ligne séparatrice | --- | --- |
      if (/^\|(\s*:?-+:?\s*\|)+$/.test(line)) {
        continue;
      }
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // 6. Listes à puces (- item ou * item)
    if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(formatInlineText(line.replace(/^[-*]\s+/, "")));
      continue;
    } else {
      flushList();
    }

    // 7. Titres H2 (## Section)
    if (line.startsWith("## ")) {
      flushList();
      flushTable();
      flushBlockquote();
      const headingText = line.replace(/^##\s+/, "").trim();
      const id = slugifyHeading(headingText);
      tableOfContents.push({ id, title: headingText, level: 2 });
      htmlSections.push(
        `<h2 id="${id}" class="group text-xl sm:text-2xl font-bold font-serif text-ink tracking-tight mt-10 mb-4 pb-2 border-b border-line flex items-center justify-between">
          <span>${formatInlineText(headingText)}</span>
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-ink-quiet hover:text-mark text-sm font-sans transition-opacity ml-2">#</a>
        </h2>`
      );
      continue;
    }

    // 8. Titres H3 (### Sous-section)
    if (line.startsWith("### ")) {
      flushList();
      flushTable();
      flushBlockquote();
      const headingText = line.replace(/^###\s+/, "").trim();
      const id = slugifyHeading(headingText);
      tableOfContents.push({ id, title: headingText, level: 3 });
      htmlSections.push(
        `<h3 id="${id}" class="group text-base sm:text-lg font-semibold font-serif text-ink mt-6 mb-2 flex items-center justify-between">
          <span>${formatInlineText(headingText)}</span>
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-ink-quiet hover:text-mark text-xs font-sans transition-opacity ml-2">#</a>
        </h3>`
      );
      continue;
    }

    // 9. Séparateurs horizontaux (---)
    if (line === "---" || line === "***") {
      flushList();
      flushTable();
      flushBlockquote();
      htmlSections.push('<hr class="my-8 border-t border-line/60" />');
      continue;
    }

    // 10. Paragraphes normaux
    htmlSections.push(`<p class="my-3 text-xs sm:text-sm text-ink leading-relaxed font-sans">${formatInlineText(line)}</p>`);
  }

  flushList();
  flushTable();
  flushBlockquote();

  return {
    meta: doc,
    title: extractedTitle || doc.title,
    lastUpdated,
    preamble: preamble ? formatInlineText(preamble) : undefined,
    tableOfContents,
    htmlContent: htmlSections.join("\n"),
    rawMarkdown,
  };
}
