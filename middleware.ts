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

  // 1. Protection stricte des routes d'administration /admin/* et /api/admin/*
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        const jsonResp = NextResponse.json(
          { error: "Accès refusé. Authentification administrateur requise." },
          { status: 401 }
        );
        for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
          jsonResp.headers.set(k, v);
        }
        jsonResp.headers.set("WWW-Authenticate", 'Bearer realm="admin"');
        return jsonResp;
      }

      // Pour les interfaces web admin : renvoyer un statut 401 strict pour bloquer les scanners et accès directs
      const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>401 - Accès Refusé | GhostAI Admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F5F6F3; color: #211D1A; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #FFFFFF; border: 1px solid #DEDAD1; border-radius: 12px; padding: 36px 28px; max-width: 440px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { font-size: 20px; font-weight: 700; margin: 0 0 8px; color: #211D1A; }
    p { font-size: 13px; color: #6B6660; line-height: 1.5; margin: 0 0 24px; }
    .btn { display: inline-block; background: #127749; color: #FFFFFF; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px; margin-bottom: 12px;">🔒</div>
    <h1>Accès Refusé (HTTP 401)</h1>
    <p>Cette section est strictement réservée aux administrateurs authentifiés de GhostAI.</p>
    <a href="/login?callbackUrl=${encodeURIComponent(pathname)}" class="btn">Se connecter</a>
  </div>
</body>
</html>`;

      const deniedResp = new NextResponse(htmlContent, {
        status: 401,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "WWW-Authenticate": 'Bearer realm="admin"',
        },
      });
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        deniedResp.headers.set(k, v);
      }
      return deniedResp;
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
