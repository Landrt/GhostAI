interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Magasin en mémoire pour le suivi des requêtes par clé (IP / endpoint)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Nettoyage régulier pour éviter toute accumulation mémoire
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    });
  }, 30000);

  // Permet au processus Node de se terminer sans être bloqué par ce timer
  if (typeof (cleanupTimer as any).unref === "function") {
    (cleanupTimer as any).unref();
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // en secondes
}

/**
 * Vérifie si une clé a dépassé son quota dans la fenêtre temporelle spécifiée.
 *
 * @param key Identifiant unique (ex: "auth:127.0.0.1")
 * @param limit Nombre maximum de requêtes autorisées dans la fenêtre
 * @param windowMs Durée de la fenêtre en millisecondes (ex: 15000 pour 15s)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      reset: Math.max(1, Math.ceil(windowMs / 1000)),
    };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const reset = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

  if (record.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  return {
    success: true,
    limit,
    remaining,
    reset,
  };
}
