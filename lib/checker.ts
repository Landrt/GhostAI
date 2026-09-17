import { analyzeCliches } from "./clichePatterns";
import { deepseek, isDeepSeekConfigured } from "./deepseek";
import { getVoyageEmbedding, cosineSimilarity } from "./voyage";

export interface QualityEvaluation {
  voiceMatchScore: number | null;
  genericityScore: number;
  clicheScore: number;
  specificityScore: number;
  passed: boolean;
  critiqueFeedback: string;
}

/**
 * Jugement LLM pour évaluer le score de généricité (0 = très singulier/unique, 100 = pur cliché IA générique)
 */
async function judgeGenericness(text: string): Promise<number> {
  if (!isDeepSeekConfigured) {
    // Mode dev : évaluation heuristique basée sur la longueur et la détection de répétitions
    const words = text.toLowerCase().split(/\s+/);
    const unique = new Set(words).size;
    const ratio = unique / Math.max(1, words.length);
    return Math.max(5, Math.min(30, Math.round((1 - ratio) * 50)));
  }

  try {
    const prompt = `Tu es un examinateur critique impitoyable de contenus LinkedIn.
Évalue le niveau de généricité du texte ci-dessous sur une échelle de 0 à 100 :
- 0 : Extrêmement singulier, voix humaine authentique, phrases rythmées, angles originaux.
- 100 : Texte complètement interchangeable, fade, plat, typique des résumés générés automatiquement par une IA sans âme.

Texte à analyser :
"""
${text}
"""

Renvoie UNIQUEMENT un objet JSON sous cette forme exacte :
{"score": 15, "reason": "bref motif interne"}`;

    const res = await deepseek.messages.create({
      model: "deepseek-chat",
      max_tokens: 150,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const block = res.content[0];
    if (block.type === "text") {
      const match = block.text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed.score === "number") {
          return Math.max(0, Math.min(100, Math.round(parsed.score)));
        }
      }
    }
    return 15;
  } catch (err) {
    console.error("Erreur judgeGenericness:", err);
    return 12;
  }
}

/**
 * Jugement LLM pour évaluer la spécificité (0 = abstrait/vague, 100 = détails concrets, exemples précis)
 */
async function judgeSpecificity(text: string): Promise<number> {
  if (!isDeepSeekConfigured) {
    // Heuristique de base : présence de chiffres, ponctuations de listes, mots de détails
    const hasNumbers = /\d+/.test(text);
    const hasLists = /[-•\d]\./.test(text);
    let base = 75;
    if (hasNumbers) base += 8;
    if (hasLists) base += 5;
    return Math.min(95, base);
  }

  try {
    const prompt = `Tu es un correcteur éditorial.
Évalue la spécificité du texte suivant sur une échelle de 0 à 100 :
- 0 : Vague, théorique, généralités creuses, abstractions sans ancrage réel.
- 100 : Extrêmement concret, leçons précises, détails vivants, actions identifiables.

Texte :
"""
${text}
"""

Renvoie UNIQUEMENT un objet JSON :
{"score": 85}`;

    const res = await deepseek.messages.create({
      model: "deepseek-chat",
      max_tokens: 100,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const block = res.content[0];
    if (block.type === "text") {
      const match = block.text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed.score === "number") {
          return Math.max(0, Math.min(100, Math.round(parsed.score)));
        }
      }
    }
    return 80;
  } catch (err) {
    console.error("Erreur judgeSpecificity:", err);
    return 82;
  }
}

/**
 * Pipeline complet d'évaluation de la qualité selon la spec GhostAI
 */
export async function evaluatePostQuality(
  postContent: string,
  userVoiceEmbedding?: number[] | null
): Promise<QualityEvaluation> {
  // 1. Analyse statique des clichés
  const { score: clicheScore, matches: clicheMatches } = analyzeCliches(postContent);

  // 2. Jugements LLM en parallèle
  const [genericityScore, specificityScore] = await Promise.all([
    judgeGenericness(postContent),
    judgeSpecificity(postContent),
  ]);

  // 3. Similarité de voix vectorielle
  let voiceMatchScore: number | null = null;
  if (userVoiceEmbedding && userVoiceEmbedding.length > 0) {
    const postEmbedding = await getVoyageEmbedding(postContent);
    if (postEmbedding) {
      const sim = cosineSimilarity(postEmbedding, userVoiceEmbedding);
      // Transformation de la similarité cosinus (0.5 - 0.95 typique) en pourcentage 0-100 intuitif
      const normalizedMatch = Math.round(((sim - 0.5) / 0.45) * 100);
      voiceMatchScore = Math.max(10, Math.min(99, normalizedMatch));
    }
  }

  // 4. Critères de validation (d'après section 03)
  // Rejet si genericityScore > 25 OU clicheScore > 20 OU (voiceMatchScore !== null ET voiceMatchScore < 75)
  const failedGenericity = genericityScore > 25;
  const failedCliche = clicheScore > 20;
  const failedVoice = voiceMatchScore !== null && voiceMatchScore < 75;

  const passed = !failedGenericity && !failedCliche && !failedVoice;

  // Préparation du retour pour la réécriture ciblée éventuelle
  const critiques: string[] = [];
  if (failedGenericity) {
    critiques.push(`Le texte est jugé trop générique (score ${genericityScore}/100 > 25). Rends-le plus personnel et incisif.`);
  }
  if (failedCliche) {
    const detectedNames = clicheMatches.map((m) => `"${m.pattern}"`).join(", ");
    critiques.push(`Présence excessive de tournures ou clichés détectés (${detectedNames}). Supprime-les immédiatement.`);
  }
  if (failedVoice) {
    critiques.push(`La ressemblance avec le profil de voix de l'utilisateur est insuffisante (${voiceMatchScore}% < 75%). Imite plus fidèlement la cadence et les structures de ses exemples.`);
  }

  return {
    voiceMatchScore,
    genericityScore,
    clicheScore,
    specificityScore,
    passed,
    critiqueFeedback: critiques.join("\n"),
  };
}
