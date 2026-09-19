import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 0. Rate Limiting anti-brute-force sur les routes sensibles d'authentification
  const isAuthEndpoint =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register") ||
    /login|signin|auth|token/i.test(pathname);

  if (isAuthEndpoint && req.method === "POST") {
    const rateLimit = checkRateLimit(`auth:${ip}`, 5, 15000); // 5 tentatives POST / 15 secondes
    if (!rateLimit.success) {
      const resp429 = NextResponse.json(
        {
          error: "Trop de tentatives d'authentification. Veuillez réessayer dans quelques secondes.",
          retryAfter: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.reset),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        resp429.headers.set(k, v);
      }
      return resp429;
    }
  }

  // Rate Limiting de protection générale sur les routes API publiques (/api/*)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks")) {
    const apiRateLimit = checkRateLimit(`api:${ip}`, 100, 60000); // 100 requêtes / minute
    if (!apiRateLimit.success) {
      const resp429 = NextResponse.json(
        {
          error: "Limite de requêtes API atteinte. Veuillez patienter.",
          retryAfter: apiRateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(apiRateLimit.reset),
            "X-RateLimit-Limit": String(apiRateLimit.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(apiRateLimit.reset),
          },
        }
      );
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        resp429.headers.set(k, v);
      }
      return resp429;
    }
  }

  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  // Mode Développeur : Auto-Bypass d'authentification si DEV_BYPASS_AUTH=true ou ?dev=true
  const isDev = process.env.NODE_ENV !== "production";
  const devBypassEnabled = process.env.DEV_BYPASS_AUTH === "true";
  const hasDevQuery = req.nextUrl.searchParams.get("dev") === "true";
  const shouldAutoBypass = isDev && (devBypassEnabled || hasDevQuery);

  if (
    shouldAutoBypass &&
    !token &&
    pathname.startsWith("/app") &&
    !pathname.startsWith("/api/")
  ) {
    const bypassUrl = new URL("/dev-bypass", req.url);
    bypassUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(bypassUrl);
  }

  // 1. Protection du Dashboard Admin : Double Sas (Clé secrète d'URL & Mot de passe maître)
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/admin-vault"
  ) {
    // 1.0 Endpoint public de déverrouillage de la clé d'URL
    if (pathname === "/api/admin/security/unlock") {
      return NextResponse.next();
    }

    // 1.1 Si la clé d'accès est fournie dans l'URL (?key=...)
    const accessKey = req.nextUrl.searchParams.get("key");
    if (accessKey) {
      const cleanUrl = pathname === "/admin-vault" ? "/admin" : pathname;
      const unlockUrl = new URL("/api/admin/security/unlock", req.url);
      unlockUrl.searchParams.set("key", accessKey);
      unlockUrl.searchParams.set("callbackUrl", cleanUrl);
      return NextResponse.redirect(unlockUrl);
    }

    const hasGateCookie = Boolean(req.cookies.get("ghost_gate_unlocked")?.value);
    const hasVaultCookie = Boolean(req.cookies.get("ghost_admin_vault")?.value);

    // 1.2 SAS 1 : Camouflage 404 si la porte d'accès n'a pas été déverrouillée par la clé secrète
    if (!hasGateCookie) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }

      // Fausse page 404 : silence radio complet pour tout visiteur ou scanner
      const notFoundHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>404: Cette page est introuvable</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; height: 100vh; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0; background: #fff; color: #000; }
    h1 { display: inline-block; margin: 0 20px 0 0; padding: 0 23px 0 0; font-size: 24px; font-weight: 500; vertical-align: top; border-right: 1px solid rgba(0, 0, 0, .3); line-height: 49px; }
    div { display: inline-block; text-align: left; }
    h2 { font-size: 14px; font-weight: 400; line-height: 49px; margin: 0; }
  </style>
</head>
<body>
  <div>
    <h1>404</h1>
    <div>
      <h2>Cette page est introuvable.</h2>
    </div>
  </div>
</body>
</html>`;

      const notFoundResp = new NextResponse(notFoundHtml, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        notFoundResp.headers.set(k, v);
      }
      return notFoundResp;
    }

    // 1.3 SAS 2 : Sas de Mot de Passe Maître (Vault)
    const isLoginVaultPage = pathname === "/admin-vault";
    const isSecurityApi = pathname.startsWith("/api/admin/security");

    if (!hasVaultCookie && !isLoginVaultPage && !isSecurityApi) {
      const vaultUrl = new URL("/admin-vault", req.url);
      vaultUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(vaultUrl);
    }

    // Si le vault est déjà déverrouillé et qu'on tente d'accéder à /admin-vault, rediriger vers /admin
    if (hasVaultCookie && isLoginVaultPage) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // 1.4 Vérification de la session utilisateur admin (si la porte et le vault sont franchis)
    if (!token && !isLoginVaultPage && !isSecurityApi) {
      if (shouldAutoBypass) {
        const bypassUrl = new URL("/dev-bypass", req.url);
        bypassUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(bypassUrl);
      }

      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protection des routes /app/* (espace membre utilisateur)
  if (pathname.startsWith("/app")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const redirectResp = NextResponse.redirect(loginUrl);
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        redirectResp.headers.set(k, v);
      }
      return redirectResp;
    }
  }

  // 3. Redirection si utilisateur déjà connecté tentant d'aller sur /login ou /register
  if ((pathname === "/login" || pathname === "/register") && token) {
    const redirectResp = NextResponse.redirect(new URL("/app", req.url));
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      redirectResp.headers.set(k, v);
    }
    return redirectResp;
  }

  // 4. Traitement standard avec en-têtes de sécurité
  let response = NextResponse.next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(k, v);
  }

  // 5. Interception du code de parrainage (?ref=code) -> Pose du cookie 60 jours
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref) {
    const cleanRef = ref.trim().toLowerCase();
    response.cookies.set("ghostai_ref", cleanRef, {
      maxAge: 60 * 24 * 60 * 60, // 60 jours
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
