import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
        Prêt à publier des posts qui te ressemblent vraiment ?
      </h2>
      <p className="text-base text-ink-quiet max-w-xl mx-auto">
        Démarre gratuitement aujourd&apos;hui. Sans carte bancaire. Avec la vérification qualité complète incluse dès le premier post.
      </p>
      <div className="pt-2">
        <Link href="/register">
          <Button variant="secondary" size="lg">
            Créer ton premier post
          </Button>
        </Link>
      </div>
    </section>
  );
}
