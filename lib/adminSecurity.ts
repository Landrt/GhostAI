import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const DEFAULT_ADMIN_SECRET_KEY = "ghost-admin-key-2026";
export const DEFAULT_MASTER_PASSWORD_CLEAR = "GhostAdmin2026!";

const SIGNING_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "ghostai-security-fallback-secret-key-32ch";

/**
 * Récupère ou initialise la configuration de sécurité du dashboard admin en base.
 */
export async function getAdminSecurityConfig() {
  try {
    let config = await prisma.adminSecurityConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      const defaultHash = await bcrypt.hash(DEFAULT_MASTER_PASSWORD_CLEAR, 10);
      config = await prisma.adminSecurityConfig.create({
        data: {
          id: "default",
          adminSecretKey: DEFAULT_ADMIN_SECRET_KEY,
          adminPasswordHash: defaultHash,
        },
      });
    }

    return config;
  } catch (err) {
    console.error("Erreur lecture adminSecurityConfig:", err);
    // Fallback mémoire sécurisé si la base est temporairement en transition
    return {
      id: "default",
      adminSecretKey: process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_SECRET_KEY,
      adminPasswordHash: null,
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    };
  }
}

/**
 * Vérifie si une clé secrète fournie correspond à la clé d'accès configurée.
 */
export async function verifyAdminSecretKey(keyToCheck: string): Promise<boolean> {
  if (!keyToCheck || typeof keyToCheck !== "string") return false;
  const config = await getAdminSecurityConfig();
  return keyToCheck.trim() === config.adminSecretKey.trim();
}

/**
 * Vérifie le mot de passe maître saisi contre le hash bcrypt enregistré en base.
 */
export async function verifyMasterPassword(password: string): Promise<{
  isValid: boolean;
  isLocked?: boolean;
  lockedUntil?: Date | null;
}> {
  const config = await getAdminSecurityConfig();

  // Vérification de verrouillage temporaire anti-brute force
  if (config.lockedUntil && new Date() < new Date(config.lockedUntil)) {
    return { isValid: false, isLocked: true, lockedUntil: config.lockedUntil };
  }

  // Si aucun hash n'existe encore, on compare avec le mot de passe par défaut
  let isMatch = false;
  if (config.adminPasswordHash) {
    isMatch = await bcrypt.compare(password, config.adminPasswordHash);
  } else {
    isMatch = password === DEFAULT_MASTER_PASSWORD_CLEAR;
  }

  if (isMatch) {
    // Réinitialiser les tentatives échouées
    try {
      await prisma.adminSecurityConfig.update({
        where: { id: "default" },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    } catch {}
    return { isValid: true };
  } else {
    // Incrémenter les tentatives échouées (verrouillage de 15 minutes à 5 tentatives erronées)
    const newAttempts = (config.failedAttempts || 0) + 1;
    const shouldLock = newAttempts >= 5;
    const lockDuration = 15 * 60 * 1000; // 15 min

    try {
      await prisma.adminSecurityConfig.update({
        where: { id: "default" },
        data: {
          failedAttempts: newAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + lockDuration) : null,
        },
      });
    } catch {}

    return {
      isValid: false,
      isLocked: shouldLock,
      lockedUntil: shouldLock ? new Date(Date.now() + lockDuration) : null,
    };
  }
}

/**
 * Met à jour la clé secrète d'URL (Gatekeeper Key).
 */
export async function updateAdminSecretKey(newKey: string): Promise<boolean> {
  const cleanKey = newKey.trim();
  if (cleanKey.length < 8) {
    throw new Error("La clé secrète doit comporter au moins 8 caractères.");
  }

  await prisma.adminSecurityConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      adminSecretKey: cleanKey,
      adminPasswordHash: await bcrypt.hash(DEFAULT_MASTER_PASSWORD_CLEAR, 10),
    },
    update: {
      adminSecretKey: cleanKey,
    },
  });

  return true;
}

/**
 * Met à jour le mot de passe maître après vérification de l'ancien.
 */
export async function updateMasterPassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  const check = await verifyMasterPassword(oldPassword);
  if (!check.isValid) {
    throw new Error("L'ancien mot de passe maître est incorrect.");
  }

  if (newPassword.length < 8) {
    throw new Error("Le nouveau mot de passe doit comporter au moins 8 caractères.");
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.adminSecurityConfig.update({
    where: { id: "default" },
    data: {
      adminPasswordHash: newHash,
      failedAttempts: 0,
      lockedUntil: null,
    },
  });

  return true;
}

/**
 * Utilitaires cryptographiques pour les cookies sécurisés signés
 */
export function generateSignedSecurityToken(type: "gate" | "vault"): string {
  const timestamp = Date.now();
  const payload = `${type}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

export function verifySignedSecurityToken(
  token: string | undefined | null,
  expectedType: "gate" | "vault",
  maxAgeMs: number
): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [type, timestampStr, signature] = parts;
  if (type !== expectedType) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
    return false; // Token expiré
  }

  const expectedPayload = `${type}:${timestampStr}`;
  const expectedSignature = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(expectedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "utf-8"),
    Buffer.from(expectedSignature, "utf-8")
  );
}
