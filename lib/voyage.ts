/**
 * Client Voyage AI pour le calcul des embeddings (modèle voyage-3, 1024 dimensions)
 */

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY || "";

export const isVoyageConfigured = Boolean(
  VOYAGE_API_KEY && !VOYAGE_API_KEY.startsWith("dev_") && VOYAGE_API_KEY.length > 15
);

export async function getVoyageEmbedding(text: string): Promise<number[] | null> {
  if (!text || text.trim().length === 0) return null;

  if (!isVoyageConfigured) {
    // Mode développement/fallback : simulation d'un vecteur déterministe normalisé de 1024 dimensions
    const vec = new Array(1024).fill(0);
    for (let i = 0; i < text.length; i++) {
      vec[i % 1024] += text.charCodeAt(i);
    }
    const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  }

  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        input: [text],
        model: "voyage-3",
      }),
    });

    if (!res.ok) {
      console.error("Erreur Voyage AI HTTP:", res.status, await res.text());
      return null;
    }

    const json = (await res.json()) as { data: { embedding: number[] }[] };
    return json?.data?.[0]?.embedding || null;
  } catch (err) {
    console.error("Erreur appel Voyage AI:", err);
    return null;
  }
}

export function computeAverageEmbedding(embeddings: number[][]): number[] | null {
  if (!embeddings || embeddings.length === 0) return null;
  const dim = embeddings[0].length;
  const sum = new Array(dim).fill(0);

  for (const emb of embeddings) {
    for (let i = 0; i < dim; i++) {
      sum[i] += emb[i];
    }
  }

  const avg = sum.map((v) => v / embeddings.length);
  const norm = Math.sqrt(avg.reduce((acc, v) => acc + v * v, 0)) || 1;
  return avg.map((v) => v / norm);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const sim = dotProduct / denominator;
  // normalise entre 0 et 1 (typiquement cosine similarity sur embeddings est entre 0.4 et 0.95)
  return Math.max(0, Math.min(1, sim));
}
