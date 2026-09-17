# GhostAI — Présentation Complète & Guide Fonctionnel

> **GhostAI** — *Your Voice. Your Ideas.*  
> Plateforme SaaS de **Ghostwriting LinkedIn haute fidélité** et de **repurposing de contenu (Atomiseur)**, propulsée par l'intelligence artificielle sans compromis, avec un **système d'affiliation récurrent à 30% à vie** et une console d'administration complète.

---

## Sommaire

1. [Vision & Proposition de Valeur](#1-vision--proposition-de-valeur)
2. [Expérience Utilisateur & Parcours Produit](#2-parcours-utilisateur--fonctionnalités-cœur)
   - [2.1 L'Onboarding & Calibrage de Voix](#21-lonboarding--calibrage-de-voix)
   - [2.2 Création de Post & Moteur de Contrôle Qualité (Anti-Générique)](#22-création-de-post--moteur-de-contrôle-qualité-anti-générique)
   - [2.3 L'Atomiseur de Contenu (Opus Clip textuel)](#23-latomiseur-de-contenu-opus-clip-textuel)
   - [2.4 Bibliothèque de Posts & Boucle de Rétroaction](#24-bibliothèque-de-posts--boucle-de-rétroaction)
   - [2.5 Personnalité, Style & Vocabulaire Banni](#25-personnalité-style--vocabulaire-banni)
   - [2.6 Analytics & Performance](#26-analytics--performance)
3. [Programme Partenaire & Affiliation (30% à vie)](#3-programme-partenaire--affiliation-30-à-vie)
   - [3.1 Principe & Modèle Financier](#31-principe--modèle-financier)
   - [3.2 Tracking Immuable & Anti-Fraude](#32-tracking-immuable--anti-fraude)
   - [3.3 Période de Gel (30 jours) & Évaluation Paresseuse (Lazy)](#33-période-de-gel-30-jours--évaluation-paresseuse-lazy)
   - [3.4 Bouclier Anti-Déficit en Cas de Remboursement](#34-bouclier-anti-déficit-en-cas-de-remboursement)
   - [3.5 Retraits : Mobile Money & Virement Bancaire](#35-retraits--mobile-money--virement-bancaire)
   - [3.6 Tableau de Bord Partenaire](#36-tableau-de-bord-partenaire)
4. [Abonnements & Monétisation (Stripe)](#4-abonnements--monétisation-stripe)
5. [Console d'Administration & Supervision](#5-console-dadministration--supervision)
6. [Souveraineté des Données & Engagement RGPD](#6-souveraineté-des-données--engagement-rgpd)
7. [Architecture Technique & Stack](#7-architecture-technique--stack)

---

## 1. Vision & Proposition de Valeur

### Le Problème Résolu
95% des publications générées par les outils d'IA classiques (ChatGPT, générateurs génériques) se reconnaissent immédiatement :
* Tournures clichées (*"Dans le paysage actuel...", "Voici pourquoi c'est un game changer..."*).
* Emojis excessifs et puces sans substance.
* Manque total d'aspérité, d'opinion tranchée et de personnalité.
* Ton robotique qui nuit à la crédibilité du dirigeant ou du créateur.

### La Solution GhostAI
GhostAI ne se contente pas de générer un post : **il modélise mathématiquement et sémantiquement votre voix réelle**, génère le contenu, le compare à une version neutre rejetée, et ne conserve que ce qui surpasse le générique avec un score de fidélité stylistique vérifiable (**Voice Match Score**).

---

## 2. Parcours Utilisateur & Fonctionnalités Cœur

### 2.1 L'Onboarding & Calibrage de Voix
Dès l'inscription, l'utilisateur suit un wizard guidé en 5 étapes pour modéliser son empreinte stylistique :
* **Niveau de directivité :** Façon d'affirmer ses opinions (frontal, nuancé, factuel).
* **Degré de formalité :** Échelle de 1 à 5 (du tutoiement familier au style exécutif formel).
* **Leçon marquante vécue :** Récit d'un échec ou d'un déclic professionnel réel pour capter la vulnérabilité et le storytelling.
* **Échantillons réels de posts :** 1 à 5 publications de référence écrites par l'utilisateur.
* **Vectorisation sémantique :** Calcul d'un embedding vectoriel en 1024 dimensions (Voyage AI) stocké dans PostgreSQL via l'extension `pgvector` pour mesurer la cohérence stylistique sur chaque futur post.

### 2.2 Création de Post & Moteur de Contrôle Qualité (Anti-Générique)
* **Saisie d'idée brute :** L'utilisateur note une réflexion, une anecdote ou un concept, même imparfait.
* **Choix du format :**
  - Storytelling / Parcours personnel
  - Enseignement & Éducatif
  - Opinion tranchée / Prise de position
  - Étude de cas / Décorticage
  - Post court et percutant
* **Choix de la tonalité :** Direct, conversationnel, provocateur, bienveillant, inspirant.
* **Pipeline de Génération & Filtrage :**
  1. Génération assistée par DeepSeek V3 (`deepseek-chat`) avec injection des exemples réels de l'utilisateur.
  2. Double vérification algorithmique : détection des clichés LinkedIn bannis, mesure de spécificité, et Voice Match Score (0 à 100%).
  3. Rejet automatique en coulisses des brouillons trop génériques.
* **Ajustements en 1 clic :** "Rendre plus direct", "Moins formel", "Raccourcir l'accroche", "Plus de storytelling".

### 2.3 L'Atomiseur de Contenu (Opus Clip textuel)
Inspiré d'Opus Clip mais appliqué au format écrit LinkedIn :
* **Sources acceptées :** URL d'article de blog, lien YouTube (extraction de transcription), fichier texte ou note vocale.
* **Atomisation intelligente :** L'algorithme découpe le contenu source et génère un pack multi-formats complet :
  - Posts individuels autonomes.
  - Carrousels complets structurés diapositive par diapositive.
  - Séries d'accroches (hooks) alternatives.
  - Angles d'opinion contrarienne.
  - Réponses types pour engager dans les commentaires.

### 2.4 Bibliothèque de Posts & Boucle de Rétroaction
* **Gestion des états :** Brouillons, posts finalisés, posts archivés.
* **Boucle d'apprentissage RLHF personnelle :**
  - L'utilisateur peut indiquer si le post *"sonne comme moi"* (Oui / Non).
  - En cas de désaccord, sélection des motifs (*Trop formel, Trop générique, Ton inadapté, Trop long*).
  - Ce retour affine immédiatement les paramètres de génération pour les prochains posts.
* **Export complet :** Export JSON en 1 clic de l'intégralité de ses écrits.

### 2.5 Personnalité, Style & Vocabulaire Banni
* **Curseurs de personnalité :** Directivité, Storytelling, Humour, Technicité, Émotion, Vulnérabilité.
* **Mots & Expressions préférés :** Vocabulaire signature injecté naturellement.
* **Liste noire de mots bannis :** Interdiction stricte de termes surutilisés (ex: *"disrupter"*, *"synergie"*, *"game changer"*).

### 2.6 Analytics & Performance
* Suivi des volumes de posts créés par mois.
* Évolution du Voice Match Score moyen au fil des publications.
* Temps économisé estimé (heures de ghostwriting évitées).

---

## 3. Programme Partenaire & Affiliation (30% à vie)

Le système d'affiliation de GhostAI est conçu comme un programme d'actionnaires créateurs, pérenne et ultra-protecteur pour le SaaS et ses affiliés.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW D'AFFILIATION                         │
└────────────────────────────────────────────────────────────────────────┘

1. Visiteur clique sur https://ghostai.app/?ref=arthur
   │
   ▼
2. Middleware Next.js : Dépose un cookie 60 jours 'ghostai_ref'
   │
   ▼
3. Inscription de l'utilisateur :
   Attribution définitive du parrain dans la base (Trigger SQL anti-écrasement)
   Vérification anti-auto-parrainage (même IP / même email / même user_id)
   │
   ▼
4. Paiement de l'abonnement par le filleul (ex: 22 $ / mois)
   │
   ▼
5. Webhook de paiement :
   Attribution automatique de la commission (30% = 6.60 $)
   Statut initial = 'pending' avec déblocage à J+30 (Gel de sécurité anti-litige)
   │
   ▼
6. Évaluation Paresseuse (Lazy Evaluation sans Cron) :
   À l'échéance des 30 jours, dès que le parrain visite son dashboard,
   la commission passe en 'available' (solde retirable)
   │
   ▼
7. Demande de retrait (Seuil 20 $) :
   Versement par Mobile Money (Orange Money, Wave, MTN MoMo) ou Virement Bancaire
```

### 3.1 Principe & Modèle Financier
* **Commission :** **30% récurrents à vie** sur chaque mensualité ou paiement réalisé par les clients parrainés.
* **Modèle gagnant-gagnant :** Pour un client au plan Pro (ex: 22 $/mois), le partenaire touche 6,60 $ chaque mois tant que l'utilisateur reste abonné.

### 3.2 Tracking Immuable & Anti-Fraude
* **Cookie longue durée :** 60 jours de rétention via `ghostai_ref`.
* **Attribution immuable :** Protégée au niveau PostgreSQL par un trigger SQL (`prevent_referred_by_override`) qui interdit tout écrasement ultérieur du parrain.
* **Contrôle anti-auto-parrainage :** Rejet si l'adresse email ou l'identifiant du parrain correspond à celui du nouvel inscrit.
* **Idempotence stricte :** Clé unique `txRef` sur les commissions pour bloquer toute double comptabilisation lors des relances webhook.

### 3.3 Période de Gel (30 jours) & Évaluation Paresseuse (Lazy)
* **Période de gel de 30 jours :** Les commissions restent au statut `pending` pendant 30 jours pour couvrir la période d'exercice du droit de rétractation ou litige bancaire.
* **Zéro Cronjob externe nécessaire :** Le déblocage des commissions échues s'exécute automatiquement via *Lazy Evaluation* lorsque le partenaire charge son tableau de bord ou sollicite un retrait.

### 3.4 Bouclier Anti-Déficit en Cas de Remboursement
Si un client est remboursé alors que sa commission était déjà débloquée :
* Le solde disponible du partenaire n'est **jamais négatif** (bloqué à 0,00 $ minimum).
* La différence est enregistrée dans un registre de dette temporaire (`pendingDebt`).
* Cette dette est déduite en priorité de ses futurs gains sans bloquer son compte ni engendrer d'erreur en base de données.

### 3.5 Retraits : Mobile Money & Virement Bancaire
* **Seuil minimum de retrait :** 20,00 $.
* **Canaux de paiement pris en charge :**
  - **Mobile Money :** Orange Money, Wave, MTN MoMo, Moov, Airtel.
  - **Virement Bancaire :** Coordonnées bancaires directes (IBAN, BIC / Swift, Nom du titulaire).

### 3.6 Tableau de Bord Partenaire (`/app/partner`)
* **Lien unique de partage :** Généré automatiquement (ex: `https://ghostai.app/?ref=prenom`) avec possibilité de personnalisation du slug (validation alphanumérique, exclusion des mots réservés comme *admin*, *api*).
* **3 Cartes Financières Clés :**
  - *Total Gagné :* Historique global cumulé.
  - *En attente (Gel 30 jours) :* Fonds en période de sécurité avec décompte.
  - *Solde Retirable :* Montant immédiatement retirable.
* **Télémétrie de trafic :** Nombre de clics sur le lien, nombre d'inscriptions gratuites générées, taux de conversion en abonnés payants.
* **Historiques complets :** Tableaux détaillés de chaque commission reçue et de chaque virement de retrait exécuté.

---

## 4. Abonnements & Monétisation (Stripe)

GhostAI propose 3 formules adaptées aux besoins de publication :

| Plan | Quota Mensuel | Fonctionnalités Clés |
| :--- | :--- | :--- |
| **Free** | 5 posts / mois | Calibrage de voix de base, Voice Match Score, feedback qualité |
| **Pro** | 30 posts / mois | Accès complet à l'Atomiseur, posts carrousels, vocabulaire banni sur-mesure |
| **Pro Max / Agency** | Posts illimités | Profils de voix multiples, priorité GPU, support dédié créateurs |

* Intégration transparente avec le portail client Stripe pour la gestion des moyens de paiement, factures et résiliations.

---

## 5. Console d'Administration & Supervision (`/admin`)

Réservée aux administrateurs (contrôle par liste blanche d'emails et rôle `isAdmin` en base de données) :

1. **Vue d'ensemble :** Métriques financières en direct (MRR, abonnés actifs, taux de conversion, affiliés), courbe de revenus sur 30 jours rendue en **SVG pur ultra-léger**, flux d'audit instantané.
2. **Gestion des Utilisateurs :** Recherche, fiches détaillées, actions directes de **suspension/réactivation** et **surclassement forcé** de formule.
3. **Abonnements & Tarifs dynamiques :** Modification en direct des tarifs (Sprint, Mensuel, Fondateur) et quotas sans redéploiement de code.
4. **Paiements & Webhooks :** Journal exhaustif de toutes les transactions avec simulateur d'achat intégré pour tester l'attribution de commission.
5. **Modération des Affiliés :** Supervision de tous les partenaires, création manuelle, suspension d'un lien suspect en 1 clic.
6. **Consommation IA & Rate Limiting :** Comptabilisation des tokens DeepSeek V3 consommés, estimation des coûts réels en USD, et panneau de contrôle dynamique du rate limit.
7. **Activité Métier :** Suivi du nombre de posts rédigés, de carrousels générés et du score de voix moyen sur la plateforme.
8. **Système & Santé :** Contrôle en temps réel de la connectivité de la base PostgreSQL et des APIs externes.

---

## 6. Souveraineté des Données & Engagement RGPD

* **Zéro entraînement d'IA sur vos idées :** Les données des utilisateurs (idées, brouillons, posts finaux, voix) ne sont **jamais** utilisées pour entraîner des modèles d'intelligence artificielle publics ou tiers.
* **Suppression irréversible :** Toute suppression de compte depuis l'espace Paramètres efface l'intégralité des posts, profils et embeddings sous 48 heures.
* **Zéro traceur publicitaire :** Aucun pixel invasif (Meta Pixel, Google Ads) n'est injecté. Seul un cookie fonctionnel de parrainage (`ghostai_ref`) est utilisé.

---

## 7. Architecture Technique & Stack

* **Framework :** Next.js 14 (App Router, Server Components & Server Actions).
* **Langage :** TypeScript (typage strict de bout en bout).
* **Base de données & ORM :** PostgreSQL avec extension `pgvector` piloté par Prisma ORM.
* **Authentification :** Auth.js (NextAuth v5 beta) avec sessions JWT sécurisées et cookies HTTP-only.
* **Moteurs d'IA :**
  - **DeepSeek V3 (`deepseek-chat`) :** Moteur de rédaction et ghostwriting haute fidélité.
  - **Voyage AI :** Embeddings vectoriels textuels (1024 dimensions) pour la comparaison stylistique.
* **Paiements :** Stripe (abonnements et portail de facturation).
* **Styles :** Tailwind CSS avec palette typographique éditoriale (`paper`, `ink`, `mark`, `line`).
