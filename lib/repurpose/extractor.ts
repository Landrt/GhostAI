/**
 * Extracteur multimodal pour l'Atomiseur de Contenu (Articles, YouTube, Texte)
 */

export interface ExtractedContent {
  title: string;
  content: string;
  sourceType: "url" | "youtube" | "text" | "file";
  sourceUrl?: string;
  wordCount: number;
}

/**
 * Nettoie une chaîne de texte brut
 */
export function cleanSourceText(text: string, maxChars: number = 40000): string {
  if (!text) return "";
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length > maxChars) {
    return cleaned.slice(0, maxChars) + "\n\n[...Contenu tronqué pour analyse optimale...]";
  }
  return cleaned;
}

/**
 * Extrait le contenu d'un article ou page web
 */
export async function extractFromUrl(url: string): Promise<ExtractedContent> {
  const normalizedUrl = url.trim();

  // Détection si c'est une vidéo YouTube
  if (isYouTubeUrl(normalizedUrl)) {
    return extractFromYouTube(normalizedUrl);
  }

  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Impossible d'accéder à l'URL (statut HTTP ${res.status})`);
    }

    const html = await res.text();

    // Extraction du titre
    const titleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
      html.match(/<title[^>]*>(.*?)<\/title>/i) ||
      html.match(/<h1[^>]*>(.*?)<\/h1>/i);

    const rawTitle = titleMatch ? titleMatch[1].replace(/&[a-z]+;/gi, " ").trim() : "Article sans titre";

    // Nettoyage agressif du HTML pour extraire le corps éditorial
    let body = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // Recherche de la balise principale <article> ou <main>
    const articleMatch = body.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      body = articleMatch[1];
    } else {
      const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      if (mainMatch) {
        body = mainMatch[1];
      }
    }

    // Conversion en texte brut lisible
    const text = body
      .replace(/<h[1-6][^>]*>/gi, "\n\n### ")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n\n")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/[ \t]+/g, " ");

    const cleaned = cleanSourceText(text);
    const words = cleaned.split(/\s+/).filter(Boolean).length;

    if (words < 50) {
      throw new Error(
        "Le contenu extrait est trop court ou protégé par un pare-feu / JavaScript. Veuillez coller le texte directement."
      );
    }

    return {
      title: rawTitle,
      content: cleaned,
      sourceType: "url",
      sourceUrl: normalizedUrl,
      wordCount: words,
    };
  } catch (err: any) {
    throw new Error(`Erreur extraction d'article : ${err.message || "Page inaccessible"}`);
  }
}

/**
 * Vérifie si une URL est une vidéo YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)/i.test(url);
}

/**
 * Extrait l'identifiant d'une vidéo YouTube
 */
export function extractYouTubeId(url: string): string | null {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Extrait les métadonnées et la transcription d'une vidéo YouTube
 */
export async function extractFromYouTube(url: string): Promise<ExtractedContent> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error("Lien YouTube invalide. Format attendu : https://www.youtube.com/watch?v=XXXX ou https://youtu.be/XXXX");
  }

  let title = `Vidéo YouTube (${videoId})`;
  let description = "";

  // 1. Récupération des métadonnées via oEmbed officiel
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { next: { revalidate: 3600 } }
    );
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      if (oembedData.title) {
        title = oembedData.title;
      }
    }
  } catch (e) {
    // Silencieux si indisponible
  }

  // 2. Récupération de la page HTML pour tenter d'extraire les sous-titres publics / description
  let transcriptText = "";

  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "fr,en;q=0.9",
      },
      next: { revalidate: 0 },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // Extraction description
      const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      if (descMatch) {
        description = descMatch[1].replace(/&[a-z]+;/gi, " ").trim();
      }

      // Recherche de pistes de sous-titres (timedtext) dans le JSON initial
      const captionTracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
      if (captionTracksMatch) {
        try {
          const captionTracks = JSON.parse(captionTracksMatch[1]);
          // Préférer français ou anglais ou le premier disponible
          const track =
            captionTracks.find((t: any) => t.languageCode === "fr") ||
            captionTracks.find((t: any) => t.languageCode === "en") ||
            captionTracks[0];

          if (track && track.baseUrl) {
            const transcriptRes = await fetch(track.baseUrl);
            if (transcriptRes.ok) {
              const xml = await transcriptRes.text();
              // Parse simple des balises <text>
              const textMatches = Array.from(xml.matchAll(/<text[^>]*>(.*?)<\/text>/gi));
              const textParts: string[] = [];
              for (const m of textMatches) {
                const line = m[1]
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&#39;/g, "'")
                  .replace(/&quot;/g, '"')
                  .trim();
                if (line) textParts.push(line);
              }
              if (textParts.length > 0) {
                transcriptText = textParts.join(" ");
              }
            }
          }
        } catch (jsonErr) {
          console.error("Erreur parse captionTracks:", jsonErr);
        }
      }
    }
  } catch (err) {
    console.error("Erreur fetch page YouTube:", err);
  }

  // Si transcription trouvée
  if (transcriptText && transcriptText.length > 100) {
    const cleaned = cleanSourceText(transcriptText);
    return {
      title,
      content: cleaned,
      sourceType: "youtube",
      sourceUrl: url,
      wordCount: cleaned.split(/\s+/).filter(Boolean).length,
    };
  }

  // Secours si sous-titres désactivés : on construit un contexte solide avec le titre et la description
  if (description && description.length > 50) {
    const fallbackText = `Titre de la vidéo : ${title}\n\nDescription et contenu :\n${description}`;
    return {
      title,
      content: fallbackText,
      sourceType: "youtube",
      sourceUrl: url,
      wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
    };
  }

  throw new Error(
    "Cette vidéo YouTube n'a pas de sous-titres publics accessibles. Vous pouvez copier et coller la transcription ou vos notes directement dans l'onglet 'Texte Brut'."
  );
}

/**
 * Point d'entrée unifié pour extraire le contenu selon le type de source
 */
export async function extractSourceContent(options: {
  sourceType: "url" | "youtube" | "text" | "file";
  input: string;
}): Promise<ExtractedContent> {
  const { sourceType, input } = options;

  if (sourceType === "youtube") {
    return extractFromYouTube(input);
  }

  if (sourceType === "url") {
    return extractFromUrl(input);
  }

  // sourceType === 'text' ou 'file'
  const cleaned = cleanSourceText(input);
  if (cleaned.length < 40) {
    throw new Error("Le texte fourni est trop court pour être atomisé (minimum 40 caractères).");
  }

  const firstLine = cleaned.split("\n").map((l) => l.trim()).filter(Boolean)[0] || "Contenu source";
  const title = firstLine.length > 80 ? firstLine.slice(0, 77) + "..." : firstLine;

  return {
    title,
    content: cleaned,
    sourceType: "text",
    wordCount: cleaned.split(/\s+/).filter(Boolean).length,
  };
}

