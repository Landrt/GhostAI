# Guide Exhaustif du Dashboard GhostAI

> **GhostAI** — *Your Voice. Your Ideas.*  
> Ce document résume de manière complète, claire et structurée l'ensemble des capacités, fonctionnalités, outils et écrans proposés par le **Tableau de Bord GhostAI** (`/app`), ainsi que sa console d'administration (`/admin`).

---

## Sommaire

1. [Vue d'Ensemble & Philosophie du Dashboard](#1-vue-densemble--philosophie-du-dashboard)
2. [Cockpit Principal (`/app`)](#2-cockpit-principal-app)
3. [Le Studio de Création & Ghostwriting (`/app/create`)](#3-le-studio-de-création--ghostwriting-appcreate)
4. [L'Atomiseur de Contenu — "L'Opus Clip pour LinkedIn" (`/app/repurpose`)](#4-latomiseur-de-contenu--lopus-clip-pour-linkedin-apprepurpose)
5. [Gestionnaire & Bibliothèque de Posts (`/app/posts`)](#5-gestionnaire--bibliothèque-de-posts-appposts)
6. [Profilage Stylistique & Voix de l'Auteur (`/app/voice`)](#6-profilage-stylistique--voix-de-lauteur-appvoice)
7. [Matrice de Communication & Personnalité (`/app/personality`)](#7-matrice-de-communication--personnalité-apppersonality)
8. [Analytique Éditoriale & Cohérence (`/app/analytics`)](#8-analytique-éditoriale--cohérence-appanalytics)
9. [Facturation Éthique & Sans Piège (`/app/billing`)](#9-facturation-éthique--sans-piège-appbilling)
10. [Espace Partenaire & Affiliation 30% (`/app/partner`)](#10-espace-partenaire--affiliation-30-apppartner)
11. [Paramètres, Sécurité & RGPD (`/app/settings`)](#11-paramètres-sécurité--rgpd-appsettings)
12. [Supervision & Administration Centrale (`/admin`)](#12-supervision--administration-centrale-admin)
13. [Matrice Comparative des Formules & Quotas](#13-matrice-comparative-des-formules--quotas)

---

## 1. Vue d'Ensemble & Philosophie du Dashboard

Le Dashboard GhostAI a été conçu pour les dirigeants, solopreneurs, créateurs et agences qui souhaitent dominer LinkedIn sans sacrifier leur authenticité.

### Ce qui le distingue fondamentalement d'un outil IA classique :
- **Zéro tournure générique** : aucune phrase type ChatGPT (*"Dans le monde effréné d'aujourd'hui...", "Voici 5 leçons clés..."*).
- **Modélisation vectorielle de la voix (`pgvector`)** : l'IA capture le rythme réel, les ruptures, le vocabulaire et les anecdotes de l'utilisateur.
- **Boucle de contrôle qualité à 3 juges** : chaque post est audité avant affichage et rejeté jusqu'à 3 fois s'il est jugé trop conventionnel.
- **Transparence & Liberté** : zéro reconduction automatique forcée des paiements, contrôle total de la donnée (zéro réentraînement IA).

---

## 2. Cockpit Principal (`/app`)

L'accueil de l'espace membre offre une vision immédiate sur l'état de la présence LinkedIn de l'utilisateur.

### Fonctionnalités de l'écran :
1. **Jauges de Quotas en Direct** :
   - Nombre de posts rédigés ce mois-ci par rapport au plafond de la formule.
   - Nombre de packs d'atomisation disponibles.
2. **Score Moyen de Voix (Voice Match Score)** :
   - Indice de fidélité stylistique globale sur les 30 derniers jours (ex: 88/100).
3. **Flux des Dernières Créations** :
   - Accès instantané aux 5 derniers posts créés avec leur statut (brouillon, prêt, planifié, publié).
4. **Boutons d'Action Rapide** :
   - Raccourci vers la rédaction d'un post à chaud.
   - Raccourci vers l'atomisation d'une vidéo YouTube ou d'un article.
   - Raccourci vers le réglage de la voix.

---

## 3. Le Studio de Création & Ghostwriting (`/app/create`)

Le moteur de rédaction assistée transforme une simple note brute en publication percutante.

### 3.1 Saisie de l'Idée & Paramétrage
- **Zone d'entrée brute** : champ libre pour taper une idée, un coup de gueule, une anecdote vécue ou une leçon apprise.
- **Choix du Format Éditiorial** :
  - *Storytelling / Parcours personnel* : mise en valeur d'un défi, d'un tournant ou d'un apprentissage.
  - *Enseignement & Framework* : partage d'une méthode actionnable étape par étape.
  - *Opinion tranchée / Prise de position* : point de vue fort à contre-courant.
  - *Analyse d'échec / Post-mortem* : vulnérabilité constructive et apprentissage.
  - *Contre-intuitif / Démystification* : déconstruction d'un mythe de son industrie.
- **Réglage de la Tonalité** : direct, chaleureux, expert, sobre ou provocateur.

### 3.2 Le Pipeline Anti-Générique (Les 3 Juges)
Pendant la génération, le moteur sollicite DeepSeek V3 (`deepseek-chat`) sous le contrôle de 3 évaluateurs indépendants :
1. **Juge 1 (Anti-Clichés)** : repère et élimine les métaphores usées, les adverbes superflus et les puces LinkedIn artificielles.
2. **Juge 2 (Spécificité)** : vérifie que le post contient des faits, des chiffres, des anecdotes vécues et des exemples tangibles.
3. **Juge 3 (Alignement de Voix)** : compare sémantiquement le texte avec le profil vectoriel de l'auteur.

### 3.3 Prévisualisation Feed LinkedIn Fidèle
- Reproduction exacte du composant feed de LinkedIn (photo de profil, nom, bouton *« Voir plus »* positionné après la 3e ligne pour tester l'accroche).
- Mode d'affichage Mobile et Ordinateur.

### 3.4 Régénération Ciblée en 1 Clic
Possibilité de corriger le texte sans tout réécrire grâce à des filtres rapides :
- *« Plus direct / Moins d'adjectifs »*
- *« Raccourcir de 40% »*
- *« Rendre le hook plus percutant »*
- *« Ajouter une touche de vulnérabilité »*

---

## 4. L'Atomiseur de Contenu — "L'Opus Clip pour LinkedIn" (`/app/repurpose`)

Ce module démultiplie l'impact d'un contenu existant en le découpant en dizaines de variations LinkedIn.

### 4.1 Sources Ingestables
- **Lien Vidéo YouTube** : extraction automatique des sous-titres et de la structure du discours.
- **Lien Article Web / Blog** : scrapping propre du contenu textuel.
- **Notes Brutes / Transcriptions** : copier-coller d'un mémo vocal, d'un podcast ou d'un compte-rendu de réunion.

### 4.2 Sorties Générées dans Chaque Pack
Chaque traitement génère un ensemble exhaustif d'actifs éditoriaux :
- **10 à 15 Posts LinkedIn complets** déclinés selon différents angles (accroche, controverse, méthode).
- **3 à 5 Scripts de Carrousels PDF** prêts à être exportés (diapositives ordonnées, titres percutants, synthèse).
- **10 à 15 Accroches Virales (Hooks)** alternatives pour tester l'intérêt de son audience.
- **3 à 5 Posts d'Opinion Tranchée**.
- **2 à 5 Études de Cas** structurées (Problème → Solution → Résultat).
- **5 à 10 Commentaires d'Autorité** à déposer sous les posts d'autres créateurs pour attirer du trafic qualifié.

### 4.3 Export & Intégration
- Sauvegarde instantanée de n'importe quel post généré directement dans la bibliothèque `/app/posts`.

---

## 5. Gestionnaire & Bibliothèque de Posts (`/app/posts`)

Espace central pour organiser son calendrier éditorial et piloter sa production.

### Fonctionnalités clés :
- **Cycle de Vie des Publications** :
  - `Brouillon` : idée en cours de travail ou d'affinage.
  - `Prêt` : post validé par l'utilisateur, prêt pour LinkedIn.
  - `Planifié` : publication calée pour une date précise.
  - `Publié` : post déjà diffusé.
- **Moteur de Recherche & Filtres** : recherche par mots-clés, filtrage par format ou statut.
- **Éditeur Intégré** : modification manuelle du texte avec recalcul en temps réel du nombre de caractères et du temps de lecture.
- **Boucle d'Apprentissage Continu (Reinforcement Learning)** :
  - Boutons de rétroaction (Pouce haut / Pouce bas).
  - En cas de feedback négatif, l'utilisateur indique la raison (*« trop corporatif », « tournure que je ne dirais jamais »*). Le profil de voix s'enrichit automatiquement de ces exclusions pour les futures rédactions.

---

## 6. Profilage Stylistique & Voix de l'Auteur (`/app/voice`)

Ce module stocke et raffine l'ADN éditorial unique de l'utilisateur.

### Composants du profil de voix :
1. **Échantillons de Référence** : textes réels rédigés par l'utilisateur pour servir de référence absolue.
2. **Analyse Stylistique Automatique** :
   - Rythme des phrases (courtes, percutantes, cadencées).
   - Niveau de tutoiement / vouvoiement.
   - Ponctuation privilégiée (usage des tirets, sauts de ligne, absence d'exclamations excessives).
3. **Empreinte Vectorielle Sémantique** :
   - Calcul d'un embedding vectoriel via Voyage AI (`voyage-3`).
   - Stockage dans PostgreSQL via l'extension `pgvector` pour mesurer la distance sémantique de chaque nouveau post.

---

## 7. Matrice de Communication & Personnalité (`/app/personality`)

Permet de calibrer les nuances comportementales de l'IA pour refléter fidèlement le tempérament du créateur.

### Réglages disponibles :
- **Curseur de Directivité** : de la nuance diplomatique à la franchise totale.
- **Degré de Formalité** : du ton décontracté / proche au ton corporate / exécutif.
- **Niveau de Vulnérabilité** : acceptation de partager ses échecs, doutes ou remises en question.
- **Degré de Provocation / Punchline** : intensité des accroches et prise de risque éditoriale.
- **Sujets Fétiches** : thématiques centrales à aborder en priorité (ex: bootstrapping, management, dev).
- **Sujets Tabous & Mots Bannis** : liste noire de termes ou sujets que l'IA a interdiction absolue d'employer.

---

## 8. Analytique Éditoriale & Cohérence (`/app/analytics`)

Fournit des données exploitables pour mesurer la montée en puissance de sa voix et de son audience.

### Métriques et Graphiques :
1. **Cohérence Stylistique (Voice Consistency Score)** : courbe d'évolution de la fidélité de ton post après post.
2. **Taux d'Éradication des Clichés** : pourcentage de posts ayant passé le filtre anti-cliché avec succès dès la première tentative.
3. **Régularité & Cadence de Publication** : calendrier d'activité hebdomadaire et mensuel.
4. **Palmarès des Formats** : identification des typologies de posts (storytelling vs framework) générant la meilleure adhésion.

---

## 9. Facturation Éthique & Sans Piège (`/app/billing`)

Un tableau de bord financier fondé sur la transparence et la maîtrise budgétaire absolue.

### Caractéristiques exclusives :
- **Garantie Zéro Prélèvement Automatique** : chaque paiement couvre **30 jours complets d'accès sans tacite reconduction forcée**.
- **Contrôle Total du Budget** : à l'échéance des 30 jours, l'utilisateur est simplement notifié et décide s'il souhaite recharger son mois en 1 clic. Aucun débit bancaire automatique n'est prélevé à son insu.
- **Suivi de la Consommation** : jauges en temps réel des posts rédigés et des packs d'atomisation consommés.
- **Portail Client Sécurisé (Stripe)** : téléchargement des factures officielles en PDF, consultation de l'historique des paiements.

---

## 10. Espace Partenaire & Affiliation 30% (`/app/partner`)

Permet à n'importe quel utilisateur de recommander GhostAI et d'encaisser **30% de commission récurrente à vie**.

### Fonctionnalités du tableau de bord affilié :
1. **Activation Sécurisée avec Accord Légal** :
   - Case à cocher obligatoire garantissant la liberté de promotion tout en protégeant l'image de marque.
   - Décharge formelle de responsabilité de GhostAI sur les vidéos ou créations des partenaires.
   - Interdiction stricte de l'auto-parrainage.
2. **Lien de Recommandation Unique** :
   - Lien généré sous la forme `https://ghostai.app/?ref=mon-code`.
   - Possibilité de personnaliser son code une fois.
3. **Tracking Robuste (Cookie 60 jours)** :
   - Dès qu'un visiteur clique sur le lien, le cookie `ghostai_ref` est posé pour 60 jours. S'il s'inscrit durant cette période, il est attribué au partenaire à vie.
4. **Indicateurs Financiers en Temps Réel** :
   - Nombre de clics enregistrés.
   - Nombre d'inscriptions générées.
   - Nombre d'abonnements payants actifs.
   - Solde disponible pour retrait et solde en cours de gel de sécurité (30 jours anti-litige).
5. **Retraits Faciles dès 20 $** :
   - Versement par **Mobile Money** (Orange Money, MTN MoMo, Wave, Moov, Airtel) ou **Virement Bancaire** direct.
6. **Bouclier Anti-Déficit (`pending_debt`)** :
   - En cas de remboursement d'un filleul, le solde du partenaire ne devient jamais négatif : la dette temporaire est prélevée en priorité sur les gains futurs.

---

## 11. Paramètres, Sécurité & RGPD (`/app/settings`)

Espace de gestion des données personnelles et des accès au compte.

### Options :
- **Profil Utilisateur** : modification du nom, adresse email de contact et avatar.
- **Sécurité du Compte** : modification du mot de passe avec règles de complexité strictes.
- **Export Intégral des Données (Conformité RGPD Art. 20)** : téléchargement en 1 clic d'une archive JSON complète contenant tous les posts, profils de voix et métriques.
- **Droit à l'Oubli & Suppression de Compte (RGPD Art. 17)** : clôture définitive du compte avec purge intégrale des données dans PostgreSQL.

---

## 12. Supervision & Administration Centrale (`/admin`)

Réservée aux administrateurs de la plateforme pour piloter la santé et la croissance du SaaS.

### Les 8 Modules de la Console Admin :
1. **Vue d'Ensemble** : métriques MRR, ARR, volume d'abonnés, courbe de revenus sur 30 jours en SVG natif et flux d'activité en direct.
2. **Gestion des Utilisateurs (`/admin/users`)** : liste complète, recherche, suspension administrative en 1 clic, surclassement de formule ou attribution des droits admin.
3. **Abonnements & Tarifs (`/admin/subscriptions`)** : modification en direct des tarifs publics, jauge du Quota Fondateur, détection des comptes arrivant à échéance sous 72h avec possibilité d'offrir une prolongation gratuite (+7 jours).
4. **Paiements & Transactions (`/admin/payments`)** : journal exhaustif de toutes les transactions Stripe, commissions versées et simulateur d'événements webhook sans carte bancaire.
5. **Modération des Affiliés (`/admin/affiliates`)** : validation humaine ou rejet motivé des demandes de retraits d'argent des partenaires (Mobile Money & Banque).
6. **Consommation & Coûts IA (`/admin/ai-usage`)** : suivi précis des tokens consommés (Prompt / Completion) auprès de DeepSeek V3 et Voyage AI, calcul des coûts en USD et supervision du Rate Limiting.
7. **Activité Métier & Qualité (`/admin/activity`)** : volume de posts produits sur la plateforme, score de voix moyen et revue des contenus signalés.
8. **Santé Infrastructure (`/admin/system`)** : pings de connectivité en temps réel (PostgreSQL, DeepSeek V3, Stripe, Auth.js) avec latence en millisecondes et audit sécurisé des variables d'environnement.

---

## 13. Matrice Comparative des Formules & Quotas

| Fonctionnalité | Plan Free ($0) | Plan Pro ($49/mois) | Plan ProMax ($99/mois) |
|---|:---:|:---:|:---:|
| **Posts rédigés / mois** | 5 | 30 | Illimité (usage raisonnable) |
| **Packs Atomiseur (Opus Clip)** | 1 d'essai | 4 packs complets | 30 packs XXL (quotidien) |
| **Boucle de contrôle 3 juges** | ✅ Incluse | ✅ Incluse | ✅ Incluse |
| **Prévisualisation feed LinkedIn** | ✅ Oui | ✅ Oui | ✅ Oui |
| **Apprentissage continu de la voix** | Profil initial | ✅ Continu | ✅ Avancé & Multi-profils |
| **Régénérations ciblées rapides** | Limitées | ✅ Illimitées | ✅ Prioritaires |
| **Reconduction automatique** | ❌ Aucune | ❌ Aucune (30j fermes) | ❌ Aucune (30j fermes) |
| **Accès Programme Partenaire (30%)** | ✅ Oui | ✅ Oui | ✅ Oui |
| **Support client** | Standard | Prioritaire | Dédié |

---

> **Document édité le :** 17 septembre 2026  
> **Éditeur de GhostAI :** Youcheu Landry  
> **Plateforme :** GhostAI SaaS (`https://ghostai.app`)
