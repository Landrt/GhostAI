export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const dns = await import("dns");
      if (typeof dns.setDefaultResultOrder === "function") {
        dns.setDefaultResultOrder("ipv4first");
      }
    } catch {}

    // Optimisation mémoire : déclenchement d'un ramasse-miettes léger périodique
    if (typeof (globalThis as any).gc === "function") {
      const gcTimer = setInterval(() => {
        try {
          (globalThis as any).gc();
        } catch {}
      }, 700);

      if (typeof gcTimer.unref === "function") {
        gcTimer.unref();
      }
    }

    // Pre-warming de la connexion Prisma à Neon pour éliminer le délai de démarrage à froid
    try {
      const { prisma } = await import("@/lib/prisma");
      prisma
        .$connect()
        .then(() => prisma.adminSecurityConfig.findFirst())
        .then(() => {
          console.log("✓ Connexion BDD Neon pré-établie et prête !");
        })
        .catch((err: any) => {
          console.warn("Pré-chauffage Prisma :", err.message);
        });
    } catch {}
  }
}
