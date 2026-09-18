import { deepseek, isDeepSeekConfigured } from "@/lib/deepseek";
import { VoiceProfileData, PersonalityProfileData } from "@/lib/generator";

export interface RepurposedPost {
  id: string;
  title: string;
  format: "story" | "educational" | "framework" | "debate";
  angle: string;
  hook: string;
  content: string;
  locked?: boolean;
}

export interface RepurposedCarouselSlide {
  slideNumber: number;
  header: string;
  body: string;
  visualNote?: string;
}

export interface RepurposedCarousel {
  id: string;
  title: string;
  hook: string;
  slides: RepurposedCarouselSlide[];
  locked?: boolean;
}

export interface RepurposedHook {
  id: string;
  category: "counter_intuitive" | "question" | "data_drop" | "story_opener" | "bold_statement";
  text: string;
  targetAngle: string;
  locked?: boolean;
}

export interface RepurposedOpinion {
  id: string;
  statement: string;
  content: string;
  counterConsensus: string;
  locked?: boolean;
}

export interface RepurposedCaseStudy {
  id: string;
  title: string;
  problem: string;
  solution: string;
  result: string;
  keyTakeaway: string;
  locked?: boolean;
}

export interface RepurposedComment {
  id: string;
  angle: string;
  comment: string;
  contextToDeploy: string;
  locked?: boolean;
}

export interface RepurposePackResult {
  summary: string;
  keyThemes: string[];
  posts: RepurposedPost[];
  carousels: RepurposedCarousel[];
  hooks: RepurposedHook[];
  opinions: RepurposedOpinion[];
  caseStudies: RepurposedCaseStudy[];
  comments: RepurposedComment[];
  isSampleLocked: boolean;
}

export interface RepurposeOptions {
  sourceContent: string;
  sourceTitle?: string;
  sourceType: "url" | "youtube" | "text" | "file";
  plan: "free" | "pro" | "promax";
  voiceProfile?: VoiceProfileData | null;
  personalityProfile?: PersonalityProfileData | null;
}

/**
 * Construit le prompt système pour l'Atomiseur
 */
function buildAtomizerSystemPrompt(
  voiceProfile?: VoiceProfileData | null,
  personalityProfile?: PersonalityProfileData | null
): string {
  let voicePrompt = "";
  if (voiceProfile) {
    const directness = Math.round((voiceProfile.directness ?? 0.7) * 100);
    const storytelling = Math.round((voiceProfile.storytelling ?? 0.5) * 100);
    const formality = Math.round((voiceProfile.formality ?? 0.4) * 100);
    const humor = Math.round((voiceProfile.humor ?? 0.3) * 100);
    const technicality = Math.round((voiceProfile.technicality ?? 0.6) * 100);
    const emotionality = Math.round((voiceProfile.emotionality ?? 0.4) * 100);

    voicePrompt = `
PROFIL DE VOIX DU CRÉATEUR :
- Franchise/Directness : ${directness}%
- Récit/Storytelling : ${storytelling}%
- Formalité : ${formality}%
- Humour / Ironie : ${humor}%
- Technicité : ${technicality}%
- Émotion : ${emotionality}%
`;
    if (voiceProfile.preferredPhrases?.length) {
      voicePrompt += `Phrases fétiches : ${voiceProfile.preferredPhrases.join(", ")}\n`;
    }
    if (voiceProfile.avoidedPhrases?.length) {
      voicePrompt += `Mots/expressions interdits : ${voiceProfile.avoidedPhrases.join(", ")}\n`;
    }
  }

  return `Tu es l'Atomiseur de Contenu (le moteur de repurposing LinkedIn multiformat) de GhostAI.
Ta mission : ingérer un contenu source brut (transcription vidéo YouTube, article de fond, podcast, notes de recherche) et le découper chirurgicalement en un pack complet d'actifs LinkedIn viraux et mémorables.

RÈGLES D'OR DE GHOSTWRITING :
1. AUCUN CLICHÉ D'IA : Interdiction absolue d'utiliser "Dans le paysage actuel", "Game changer", "Plongeons dans", "Voici pourquoi", "En conclusion", "Catalyseur", "Synergie".
2. RESPECT DU STYLE DU CRÉATEUR : Imite fidèlement le profil de voix fourni ci-dessous.
3. VÉRACITÉ & VALEUR CONCRÈTE : Ne fabrique pas de faux chiffres. Base-toi à 100% sur les leçons, anecdotes et idées du contenu source.
4. RYTHME LINKEDIN : Lignes courtes, sauts de lignes fréquents, accroches magnétiques dès la première phrase.
${voicePrompt}

FORMAT DE RÉPONSE OBLIGATOIRE :
Tu dois répondre UNIQUEMENT par un objet JSON valide (aucun texte avant ou après, pas de balises inutiles en dehors de l'éventuel \`\`\`json...\`\`\`).
La structure JSON doit respecter rigoureusement le schéma attendu.`;
}

/**
 * Génère le pack d'atomisation complet
 */
export async function generateRepurposePack(options: RepurposeOptions): Promise<RepurposePackResult> {
  const { sourceContent, sourceTitle, sourceType, plan, voiceProfile, personalityProfile } = options;

  // Détermination des volumes cibles selon le forfait
  const counts = {
    free: { posts: 3, carousels: 1, hooks: 1, opinions: 1, caseStudies: 1, comments: 1 },
    pro: { posts: 10, carousels: 3, hooks: 10, opinions: 3, caseStudies: 2, comments: 5 },
    promax: { posts: 15, carousels: 5, hooks: 15, opinions: 5, caseStudies: 5, comments: 10 },
  }[plan] || { posts: 10, carousels: 3, hooks: 10, opinions: 3, caseStudies: 2, comments: 5 };

  if (!isDeepSeekConfigured) {
    return generateFallbackPack(sourceContent, sourceTitle, plan);
  }

  const systemPrompt = buildAtomizerSystemPrompt(voiceProfile, personalityProfile);

  const userPrompt = `Voici la source à atomiser (Type: ${sourceType}, Titre: "${sourceTitle || "Sans titre"}") :

"""
${sourceContent.slice(0, 18000)}
"""

Génère un pack complet avec exactement les volumes suivants :
- summary: Résumé de 2 à 3 phrases percutantes de la source.
- keyThemes: Liste de 3 à 5 thèmes clés identifiés.
- posts (${counts.posts} posts) : Chaque post a { id: string, title: string, format: "story"|"educational"|"framework"|"debate", angle: string, hook: string, content: string } (Le content doit être un post LinkedIn complet prêt à publier).
- carousels (${counts.carousels} carrousels) : Chaque carrousel a { id: string, title: string, hook: string, slides: [{ slideNumber: number, header: string, body: string, visualNote: string }] } (5 à 7 slides par carrousel).
- hooks (${counts.hooks} accroches virales) : Chaque hook a { id: string, category: "counter_intuitive"|"question"|"data_drop"|"story_opener"|"bold_statement", text: string, targetAngle: string }.
- opinions (${counts.opinions} prises de position tranchées) : { id: string, statement: string, content: string, counterConsensus: string }.
- caseStudies (${counts.caseStudies} études de cas concrètes) : { id: string, title: string, problem: string, solution: string, result: string, keyTakeaway: string }.
- comments (${counts.comments} commentaires d'autorité à poser sous d'autres posts) : { id: string, angle: string, comment: string, contextToDeploy: string }.

Réponds EXCLUSIVEMENT en JSON valide.`;

  try {
    const response = await deepseek.messages.create({
      model: "deepseek-chat",
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: "json_object" },
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = response.content[0];
    if (block?.type === "text") {
      let rawText = block.text.trim();
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(rawText);
      return formatRepurposeResult(parsed, plan);
    }
  } catch (err) {
    console.error("Erreur génération DeepSeek Atomiseur:", err);
  }

  return generateFallbackPack(sourceContent, sourceTitle, plan);
}

/**
 * Formate et applique les verrouillages freemium selon le plan
 */
function formatRepurposeResult(data: any, plan: "free" | "pro" | "promax"): RepurposePackResult {
  const isFree = plan === "free";

  let posts: RepurposedPost[] = (data.posts || []).map((p: any, idx: number) => ({
    id: p.id || `post-${idx + 1}`,
    title: p.title || `Post #${idx + 1}`,
    format: p.format || "educational",
    angle: p.angle || "",
    hook: p.hook || "",
    content: p.content || "",
    locked: isFree && idx >= 3,
  }));

  let carousels: RepurposedCarousel[] = (data.carousels || []).map((c: any, idx: number) => ({
    id: c.id || `carousel-${idx + 1}`,
    title: c.title || `Carrousel #${idx + 1}`,
    hook: c.hook || "",
    slides: Array.isArray(c.slides) ? c.slides : [],
    locked: isFree && idx >= 1,
  }));

  let hooks: RepurposedHook[] = (data.hooks || []).map((h: any, idx: number) => ({
    id: h.id || `hook-${idx + 1}`,
    category: h.category || "bold_statement",
    text: h.text || "",
    targetAngle: h.targetAngle || "",
    locked: isFree && idx >= 2,
  }));

  let opinions: RepurposedOpinion[] = (data.opinions || []).map((o: any, idx: number) => ({
    id: o.id || `opinion-${idx + 1}`,
    statement: o.statement || "",
    content: o.content || "",
    counterConsensus: o.counterConsensus || "",
    locked: isFree && idx >= 1,
  }));

  let caseStudies: RepurposedCaseStudy[] = (data.caseStudies || []).map((cs: any, idx: number) => ({
    id: cs.id || `case-${idx + 1}`,
    title: cs.title || `Cas #${idx + 1}`,
    problem: cs.problem || "",
    solution: cs.solution || "",
    result: cs.result || "",
    keyTakeaway: cs.keyTakeaway || "",
    locked: isFree && idx >= 1,
  }));

  let comments: RepurposedComment[] = (data.comments || []).map((cm: any, idx: number) => ({
    id: cm.id || `comment-${idx + 1}`,
    angle: cm.angle || "",
    comment: cm.comment || "",
    contextToDeploy: cm.contextToDeploy || "",
    locked: isFree && idx >= 2,
  }));

  // Pour le plan gratuit, injecter des cartes d'aperçu verrouillées si le générateur n'a produit que 3 posts
  if (isFree) {
    while (posts.length < 10) {
      const idx = posts.length + 1;
      posts.push({
        id: `post-locked-${idx}`,
        title: `Post Stratégique #${idx}`,
        format: idx % 2 === 0 ? "story" : "framework",
        angle: "Angle avancé réservé aux forfaits Pro & ProMax",
        hook: "L'erreur invisible commise par 90% des créateurs...",
        content: "",
        locked: true,
      });
    }
    while (carousels.length < 3) {
      const idx = carousels.length + 1;
      carousels.push({
        id: `carousel-locked-${idx}`,
        title: `Carrousel Slide Deck #${idx}`,
        hook: "Le framework pas-à-pas en 7 slides percutantes",
        slides: [],
        locked: true,
      });
    }
    while (hooks.length < 10) {
      const idx = hooks.length + 1;
      hooks.push({
        id: `hook-locked-${idx}`,
        category: "counter_intuitive",
        text: "Accroche virale réservée au plan Pro...",
        targetAngle: "Audience rétention",
        locked: true,
      });
    }
    while (opinions.length < 3) {
      const idx = opinions.length + 1;
      opinions.push({
        id: `opinion-locked-${idx}`,
        statement: "Prise de position contre-intuitive",
        content: "",
        counterConsensus: "Consensus de marché",
        locked: true,
      });
    }
    while (caseStudies.length < 2) {
      const idx = caseStudies.length + 1;
      caseStudies.push({
        id: `case-locked-${idx}`,
        title: "Étude de cas complète Problem / Solution / ROI",
        problem: "",
        solution: "",
        result: "",
        keyTakeaway: "",
        locked: true,
      });
    }
    while (comments.length < 5) {
      const idx = comments.length + 1;
      comments.push({
        id: `comment-locked-${idx}`,
        angle: "High-authority snip",
        comment: "",
        contextToDeploy: "",
        locked: true,
      });
    }
  }

  return {
    summary: data.summary || "Contenu source analysé et atomisé avec succès.",
    keyThemes: Array.isArray(data.keyThemes) ? data.keyThemes : ["Stratégie", "Exécution", "Vision"],
    posts,
    carousels,
    hooks,
    opinions,
    caseStudies,
    comments,
    isSampleLocked: isFree,
  };
}

/**
 * Moteur fallback déterministe pour tests et mode dev sans clé API
 */
function generateFallbackPack(
  sourceContent: string,
  sourceTitle?: string,
  plan: "free" | "pro" | "promax" = "pro"
): RepurposePackResult {
  const title = sourceTitle || "Stratégie de contenu haute performance";
  const snippet = sourceContent.slice(0, 300).trim();

  const data = {
    summary: `Atomisation approfondie de "${title}". Extraction des enseignements stratégiques et déclinaison multi-formats prête à l'emploi.`,
    keyThemes: ["Clarté du message", "Autorité naturelle", "Conversion organique", "Levier d'attention"],
    posts: [
      {
        id: "post-1",
        title: "Leçon fondamentale & Changement de paradigme",
        format: "educational",
        angle: "Contre-intuitif",
        hook: "La plupart des créateurs pensent qu'il faut plus de contenu. C'est faux.",
        content: `La plupart des créateurs pensent qu'il faut plus de contenu. C'est faux.\n\nCe qu'il vous faut, c'est extraire 10x plus de valeur d'une seule bonne idée.\n\nVoici ce que révèle "${title}" :\n\n1. Une idée forte vaut 100 posts recyclés sans âme.\n2. Si votre message ne bouscule pas une idée reçue, vous êtes invisible.\n3. La répétition n'est pas un défaut, c'est une pédagogie.\n\nArrêtez de créer à partir d'une page blanche chaque matin.\nPartez de vos convictions réelles et déclinez-les sous 5 angles différents.\n\nQuel est votre sujet pilier cette semaine ?`,
      },
      {
        id: "post-2",
        title: "L'histoire vécue : Du doute à la révélation",
        format: "story",
        angle: "Retour d'expérience franc",
        hook: "Il y a 6 mois, je passais 4 heures à écrire un post LinkedIn.",
        content: `Il y a 6 mois, je passais 4 heures à rédiger un seul post LinkedIn.\n\nLe résultat ? 12 likes. Dont ma mère et deux anciens collègues.\n\nCe jour-là, j'ai compris une chose brutale :\nLe temps passé n'a aucun lien avec l'impact généré.\n\nCe qui compte :\n→ La netteté de l'angle d'attaque dès la première seconde.\n→ L'élimination impitoyable du jargon creux.\n→ Le courage de prendre une position tranchée.\n\nAujourd'hui, une idée bien structurée produit 10 formats d'impact en moins de 15 minutes.\n\nNe cherchez pas à avoir l'air intelligent. Cherchez à être immédiatement utile.`,
      },
      {
        id: "post-3",
        title: "Framework : La règle des 3 filtres",
        format: "framework",
        angle: "Méthode actionnable",
        hook: "Avant de publier la moindre ligne, passez-la au crible de ces 3 questions :",
        content: `Avant de publier la moindre ligne sur LinkedIn, posez-vous ces 3 questions :\n\n1. Est-ce que quelqu'un de sensé pourrait soutenir le contraire ?\nSi non : c'est un truisme plat ("Il faut être à l'écoute de ses clients"). Poubelle.\n\n2. Est-ce que ce post pourrait avoir été écrit par n'importe qui ?\nSi oui : il manque votre vécu, vos chiffres ou votre point de friction personnel.\n\n3. Quelle action précise le lecteur peut-il tenter d'ici ce soir ?\nSi aucune : c'est de la philosophie théorique, pas du leadership d'opinion.\n\nLa clarté bat la complexité. Toujours.`,
      },
      {
        id: "post-4",
        title: "Le piège de la perfection",
        format: "debate",
        angle: "Débat & Mentalité",
        hook: "L'obsession de la perfection est juste une peur polie d'être jugé.",
        content: `L'obsession de la perfection n'est rien d'autre qu'une peur polie d'être jugé.\n\nPendant que vous ajustez les virgules d'un projet pour la 14ème fois, vos concurrents publient des versions imparfaites qui rencontrent déjà leur marché.\n\nLa vitesse d'itération bat la perfection statique à chaque manche.\n\nPubliez le brouillon qui vous fait un peu peur.\nC'est généralement celui qui déclenchera les meilleures conversations en DM.`,
      },
      {
        id: "post-5",
        title: "L'art de l'accroche sans racolage",
        format: "educational",
        angle: "Technique d'écriture",
        hook: "Un bon hook ne promet pas la lune. Il brise un automatisme.",
        content: `Un bon hook LinkedIn ne promet pas la lune.\nIl brise simplement le défilement automatique du pouce.\n\nComment ?\nEn mettant le doigt sur une contradiction que tout le monde ressent sans oser la nommer.\n\nExemple mou : "5 astuces pour mieux gérer votre temps."\nExemple magnétique : "Votre to-do list n'est pas trop longue. Vous avez juste peur de choisir ce qui compte."\n\nMême sujet. Impact démultiplié.\n\nLe ghostwriting de haute volée ne triche pas : il formule la vérité avec élégance.`,
      },
    ],
    carousels: [
      {
        id: "carousel-1",
        title: "Le Playbook en 5 étapes pour dominer son secteur",
        hook: "De 0 à 10 000 abonnés qualifiés sans passer 3 heures par jour sur l'écran.",
        slides: [
          {
            slideNumber: 1,
            header: "Le Mythe de la Page Blanche",
            body: "Pourquoi les meilleurs créateurs n'inventent jamais rien à partir de zéro, et comment ils recyclent chaque idée maîtresse.",
            visualNote: "Titre imposant noir sur fond crème, style éditorial minimaliste.",
          },
          {
            slideNumber: 2,
            header: "Étape 1 : Le Contenu Pilier",
            body: "Identifiez vos 3 batailles d'idées non négociables. Tout part d'une conviction réelle, pas d'une tendance passagère.",
            visualNote: "Schéma pyramidal simplifié en 3 blocs.",
          },
          {
            slideNumber: 3,
            header: "Étape 2 : La Déclinaison Chirurgicale",
            body: "Une vidéo ou un article = 1 histoire vécue, 1 framework décortiqué, 1 prise de position polarisante.",
            visualNote: "Flèches divergentes d'une source unique vers 3 sorties nettes.",
          },
          {
            slideNumber: 4,
            header: "Étape 3 : Le Filtre Anti-IA",
            body: "Supprimez tout mot que vous n'utiliseriez pas dans un café avec un ami. Votre voix est votre seule barrière à l'entrée.",
            visualNote: "Mots barrés en rouge terracotta contrastant.",
          },
          {
            slideNumber: 5,
            header: "Conclusion & Appel à l'action",
            body: "Arrêtez de courir après le volume. Privilégiez la précision chirurgicale. Enregistrez ce carrousel pour votre prochain post.",
            visualNote: "Call-to-action sobre avec bouton d'enregistrement LinkedIn.",
          },
        ],
      },
      {
        id: "carousel-2",
        title: "5 Erreurs invisibles qui tuent votre conversion",
        hook: "Pourquoi vos vues augmentent mais votre boîte mail reste désespérément vide.",
        slides: [
          {
            slideNumber: 1,
            header: "L'Illusion des Métriques de Vanité",
            body: "100 000 vues sur un meme ne paient pas les factures. Voici comment cibler les décideurs.",
            visualNote: "Graphique montrant le fossé entre vues et leads qualifiés.",
          },
          {
            slideNumber: 2,
            header: "Erreur 1 : L'Offre Invisible",
            body: "Si vos abonnés ne savent pas exactement ce que vous résolvez en 3 secondes, vous êtes juste un divertissement.",
            visualNote: "Typographie bold impactante.",
          },
          {
            slideNumber: 3,
            header: "Erreur 2 : La Peur de Polariser",
            body: "Vouloir plaire à tout le monde est le plus sûr moyen de ne laisser aucun souvenir à personne.",
            visualNote: "Citation mise en exergue.",
          },
          {
            slideNumber: 4,
            header: "Le Diagnostic",
            body: "Testez votre profil : est-ce une vitrine de CV ou une page de vente orientée résultat client ?",
            visualNote: "Checklist 3 points.",
          },
          {
            slideNumber: 5,
            header: "Ce qu'il faut changer dès maintenant",
            body: "Un positionnement clair, un lien bio orienté valeur, des études de cas hebdomadaires.",
            visualNote: "Plan d'action sur fond terracotta.",
          },
        ],
      },
    ],
    hooks: [
      {
        id: "hook-1",
        category: "counter_intuitive",
        text: "La plupart des entreprises perdent de l'argent sur LinkedIn parce qu'elles parlent d'elles-mêmes.",
        targetAngle: "Repositionnement vers le client",
      },
      {
        id: "hook-2",
        category: "data_drop",
        text: "92% des posts LinkedIn générés par IA sont identifiés et ignorés en moins de 1.5 seconde.",
        targetAngle: "Anti-cliché & authenticité",
      },
      {
        id: "hook-3",
        category: "story_opener",
        text: "J'ai refusé un contrat à 15 000€ le mois dernier. Voici la raison exacte.",
        targetAngle: "Intégrité & positionnement premium",
      },
      {
        id: "hook-4",
        category: "bold_statement",
        text: "Le 'personal branding' traditionnel est mort. Bienvenue dans l'ère de l'expertise démontrable.",
        targetAngle: "Évolution du marché B2B",
      },
      {
        id: "hook-5",
        category: "question",
        text: "Si vous deviez republier un seul de vos posts cette année, lequel mériterait vraiment d'être lu ?",
        targetAngle: "Exigence éditoriale",
      },
    ],
    opinions: [
      {
        id: "opinion-1",
        statement: "L'IA ne remplacera pas les créateurs, mais elle détruira les intermédiaires tièdes.",
        content: "Si votre valeur ajoutée consiste à résumer Wikipedia sans point de vue incarné, vous avez du souci à vous faire. La valeur n'a jamais été dans l'information, elle est dans le filtre et le jugement.",
        counterConsensus: "La peur aveugle de l'automatisation intégrale.",
      },
      {
        id: "opinion-2",
        statement: "Le format court bat le format long quand l'idée est limpide.",
        content: "Les romans de 2500 mots sur LinkedIn cachent souvent une incapacité à aller droit au but. Quand vous maîtrisez votre sujet, 3 phrases suffisent à provoquer le déclic.",
        counterConsensus: "L'obsession de gonfler artificiellement le temps de lecture.",
      },
    ],
    caseStudies: [
      {
        id: "case-1",
        title: "Comment un CEO B2B a généré 45k€ de pipeline avec 1 publication par semaine",
        problem: "Trop débordé pour créer du contenu quotidiennement, présence LinkedIn quasi inexistante depuis 2 ans.",
        solution: "Enregistrement d'une note vocale de 8 minutes le vendredi matin, atomisée en 1 post de fond et 1 carrousel ciblé.",
        result: "+380% d'inbound en 60 jours, 3 rendez-vous qualifiés signés directement par message privé.",
        keyTakeaway: "La régularité stratégique surpasse toujours la frénésie quotidienne sans direction.",
      },
    ],
    comments: [
      {
        id: "comment-1",
        angle: "Apport de nuance d'expert",
        comment: "Excellente analyse. J'ajouterais simplement que le problème n'est pas le manque d'outils, mais l'absence de conviction initiale. Quand le message de base est flou, aucun algorithme ne sauvera la mise.",
        contextToDeploy: "Sous les posts parlant de productivité créative ou de nouveaux outils IA.",
      },
      {
        id: "comment-2",
        angle: "Contre-point poli mais ferme",
        comment: "Je nuancerais sur ce point : optimiser pour les likes crée souvent une audience de curieux, rarement des acheteurs. Parfois, faire 30 likes avec 2 prospects en DM est infiniment plus rentable.",
        contextToDeploy: "Sous les posts vantant les millions de vues et la viralité facile.",
      },
    ],
  };

  return formatRepurposeResult(data, plan);
}
