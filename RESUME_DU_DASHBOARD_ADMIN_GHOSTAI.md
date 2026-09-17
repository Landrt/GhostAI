# Guide Complet du Dashboard Administrateur — GhostAI

> **GhostAI Superviseur** — *Console Centrale de Pilotage, Supervision & Modération*  
> Ce document résume de manière exhaustive l'ensemble des fonctionnalités, écrans, outils de contrôle et indicateurs disponibles dans le **Dashboard Administrateur (`/admin`)** de GhostAI.

---

## Sommaire

1. [Architecture & Sécurité d'Accès de la Console Admin](#1-architecture--sécurité-daccès-de-la-console-admin)
2. [Module 1 : Vue d'Ensemble Financière & Opérationnelle (`/admin`)](#2-module-1--vue-densemble-financière--opérationnelle-admin)
3. [Module 2 : Gestion des Utilisateurs & Comptes (`/admin/users`)](#3-module-2--gestion-des-utilisateurs--comptes-adminusers)
4. [Module 3 : Abonnements & Tarification en Direct (`/admin/subscriptions`)](#4-module-3--abonnements--tarification-en-direct-adminsubscriptions)
5. [Module 4 : Paiements, Transactions & Simulateur Webhook (`/admin/payments`)](#5-module-4--paiements-transactions--simulateur-webhook-adminpayments)
6. [Module 5 : Gestion & Modération des Affiliés (`/admin/affiliates`)](#6-module-5--gestion--modération-des-affiliés-adminaffiliates)
7. [Module 6 : Consommation & Coûts de l'IA (`/admin/ai-usage`)](#7-module-6--consommation--coûts-de-lia-adminai-usage)
8. [Module 7 : Activité Métier & Qualité Éditoriale (`/admin/activity`)](#8-module-7--activité-métier--qualité-éditoriale-adminactivity)
9. [Module 8 : Système, Santé & Infrastructure (`/admin/system`)](#9-module-8--système-santé--infrastructure-adminsystem)
10. [Journal d'Audit & Traçabilité (`AdminAuditLog`)](#10-journal-daudit--traçabilité-adminauditlog)

---

## 1. Architecture & Sécurité d'Accès de la Console Admin

La console d'administration GhostAI est cloisonnée pour garantir qu'aucun utilisateur classique ne puisse y accéder, même en cas de tentative de manipulation d'URL.

### Triple Barrière de Sécurité :
1. **Protection par le Middleware ([`middleware.ts`](file:///home/landry/Bureau/GhostAI/middleware.ts))** :
   - Toute requête vers `/admin/*` ou `/api/admin/*` est interceptée dès la couche Edge.
   - Les sessions non authentifiées sont immédiatement redirigées vers `/login`.
2. **Contrôle d'Accès Applicatif ([`lib/admin.ts`](file:///home/landry/Bureau/GhostAI/lib/admin.ts))** :
   - Vérification de l'attribut `isAdmin: true` sur le compte utilisateur en base PostgreSQL.
   - Vérification de la liste blanche d'emails autorisés (`ADMIN_EMAILS`).
   - Tout refus d'accès génère un retour HTTP `403 Forbidden`.
3. **Barre de Statut & Navigation Dédiée ([`app/admin/layout.tsx`](file:///home/landry/Bureau/GhostAI/app/admin/layout.tsx))** :
   - Layout sombre et distinct de l'application SaaS classique.
   - Indicateur visuel du statut superviseur, accès rapide aux 8 modules et bouton de bascule vers le SaaS client.

---

## 2. Module 1 : Vue d'Ensemble Financière & Opérationnelle (`/admin`)

Le cockpit principal regroupe la santé financière et la dynamique de croissance de la plateforme sur un écran unique.

### Indicateurs Clés (KPIs) en Temps Réel :
- **MRR (Monthly Recurring Revenue)** : Revenu mensuel récurrent calculé en direct à partir des abonnements actifs.
- **ARR (Annual Recurring Revenue)** : Projection annuelle du chiffre d'affaires (`MRR * 12`).
- **Utilisateurs Actifs & Payants** : Nombre total d'inscrits, part des clients payants (taux de conversion Free vers Payant).
- **Revenu Total Cumulé** : Somme globale des paiements encaissés depuis le lancement.
- **Réseau Affilié** : Nombre de partenaires actifs et volume des commissions générées.

### Courbe de Revenus Interactive (30 Jours) :
- **Technologie SVG Native** : Tracé vectoriel ultra-léger généré en pur SVG (zéro dépendance externe lourde) avec dégradé terracotta (`#A6402F`).
- **Interactivité** : Points de données survolables avec infobulles affichant la date exacte et le revenu encaissé ce jour-là.

### Diagnostic de Santé Rapide :
- Voyants d'état en temps réel pour PostgreSQL (Base de données), DeepSeek V3 (Moteur IA), Stripe (Paiements) et Auth.js (Sessions).

### Flux d'Activité en Direct (Live Audit Feed) :
- Journal chronologique des 10 derniers événements système : nouvelles inscriptions, passages à un plan supérieur, paiements Stripe, demandes de retraits d'affiliés.

---

## 3. Module 2 : Gestion des Utilisateurs & Comptes (`/admin/users`)

Permet de superviser l'ensemble de la base d'utilisateurs et d'effectuer des interventions de support client immédiates.

### Outils de Recherche & Filtrage :
- **Recherche plein texte** : par nom d'utilisateur ou adresse email.
- **Filtres par Formule** : `Tous`, `Free`, `Pro`, `ProMax`.
- **Filtres par Statut** : Comptes actifs vs Comptes suspendus.

### Fiche Utilisateur & Métriques Associées :
- Date et heure précises de l'inscription.
- Formule d'abonnement en cours et date d'expiration des 30 jours.
- Nombre total de posts générés depuis l'inscription.
- Parrain associé (si l'utilisateur a été référé par un affilié).

### Actions Administratives en 1 Clic :
- **Suspendre / Réactiver le compte** : Coupe immédiatement l'accès au SaaS en cas d'abus ou de comportement frauduleux.
- **Surclassement / Changement de Plan Forcé** : Permet à l'admin de passer manuellement un utilisateur en formule **Pro** ou **ProMax** sans carte bancaire (utile pour le support client, les influenceurs ou les bêta-testeurs).
- **Promotion Administrateur** : Attribuer ou retirer les droits de supervision à un utilisateur.

---

## 4. Module 3 : Abonnements & Tarification en Direct (`/admin/subscriptions`)

Offre un contrôle total sur les prix publics affichés sur la plateforme et permet de gérer la rétention client.

### Fonctionnalités Clés :
1. **Modification des Tarifs Publics en Direct** :
   - L'administrateur peut réajuster instantanément le prix de la formule **Pro** (ex: 49 $) et **ProMax** (ex: 99 $) affiché sur la landing page sans redéployer le code.
2. **Jauge du Quota Fondateur (Early Birds)** :
   - Compteur en temps réel des places réservées au tarif de lancement (ex: 42 / 100 places réservées) pour piloter les campagnes promotionnelles.
3. **Détection des Échéances Proches (< 72 heures)** :
   - Liste automatique des utilisateurs dont les 30 jours d'accès arrivent à expiration sous 3 jours.
4. **Bouton « Offrir +7 Jours de Prolongation »** :
   - Prolongation gratuite de courtoisie accordée en 1 clic pour récompenser un utilisateur ou lui donner le temps de renouveler manuellement son mois.
5. **Graphique de Répartition des Formules** :
   - Visualisation de la part respective des utilisateurs Free, Pro et ProMax.

---

## 5. Module 4 : Paiements, Transactions & Simulateur Webhook (`/admin/payments`)

Centralise la comptabilité, le suivi des règlements Stripe et offre un banc d'essai complet pour tester les flux de paiement.

### Outils Inclus :
- **Journal Centralisé des Transactions** :
  - Liste de chaque transaction : montant en USD, statut Stripe (`succeeded`, `pending`, `failed`), référence client, date et heure.
- **Suivi des Commissions Partenaires** :
  - Traçabilité de chaque commission de 30% générée par un achat, avec distinction entre les commissions en cours de gel de sécurité (30 jours) et celles disponibles.
- **Simulateur d'Événements Webhook Stripe (Sandbox Intégrée)** :
  - Outil exclusif permettant à l'administrateur de simuler des événements Stripe réels en local ou en pré-production sans aucune carte bancaire :
    - *Simuler `checkout.session.completed`* : active immédiatement un abonnement Pro ou ProMax et crédite le parrain s'il y en a un.
    - *Simuler `invoice.paid`* : teste le cycle de renouvellement.
    - *Simuler `charge.refunded`* : teste le bouclier anti-déficit et vérifie que la commission est suspendue ou consignée dans `pending_debt`.

---

## 6. Module 5 : Gestion & Modération des Affiliés (`/admin/affiliates`)

Permet de superviser le réseau de partenaires GhostAI et de valider les paiements des commissions.

### Fonctionnalités de Gestion :
- **Tableau de Bord des Affiliés** :
  - Liste de tous les parrains avec leur code personnalisé (`?ref=...`), clics totaux, inscriptions générées, abonnés actifs et total des gains perçus.
- **File de Modération des Demandes de Retrait (Payouts)** :
  - Affichage clair des retraits en attente dès que le seuil de 20 $ est atteint :
    - Montant demandé.
    - Méthode choisie : **Mobile Money** (Orange Money, MTN MoMo, Wave, etc.) ou **Virement Bancaire** (IBAN/BIC).
    - Coordonnées téléphoniques ou bancaires du titulaire.
- **Validation Humaine des Retraits** :
  - **Bouton Valider** : Confirme que le versement a été exécuté. Le statut passe à `Payé` et le registre financier est mis à jour.
  - **Bouton Rejeter** : Annule la demande avec motif obligatoire (coordonnées erronées, soupçon de fraude). Les fonds sont immédiatement recrédités sur le solde de l'affilié.
- **Suspension Administrative de Lien Partenaire** :
  - En cas d'auto-parrainage ou de pratique déloyale, désactivation immédiate du lien affilié.

---

## 7. Module 6 : Consommation & Coûts de l'IA (`/admin/ai-usage`)

Permet de maîtriser les coûts d'infrastructure et de surveiller l'utilisation des modèles d'intelligence artificielle.

### Indicateurs Techniques & Financiers :
1. **Télémétrie des Tokens en Temps Réel** :
   - Volume total de **Tokens de Prompt** (contexte, instructions, profil de voix).
   - Volume total de **Tokens de Completion** (posts rédigés, variantes générées).
2. **Calculateur de Coûts Financiers (USD)** :
   - Conversion automatique des tokens consommés en dollars réels selon la grille officielle :
     - **DeepSeek V3 (`deepseek-chat`)** : 0,27 $ / 1M tokens de prompt, 1,10 $ / 1M tokens de completion.
     - **Voyage AI (`voyage-3`)** : 0,12 $ / 1M tokens d'embeddings vectoriels.
3. **Coût Moyen par Post & par Utilisateur** :
   - Permet de vérifier la marge brute dégagée sur chaque formule d'abonnement (marge exceptionnelle grâce aux coûts optimisés de DeepSeek V3).
4. **Surveillance du Rate Limiting & Latence** :
   - Journal des appels API avec temps de réponse moyen (latence en ms) pour détecter d'éventuels ralentissements de DeepSeek.

---

## 8. Module 7 : Activité Métier & Qualité Éditoriale (`/admin/activity`)

Fournit une vision macroscopique sur la pertinence et la qualité des contenus créés par l'ensemble des utilisateurs.

### Métriques d'Impact :
- **Volume Global de Production** : Nombre total de posts LinkedIn et de packs d'atomisation (repurposing) générés sur la plateforme.
- **Voice Match Score Moyen de la Plateforme** : Mesure de la fidélité globale aux profils de voix des utilisateurs.
- **Taux de Détection de Clichés** : Fréquence à laquelle les juges automatiques interviennent pour éradiquer les tournures génériques.
- **Modale de Revue des Feedbacks Négatifs (Pouces Bas)** :
  - Consultation des posts ayant reçu un avis négatif de la part des utilisateurs, avec la raison précisée (*« tournure trop scolaire », « manque d'anecdotes »*).
  - Permet à l'équipe technique de peaufiner en continu les invites système (system prompts) de l'IA.

---

## 9. Module 8 : Système, Santé & Infrastructure (`/admin/system`)

Supervise l'état des serveurs, la connectivité des tiers et la configuration de sécurité.

### Diagnostics Disponibles :
1. **Pings de Connectivité en Temps Réel** :
   - Test actif de disponibilité avec affichage de la latence en millisecondes pour :
     - **Base de Données PostgreSQL (Neon)** : vérification de la connexion et de la disponibilité de l'extension vectorielle `vector`.
     - **DeepSeek V3 API** : disponibilité du modèle LLM.
     - **Stripe API** : connectivité avec la passerelle bancaire.
     - **Moteur de Sessions (Auth.js)** : intégrité des jetons de connexion.
2. **Audit Sécurisé des Variables d'Environnement** :
   - Diagnostic complet validant la présence de toutes les clés obligatoires (`DATABASE_URL`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, `DEEPSEEK_API_KEY`, `VOYAGE_API_KEY`, etc.).
   - **Protection Absolue des Données Sensibles** : les clés réelles ne sont jamais affichées en clair dans l'interface (masquage de type `sk_live_••••••••1234`).
3. **Métriques d'Exécution & Mémoire Serveur** :
   - Version de Node.js, version de Next.js, environnement d'exécution (`production` ou `development`), consommation de la mémoire Heap V8.

---

## 10. Journal d'Audit & Traçabilité (`AdminAuditLog`)

Pour assurer une conformité et une sécurité totales, **toute action effectuée par un administrateur est enregistrée de manière immuable** dans la table `AdminAuditLog` :

| Champ Enregistré | Description |
|---|---|
| `adminEmail` | Adresse email de l'administrateur ayant effectué l'opération |
| `action` | Intitulé de l'action (`USER_SUSPEND`, `PLAN_UPGRADE`, `PAYOUT_APPROVE`, etc.) |
| `targetUserId` | Identifiant de l'utilisateur ou du partenaire concerné |
| `ipAddress` | Adresse IP source de l'administrateur |
| `severity` | Niveau de gravité (`info`, `warning`, `critical`) |
| `details` | Objet JSON consignant les anciennes et nouvelles valeurs |
| `createdAt` | Date et heure précises de l'opération |

---

> **Document édité le :** 17 septembre 2026  
> **Console de Supervision :** `https://ghostai.app/admin`  
> **Éditeur & Développeur :** GhostAI — Youcheu Landry
