export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Optimisation mémoire : déclenchement d'un ramasse-miettes léger périodique
    // si Node.js est démarré avec l'option --expose-gc.
    // Cela permet de libérer immédiatement les requêtes et tampons réseau,
    // garantissant une mémoire RSS stable lors des tests de charge (DevTcheck).
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
  }
}
