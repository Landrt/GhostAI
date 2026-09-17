/**
 * Liste des tournures interdites et clichés IA LinkedIn
 * Utilisé par le checker de genericness et la détection statique de clichés.
 */

export interface ClicheMatch {
  pattern: string;
  category: "ai_slop" | "corporate_jargon" | "fake_vulnerability" | "empty_hook" | "formulaic_transition";
  severity: "high" | "medium" | "low";
  description: string;
}

export const CLICHE_PATTERNS: ClicheMatch[] = [
  // Clichés IA typiques (AI Slop)
  {
    pattern: "dans le paysage actuel",
    category: "ai_slop",
    severity: "high",
    description: "Formule typique d'introduction générique de LLM",
  },
  {
    pattern: "in today's fast-paced world",
    category: "ai_slop",
    severity: "high",
    description: "Cliché d'introduction IA en anglais",
  },
  {
    pattern: "plongeons dans",
    category: "ai_slop",
    severity: "high",
    description: "Traduction littérale de 'Let's dive in'",
  },
  {
    pattern: "let's dive in",
    category: "ai_slop",
    severity: "high",
    description: "Accroche formulatoire d'IA",
  },
  {
    pattern: "naviguer dans",
    category: "ai_slop",
    severity: "medium",
    description: "Métaphore éculée ('navigating the complexities')",
  },
  {
    pattern: "game changer",
    category: "corporate_jargon",
    severity: "high",
    description: "Hyperbole corporate vide de sens",
  },
  {
    pattern: "changer la donne",
    category: "corporate_jargon",
    severity: "medium",
    description: "Équivalent français de game changer",
  },
  {
    pattern: "témoigne de",
    category: "ai_slop",
    severity: "medium",
    description: "Traduction de 'is a testament to'",
  },
  {
    pattern: "is a testament to",
    category: "ai_slop",
    severity: "high",
    description: "Formule ampoulée caractéristique des LLMs",
  },
  {
    pattern: "sans plus tarder",
    category: "formulaic_transition",
    severity: "medium",
    description: "Remplissage inutile",
  },
  {
    pattern: "sans transition",
    category: "formulaic_transition",
    severity: "medium",
    description: "Transition creuse",
  },
  {
    pattern: "voici pourquoi",
    category: "empty_hook",
    severity: "medium",
    description: "Accroche artificielle de thread sans substance",
  },
  {
    pattern: "here's why",
    category: "empty_hook",
    severity: "medium",
    description: "Accroche mécanique",
  },
  {
    pattern: "la vérité brutale",
    category: "fake_vulnerability",
    severity: "high",
    description: "Fausse provocation marketing",
  },
  {
    pattern: "the brutal truth",
    category: "fake_vulnerability",
    severity: "high",
    description: "Fausse gravité sensationnaliste",
  },
  {
    pattern: "je n'aurais jamais cru",
    category: "fake_vulnerability",
    severity: "medium",
    description: "Mélodrame LinkedIn artificiel",
  },
  {
    pattern: "voici le secret",
    category: "empty_hook",
    severity: "high",
    description: "Promesse clickbait creuse",
  },
  {
    pattern: "en conclusion",
    category: "formulaic_transition",
    severity: "high",
    description: "Conclusion scolaire à bannir d'un post LinkedIn",
  },
  {
    pattern: "en fin de compte",
    category: "formulaic_transition",
    severity: "low",
    description: "Remplissage de fin de texte",
  },
  {
    pattern: "catalyseur",
    category: "corporate_jargon",
    severity: "medium",
    description: "Jargon ampoulé",
  },
  {
    pattern: "synergie",
    category: "corporate_jargon",
    severity: "high",
    description: "Buzzword corporate cliché",
  },
  {
    pattern: "levier de croissance",
    category: "corporate_jargon",
    severity: "medium",
    description: "Cliché managérial",
  },
  {
    pattern: "mindset",
    category: "corporate_jargon",
    severity: "medium",
    description: "Anglicisme galvaudé",
  },
  {
    pattern: "remettre en question le statu quo",
    category: "corporate_jargon",
    severity: "high",
    description: "Posture héroïque sans contenu",
  },
  {
    pattern: "unlock your potential",
    category: "ai_slop",
    severity: "high",
    description: "Slogan de coaching générique",
  },
  {
    pattern: "libérez votre potentiel",
    category: "ai_slop",
    severity: "high",
    description: "Slogan de coaching générique",
  },
  {
    pattern: "un voyage passionnant",
    category: "ai_slop",
    severity: "high",
    description: "Métaphore sirupeuse ('an exciting journey')",
  },
  {
    pattern: "delve into",
    category: "ai_slop",
    severity: "high",
    description: "Marqueur numéro 1 des textes générés par ChatGPT/Claude",
  },
  {
    pattern: "crucial role",
    category: "ai_slop",
    severity: "high",
    description: "Formulation standard de résumé IA",
  },
  {
    pattern: "rôle crucial",
    category: "ai_slop",
    severity: "medium",
    description: "Formulation standard de résumé IA",
  },
  {
    pattern: "tapestry",
    category: "ai_slop",
    severity: "high",
    description: "Tic de langage LLM poétisant",
  },
  {
    pattern: "beacon of",
    category: "ai_slop",
    severity: "high",
    description: "Métaphore théâtrale IA",
  },
  {
    pattern: "dans cet article",
    category: "formulaic_transition",
    severity: "high",
    description: "Inadapté à un post LinkedIn",
  },
];

/**
 * Analyse un texte pour détecter les clichés et calcule un score de densité (0-100).
 */
export function analyzeCliches(text: string): {
  score: number;
  matches: { pattern: string; description: string; index: number }[];
} {
  if (!text || text.trim().length === 0) {
    return { score: 0, matches: [] };
  }

  const normalized = text.toLowerCase();
  const matches: { pattern: string; description: string; index: number }[] = [];
  let totalPenalty = 0;

  for (const item of CLICHE_PATTERNS) {
    const p = item.pattern.toLowerCase();
    let searchStart = 0;

    while (true) {
      const idx = normalized.indexOf(p, searchStart);
      if (idx === -1) break;

      matches.push({
        pattern: item.pattern,
        description: item.description,
        index: idx,
      });

      if (item.severity === "high") totalPenalty += 12;
      else if (item.severity === "medium") totalPenalty += 7;
      else totalPenalty += 3;

      searchStart = idx + p.length;
    }
  }

  // Normalisation sur une échelle 0-100
  const score = Math.min(100, Math.round(totalPenalty));
  return { score, matches };
}
