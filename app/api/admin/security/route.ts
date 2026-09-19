import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkAdminAccess, recordAuditLog } from "@/lib/admin";
import {
  getAdminSecurityConfig,
  verifyMasterPassword,
  updateAdminSecretKey,
  updateMasterPassword,
  generateSignedSecurityToken,
} from "@/lib/adminSecurity";

const GATE_COOKIE_NAME = "ghost_gate_unlocked";
const VAULT_COOKIE_NAME = "ghost_admin_vault";

// Durée de validité des cookies de sécurité :
// Porte (Gate) : 7 jours
// Mot de passe maître (Vault) : 8 heures
const GATE_MAX_AGE = 7 * 24 * 60 * 60;
const VAULT_MAX_AGE = 8 * 60 * 60;

/**
 * GET /api/admin/security
 * Récupère la clé secrète actuelle et les paramètres de sécurité (réservé aux admins connectés)
 */
export async function GET() {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const config = await getAdminSecurityConfig();
    return NextResponse.json({
      adminSecretKey: config.adminSecretKey,
      updatedAt: config.updatedAt,
      failedAttempts: config.failedAttempts,
      isLocked: Boolean(config.lockedUntil && new Date() < new Date(config.lockedUntil)),
      lockedUntil: config.lockedUntil,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/security
 * Valide le mot de passe maître saisi dans le sas `/admin-vault`
 * et émet le cookie signé `ghost_admin_vault` (8 heures).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { masterPassword } = body;

    if (!masterPassword) {
      return NextResponse.json(
        { error: "Le mot de passe maître est obligatoire." },
        { status: 400 }
      );
    }

    const verification = await verifyMasterPassword(masterPassword);

    if (verification.isLocked) {
      return NextResponse.json(
        {
          error: "Trop de tentatives erronées. L'accès est temporairement verrouillé.",
          lockedUntil: verification.lockedUntil,
        },
        { status: 429 }
      );
    }

    if (!verification.isValid) {
      return NextResponse.json(
        { error: "Mot de passe maître incorrect." },
        { status: 401 }
      );
    }

    // Émettre le jeton signé de session vault
    const vaultToken = generateSignedSecurityToken("vault");

    const response = NextResponse.json({
      success: true,
      message: "Accès au dashboard autorisé.",
    });

    // Poser le cookie de session maître sécurisé (HttpOnly, SameSite)
    response.cookies.set(VAULT_COOKIE_NAME, vaultToken, {
      maxAge: VAULT_MAX_AGE,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur interne" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/security
 * Modification de la clé secrète ou du mot de passe maître depuis le dashboard
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const access = await checkAdminAccess(session?.user);

  if (!access.isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Changement de la clé secrète d'URL
    if (action === "update_secret_key") {
      const { newSecretKey } = body;
      await updateAdminSecretKey(newSecretKey);

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: "ADMIN_SECRET_KEY_UPDATED",
        severity: "warning",
        details: { keyLength: newSecretKey.length },
      });

      // Régénérer et rafraîchir le cookie de porte de l'admin actuel
      const gateToken = generateSignedSecurityToken("gate");
      const response = NextResponse.json({
        success: true,
        message: "Clé secrète d'URL mise à jour avec succès.",
      });

      response.cookies.set(GATE_COOKIE_NAME, gateToken, {
        maxAge: GATE_MAX_AGE,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return response;
    }

    // 2. Changement du mot de passe maître admin
    if (action === "update_master_password") {
      const { oldPassword, newPassword } = body;
      await updateMasterPassword(oldPassword, newPassword);

      await recordAuditLog({
        adminEmail: access.email || "admin",
        action: "ADMIN_MASTER_PASSWORD_UPDATED",
        severity: "critical",
      });

      return NextResponse.json({
        success: true,
        message: "Mot de passe maître administrateur modifié avec succès.",
      });
    }

    // 3. Verrouillage immédiat du dashboard (Logout de sécurité)
    if (action === "lock_dashboard") {
      const response = NextResponse.json({
        success: true,
        message: "Dashboard verrouillé avec succès.",
      });

      // Supprimer le cookie de session maître
      response.cookies.delete(VAULT_COOKIE_NAME);

      return response;
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur de traitement" }, { status: 400 });
  }
}
