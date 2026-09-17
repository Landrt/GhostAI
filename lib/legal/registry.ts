export interface LegalDocumentMeta {
  slug: string;
  aliases: string[];
  filename: string;
  title: string;
  shortTitle: string;
  category: "Général & Éditeur" | "Contrats Clients" | "Partenariat & Affiliation" | "Données & IA";
  description: string;
  iconName: string;
  estimatedReadingTime: string;
  order: number;
}

export const LEGAL_DOCUMENTS: LegalDocumentMeta[] = [
  {
    slug: "mentions-legales",
    aliases: ["legal-notice", "mentions"],
    filename: "mentions-legales-ghostai.md",
    title: "Mentions Légales",
    shortTitle: "Mentions Légales",
    category: "Général & Éditeur",
    description: "Identité de l'éditeur, direction de la publication, hébergement de l'application et propriété intellectuelle.",
    iconName: "Building",
    estimatedReadingTime: "3 min",
    order: 1,
  },
  {
    slug: "cgu-cgv",
    aliases: ["conditions-utilisation-et-vente", "terms", "cgu", "cgv"],
    filename: "conditions-utilisation-et-vente-ghostai.md",
    title: "Conditions d’Utilisation et de Vente (CGU / CGV)",
    shortTitle: "CGU / CGV",
    category: "Contrats Clients",
    description: "Modalités d'accès au service GhostAI, souscription aux forfaits, droits d'utilisation et règles de résiliation.",
    iconName: "FileText",
    estimatedReadingTime: "9 min",
    order: 2,
  },
  {
    slug: "confidentialite",
    aliases: ["privacy", "politique-confidentialite", "donnees-personnelles"],
    filename: "politique-confidentialite-ghostai.md",
    title: "Politique de Confidentialité",
    shortTitle: "Confidentialité (RGPD)",
    category: "Données & IA",
    description: "Engagements de protection de vos données, non-entraînement des modèles d'IA sur vos écrits et conformité RGPD.",
    iconName: "Shield",
    estimatedReadingTime: "8 min",
    order: 3,
  },
  {
    slug: "cookies",
    aliases: ["politique-cookies", "traceurs"],
    filename: "politique-cookies-ghostai.md",
    title: "Politique relative aux Cookies & Traceurs",
    shortTitle: "Cookies",
    category: "Données & IA",
    description: "Cookies strictement nécessaires de session et cookie fonctionnel de parrainage de 60 jours (ghostai_ref).",
    iconName: "Cookie",
    estimatedReadingTime: "4 min",
    order: 4,
  },
  {
    slug: "programme-partenaire",
    aliases: ["terms-partners", "conditions-programme-partenaire-affiliation", "affiliation"],
    filename: "conditions-programme-partenaire-affiliation-ghostai.md",
    title: "Conditions du Programme Partenaire & Affiliation",
    shortTitle: "Conditions Partenaires",
    category: "Partenariat & Affiliation",
    description: "Règles d'affiliation récurrente à 30 % à vie, liberté de création de contenu et protection de la marque GhostAI.",
    iconName: "BadgePercent",
    estimatedReadingTime: "8 min",
    order: 5,
  },
  {
    slug: "retraits-affiliation",
    aliases: ["conditions-retraits-affiliation", "payouts-terms"],
    filename: "conditions-retraits-affiliation-ghostai.md",
    title: "Conditions Spécifiques aux Retraits d’Affiliation",
    shortTitle: "Retraits & Payouts",
    category: "Partenariat & Affiliation",
    description: "Seuil minimum de 20 $, période de gel de sécurité de 30 jours, canaux Mobile Money/Banque et protection anti-déficit.",
    iconName: "Wallet",
    estimatedReadingTime: "5 min",
    order: 6,
  },
  {
    slug: "decharge-ia",
    aliases: ["decharge-intelligence-artificielle", "ai-disclaimer", "decharge"],
    filename: "decharge-intelligence-artificielle-ghostai.md",
    title: "Décharge relative à l’Intelligence Artificielle",
    shortTitle: "Décharge IA",
    category: "Données & IA",
    description: "Nature suggestive des contenus générés par IA, absence d'engagement de résultat et responsabilité éditoriale de l'auteur.",
    iconName: "Bot",
    estimatedReadingTime: "4 min",
    order: 7,
  },
  {
    slug: "dpa",
    aliases: ["accord-traitement-donnees-dpa", "data-processing-agreement"],
    filename: "accord-traitement-donnees-dpa-ghostai.md",
    title: "Accord de Traitement des Données (DPA)",
    shortTitle: "Accord DPA (B2B)",
    category: "Contrats Clients",
    description: "Contrat-cadre de sous-traitance des données personnelles conforme à l'article 28 du RGPD pour entreprises et agences.",
    iconName: "FileSignature",
    estimatedReadingTime: "7 min",
    order: 8,
  },
];

export function getAllLegalDocuments(): LegalDocumentMeta[] {
  return [...LEGAL_DOCUMENTS].sort((a, b) => a.order - b.order);
}

export function getLegalDocumentBySlug(slug: string): LegalDocumentMeta | undefined {
  const clean = slug.toLowerCase().trim();
  return LEGAL_DOCUMENTS.find(
    (doc) => doc.slug === clean || doc.aliases.includes(clean)
  );
}

export const LEGAL_CATEGORIES = [
  "Général & Éditeur",
  "Contrats Clients",
  "Partenariat & Affiliation",
  "Données & IA",
] as const;
