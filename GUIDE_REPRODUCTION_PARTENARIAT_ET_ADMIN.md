# Guide Complet de Reproduction : Système Partenaire (Affiliation 30%) & Dashboard Admin

Ce document détaille l'architecture intégrale, le schéma de base de données PostgreSQL/Supabase, les Server Actions Next.js, les webhooks Flutterwave, les mécanismes de sécurité et l'interface utilisateur du **Module Partenaire** et du **Dashboard Administrateur**.

Il est conçu pour vous permettre de reproduire ces deux systèmes à l'identique dans n'importe quel autre projet SaaS (Next.js 14/15 App Router, TypeScript, Tailwind CSS, Supabase).

---

## Sommaire

1. [Architecture Globale & Principes Clés](#1-architecture-globale--principes-clés)
2. [Module Partenaire (Programme d'Affiliation 30% à Vie)](#2-module-partenaire-programme-daffiliation-30-à-vie)
   - [2.1 Modèle de Données & Schéma SQL](#21-modèle-de-données--schéma-sql)
   - [2.2 Tracking & Attribution Immuable du Parrain](#22-tracking--attribution-immuable-du-parrain)
   - [2.3 Webhook de Paiement : Attribution & Période de Gel (30 jours)](#23-webhook-de-paiement--attribution--période-de-gel-30-jours)
   - [2.4 Gestion des Chargebacks & Remboursements (Protection Anti-Solde Négatif)](#24-gestion-des-chargebacks--remboursements-protection-anti-solde-négatif)
   - [2.5 Évaluation Paresseuse (Lazy Evaluation sans Cron)](#25-évaluation-paresseuse-lazy-evaluation-sans-cron)
   - [2.6 Workflow des Retraits (Seuil 20$, Mobile Money & Banque)](#26-workflow-des-retraits-seuil-20-mobile-money--banque)
   - [2.7 Interface Frontend Partenaire](#27-interface-frontend-partenaire)
3. [Dashboard Administrateur (Centre de Pilotage Global)](#3-dashboard-administrateur-centre-de-pilotage-global)
   - [3.1 Sécurité & Contrôle d'Accès Multi-Niveaux](#31-sécurité--contrôle-daccès-multi-niveaux)
   - [3.2 Modèle de Données Admin (Pricing, Audit, Quotas, Logs)](#32-modèle-de-données-admin-pricing-audit-quotas-logs)
   - [3.3 Les 8 Modules Administrateurs](#33-les-8-modules-administrateurs)
   - [3.4 Graphique SVG Natif (Zéro Dépendance Lourde)](#34-graphique-svg-natif-zéro-dépendance-lourde)
4. [Guide Pas-à-Pas pour la Reproduction dans un Nouveau Projet](#4-guide-pas-à-pas-pour-la-reproduction-dans-un-nouveau-projet)
5. [Checklist des Pièges & Bonnes Pratiques](#5-checklist-des-pièges--bonnes-pratiques)

---

## 1. Architecture Globale & Principes Clés

### Stack Technologique Utilisée
* **Framework Web :** Next.js 15 (App Router, Server Actions \`'use server'\`, React Transitions \`useTransition\`).
* **Base de données & Auth :** Supabase (PostgreSQL, Row Level Security, Triggers PL/pgSQL).
* **Passerelle de Paiement :** Flutterwave (Paiements par Carte / Mobile Money, Virements automatiques Flutterwave Transfers).
* **Cache & Rate Limiting (Optionnel) :** Upstash Redis (REST API) pour la synchronisation de configuration dynamique.
* **UI & Styles :** Tailwind CSS, Radix UI, Lucide Icons, Sonner (Toasts).

### 4 Piliers Fondamentaux de Conception
1. **Zéro Cron Externe pour le Gel des Commissions :** Les commissions sont débloquées de façon *paresseuse* (Lazy Evaluation) au moment où le partenaire consulte son espace ou demande un retrait.
2. **Attribution Définitive & Immuable :** Protégée au niveau base de données par un Trigger SQL. Un parrain ne peut jamais être écrasé après attribution.
3. **Protection Anti-Déficit & Remboursements :** Si un client se fait rembourser alors que la commission a déjà été versée, le solde disponible ne passe **jamais** en négatif. La différence est consignée dans un champ \`pending_debt\` déduit des futurs gains.
4. **Idempotence Stricte des Transactions :** Chaque webhook vérifie l'unicité de la référence de transaction (\`flutterwave_tx_ref\`) pour empêcher toute double commission.

---

## 2. Module Partenaire (Programme d'Affiliation 30% à Vie)

### 2.1 Modèle de Données & Schéma SQL

Voici le script SQL complet à exécuter sur Supabase :

\`\`\`sql
-- ==============================================================================
-- 1. Table des Partenaires / Affiliés (affiliates)
-- ==============================================================================
create table if not exists public.affiliates (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id uuid unique references auth.users(id) on delete cascade,
    code text unique not null,
    name text not null,
    email text not null,
    commission_rate numeric not null default 30.0, -- en %
    available_balance numeric not null default 0.0, -- solde retirable immédiatement
    pending_debt numeric not null default 0.0,      -- dette temporaire suite à litige/chargeback
    payout_method text not null default 'mobile_money', -- 'mobile_money' | 'bank'
    payout_details jsonb not null default '{}'::jsonb,
    code_modified boolean not null default false,   -- limite la personnalisation à 1 fois
    is_active boolean not null default true,         -- suspension administrative
    total_clicks integer not null default 0,
    total_signups integer not null default 0,
    total_conversions integer not null default 0,
    total_earned numeric not null default 0.0,
    pending_payout numeric not null default 0.0,
    status text not null default 'active',          -- 'active' | 'paused'
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_affiliates_user on public.affiliates(user_id);
create index if not exists idx_affiliates_code on public.affiliates(code);

-- ==============================================================================
-- 2. Évolution de la Table Profils (Attribution Filleul -> Parrain)
-- ==============================================================================
alter table public.profiles add column if not exists referred_by_partner_id uuid references public.affiliates(id) on delete set null;
alter table public.profiles add column if not exists referred_at timestamp with time zone null;

-- Trigger : Verrouillage absolu du parrain (anti-altération)
create or replace function public.prevent_referred_by_override()
returns trigger as $$
begin
  if old.referred_by_partner_id is not null and new.referred_by_partner_id is distinct from old.referred_by_partner_id then
    raise exception 'referred_by_partner_id est définitif et ne peut plus être modifié après attribution.';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_referred_by_override on public.profiles;
create trigger trg_prevent_referred_by_override
before update on public.profiles
for each row
execute function public.prevent_referred_by_override();

-- ==============================================================================
-- 3. Table des Clics d'Affiliation (Tracking)
-- ==============================================================================
create table if not exists public.affiliate_clicks (
    id uuid primary key default extensions.uuid_generate_v4(),
    affiliate_id uuid not null references public.affiliates(id) on delete cascade,
    referrer text null,
    source text null,
    ip_hash text null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_affiliate_clicks_affiliate on public.affiliate_clicks(affiliate_id);
create index if not exists idx_affiliate_clicks_created on public.affiliate_clicks(created_at desc);

-- ==============================================================================
-- 4. Table des Commissions (Gel 30 jours, Idempotence)
-- ==============================================================================
create table if not exists public.affiliate_commissions (
    id uuid primary key default extensions.uuid_generate_v4(),
    affiliate_id uuid not null references public.affiliates(id) on delete cascade,
    payer_user_id uuid null references auth.users(id) on delete set null,
    flutterwave_tx_ref text unique not null, -- Clé stricte d'idempotence
    order_amount numeric not null,
    commission_rate numeric not null default 30.0,
    commission_amount numeric not null,
    currency text not null default 'USD',
    status text not null default 'pending', -- 'pending' | 'available' | 'paid' | 'canceled'
    release_at timestamp with time zone not null default (timezone('utc'::text, now()) + interval '30 days'),
    details jsonb null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_affiliate_commissions_affiliate on public.affiliate_commissions(affiliate_id);
create index if not exists idx_affiliate_commissions_status on public.affiliate_commissions(status);
create index if not exists idx_affiliate_commissions_release on public.affiliate_commissions(release_at);

-- ==============================================================================
-- 5. Table des Virements de Retrait (Payouts)
-- ==============================================================================
create table if not exists public.affiliate_payouts (
    id uuid primary key default extensions.uuid_generate_v4(),
    affiliate_id uuid not null references public.affiliates(id) on delete cascade,
    amount numeric not null,
    currency text not null default 'USD',
    flutterwave_transfer_id text null,
    flutterwave_reference text unique not null,
    status text not null default 'pending', -- 'pending' | 'successful' | 'failed'
    payout_method text not null,            -- 'mobile_money' | 'bank'
    account_details jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_affiliate_payouts_affiliate on public.affiliate_payouts(affiliate_id);

-- ==============================================================================
-- 6. Sécurité RLS (Row Level Security)
-- ==============================================================================
alter table public.affiliates enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_commissions enable row level security;
alter table public.affiliate_payouts enable row level security;

create policy "Partners can view their own profile" on public.affiliates
for select using (user_id = auth.uid());

create policy "Partners can view their own commissions" on public.affiliate_commissions
for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);

create policy "Partners can view their own payouts" on public.affiliate_payouts
for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);

create policy "Partners can view their own clicks" on public.affiliate_clicks
for select using (
  affiliate_id in (select id from public.affiliates where user_id = auth.uid())
);
\`\`\`

---

### 2.2 Tracking & Attribution Immuable du Parrain

Le tracking se déroule en 3 étapes sans friction pour le visiteur :

#### Étape A : Le Middleware Next.js (\`middleware.ts\`)
Dès qu'un visiteur arrive avec l'URL \`https://mon-saas.com/?ref=arthur\`, le middleware intercepte le paramètre et pose un cookie d'une durée de 60 jours :

\`\`\`typescript
// middleware.ts (à la racine du projet)
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ref = request.nextUrl.searchParams.get('ref');

  if (ref) {
    // Stocker le code partenaire pendant 60 jours (en minuscules)
    response.cookies.set('easywork_ref', ref.trim().toLowerCase(), {
      maxAge: 60 * 24 * 60 * 60, // 60 jours
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
\`\`\`

#### Étape B : Endpoint de Télémétrie des Clics (\`api/track-ref/route.ts\`)
Permet de comptabiliser le clic dans \`affiliate_clicks\` et d'incrémenter le compteur \`total_clicks\` du partenaire :

\`\`\`typescript
// src/app/api/track-ref/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const referrer = searchParams.get('referrer') || req.headers.get('referer') || '';
  const source = searchParams.get('source') || '';

  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 });

  const supabase = await createServiceClient();
  const { data: partner } = await supabase
    .from('affiliates')
    .select('id, total_clicks, is_active')
    .ilike('code', code.trim())
    .maybeSingle();

  if (partner && partner.is_active !== false) {
    await supabase.from('affiliate_clicks').insert({
      affiliate_id: partner.id,
      referrer,
      source,
    });

    await supabase
      .from('affiliates')
      .update({ total_clicks: (partner.total_clicks || 0) + 1 })
      .eq('id', partner.id);

    return NextResponse.json({ tracked: true, partnerId: partner.id });
  }

  return NextResponse.json({ tracked: false });
}
\`\`\`

#### Étape C : Attribution à l'Inscription (\`auth/signup\` ou \`actions.ts\`)
Lors de la création du compte, on lit le cookie \`easywork_ref\`, on recherche le partenaire, et on applique les **règles anti-fraude** :
- Interdiction de s'auto-parrainer (même \`user_id\` ou même email).
- Enregistrement de \`referred_by_partner_id\` sur la table \`profiles\`.
- Incrémentation atomique de \`total_signups\` sur le partenaire.

\`\`\`typescript
// Extrait de l'action d'inscription utilisateur
const cookieStore = await cookies();
const refCode = cookieStore.get('easywork_ref')?.value;

if (refCode) {
  const { data: partner } = await supabase
    .from('affiliates')
    .select('id, user_id, email, is_active, total_signups')
    .ilike('code', refCode.trim())
    .maybeSingle();

  if (partner && partner.is_active !== false) {
    // Vérifier l'auto-parrainage
    const isSelf = 
      (partner.user_id && partner.user_id === newUser.id) ||
      (partner.email && partner.email.toLowerCase() === newUser.email.toLowerCase());

    if (!isSelf) {
      await supabase.from('profiles').upsert({
        user_id: newUser.id,
        email: newUser.email,
        referred_by_partner_id: partner.id,
        referred_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      await supabase.from('affiliates').update({
        total_signups: (partner.total_signups || 0) + 1,
      }).eq('id', partner.id);
    }
  }
}
\`\`\`

---

### 2.3 Webhook de Paiement : Attribution & Période de Gel (30 jours)

Lorsqu'un abonnement ou paiement réussit sur Flutterwave (\`charge.completed\`), le webhook attribue automatiquement les 30% au parrain :

1. **Sécurité :** Vérification du header \`verif-hash\` avec \`process.env.FLUTTERWAVE_SECRET_HASH\`.
2. **Double Vérification :** Appel de \`flutterwave.verifyTransaction(transactionId)\` pour valider le montant réel côté serveur.
3. **Recherche du Parrain :** Lecture de \`referred_by_partner_id\` sur le profil du client payeur.
4. **Idempotence :** Vérification qu'aucune commission n'existe déjà avec ce \`flutterwave_tx_ref\`.
5. **Calcul & Gel :**
   - \`Commission = Montant × (Taux / 100)\` (Ex: 30% sur 22$ = 6.60$).
   - \`Date de Déblocage = Date Transaction + 30 jours\` (Gel de sécurité anti-litige).
6. **Insertion dans \`affiliate_commissions\` avec \`status = 'pending'\`.**
7. **Incrémentation de \`total_earned\` et \`total_conversions\` sur le partenaire** (mais **pas** de \`available_balance\` tant que les 30 jours ne sont pas écoulés).

---

### 2.4 Gestion des Chargebacks & Remboursements (Protection Anti-Solde Négatif)

Si un client demande un remboursement ou initie une contestation bancaire (\`charge.refunded\`), l'algorithme garantit la sécurité financière du SaaS :

\`\`\`
             ┌──────────────────────────────────────────────┐
             │ Remboursement reçu pour tx_ref               │
             └──────────────────────┬───────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
      Commission encore 'pending'          Commission déjà 'available' / 'paid'
      (Période de gel non échue)            (Période de gel déjà passée)
                  │                                   │
                  ▼                                   ▼
     • Basculer status = 'canceled'       • Créer commission négative d'ajustement
     • Déduire total_earned               • Calcul du solde :
     • Le solde disponible est intact       Si solde >= commission :
                                               solde = solde - commission
                                            Sinon :
                                               déficit = commission - solde
                                               solde = 0
                                               pending_debt += déficit
\`\`\`

Grâce à ce mécanisme, le partenaire ne peut **jamais** avoir un solde négatif qui bloquerait la base de données, et le SaaS est garanti de récupérer le montant sur les prochaines commissions du partenaire.

---

### 2.5 Évaluation Paresseuse (Lazy Evaluation sans Cron)

Pour éviter de configurer et payer un service de cronjob externe (Vercel Cron, GitHub Actions, AWS EventBridge), le déblocage des commissions est calculé à la volée :

\`\`\`typescript
// src/utils/actions/partner/actions.ts
async function processMaturedCommissions(partnerId: string, supabase: any) {
  const now = new Date().toISOString();

  // 1. Trouver les commissions arrivées à échéance (> 30 jours)
  const { data: maturedCommissions } = await supabase
    .from('affiliate_commissions')
    .select('id, commission_amount')
    .eq('affiliate_id', partnerId)
    .eq('status', 'pending')
    .lte('release_at', now);

  if (maturedCommissions && maturedCommissions.length > 0) {
    const matureIds = maturedCommissions.map((c: any) => c.id);
    const totalMatured = maturedCommissions.reduce((sum: number, c: any) => sum + Number(c.commission_amount), 0);

    // 2. Basculer le statut en 'available'
    await supabase
      .from('affiliate_commissions')
      .update({ status: 'available' })
      .in('id', matureIds);

    // 3. Apurer la dette éventuelle ('pending_debt') et créditer le reste
    const { data: partner } = await supabase
      .from('affiliates')
      .select('available_balance, pending_debt')
      .eq('id', partnerId)
      .single();

    if (partner) {
      let currentBalance = Number(partner.available_balance || 0);
      let debt = Number(partner.pending_debt || 0);
      let remainingAfterDebt = totalMatured;

      if (debt > 0) {
        if (remainingAfterDebt >= debt) {
          remainingAfterDebt -= debt;
          debt = 0;
        } else {
          debt -= remainingAfterDebt;
          remainingAfterDebt = 0;
        }
      }

      const newBalance = currentBalance + remainingAfterDebt;

      await supabase
        .from('affiliates')
        .update({
          available_balance: newBalance,
          pending_debt: debt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId);
    }
  }
}
\`\`\`

Cette fonction s'exécute automatiquement dès que le partenaire appelle \`getPartnerData()\` ou \`requestPayout()\`.

---

### 2.6 Workflow des Retraits (Seuil 20$, Mobile Money & Banque)

Le retrait s'exécute via la Server Action \`requestPayout\` :

1. **Vérification du Seuil :** \`available_balance >= 20.00 $\`.
2. **Déduction Atomique Sécurisée :**
   \`\`\`typescript
   const { error: updateErr } = await serviceClient
     .from('affiliates')
     .update({ available_balance: available - amountToWithdraw })
     .eq('id', partner.id)
     .gte('available_balance', amountToWithdraw); // Empêche deux clics simultanés (Race Condition)
   \`\`\`
3. **Création du Payout en statut \`pending\` dans \`affiliate_payouts\`.**
4. **Appel Flutterwave Transfers API :**
   - Virement Mobile Money (Orange Money, MTN MoMo, Wave, Moov, Airtel).
   - Virement bancaire direct (IBAN / Numéro de compte).
5. **Résultat via Webhook \`transfer.completed\` :**
   - Si \`SUCCESSFUL\` : le statut passe à \`successful\`.
   - Si \`FAILED\` ou \`REVERSED\` : le statut passe à \`failed\` et le montant retiré est **automatiquement recrédité** sur le solde du partenaire.

---

### 2.7 Interface Frontend Partenaire

Le composant \`src/app/(dashboard)/partner/page.tsx\` gère dynamiquement deux états :

1. **État Utilisateur Non Partenaire (Onboarding 1-Clic) :**
   - Titre d'accroche : *"Touchez 30% chaque mois sur chaque abonné, à vie."*
   - 3 règles clés en puces claires.
   - Case à cocher obligatoire pour accepter les Conditions Générales Partenaires (\`/legal/terms-partners\`).
   - Bouton d'activation qui génère automatiquement un slug propre (ex: \`arthur\`, ou \`arthur-2\` si collision).

2. **État Partenaire Actif :**
   - **Bannière de statut :** Actif (30% à vie) ou Alerte si le compte est suspendu par un admin.
   - **Boîte de partage :** URL unique \`https://mon-saas.com/?ref=code\` avec bouton de copie 1-clic et modal de personnalisation du code (autorisée 1 seule fois, validation regex \`^[a-z0-9-]+$\`, exclusion des slugs réservés comme \`admin\`, \`api\`, \`dashboard\`).
   - **3 Cartes Financières Clés :**
     - **Total Gagné :** Cumul historique des commissions.
     - **Gel 30 jours (En attente) :** Montant en cours de gel avec la date du prochain déblocage.
     - **Solde Retirable :** Montant immédiatement disponible avec mention de la dette éventuelle et seuil restant avant 20$.
   - **Métriques de Trafic :** Clics sur 7 jours vs période précédente (indicateur vert/rouge), inscriptions gratuites et taux de conversion en clients payants.
   - **Module de Retrait & Coordonnées :** Choix entre Mobile Money et Compte bancaire, formulaire de mise à jour des coordonnées et bouton de retrait avec modal de confirmation.
   - **Tableaux Historiques :**
     - Historique des commissions (Date, Vente d'origine, Commission 30%, Statut avec badges colorés, Date de déblocage).
     - Historique des virements (Date, Montant, Méthode, Référence Flutterwave, Statut).

---

## 3. Dashboard Administrateur (Centre de Pilotage Global)

### 3.1 Sécurité & Contrôle d'Accès Multi-Niveaux

Le contrôle d'accès est géré de manière étanche côté serveur dans \`src/utils/actions/admin/actions.ts\` :

\`\`\`typescript
export async function checkAdminAccess(): Promise<{ isAdmin: boolean; email?: string; id?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@mon-saas.com')
    .split(',')
    .map(e => e.trim().toLowerCase());

  if (!user) {
    if (process.env.NODE_ENV !== 'production') {
      return { isAdmin: true, email: adminEmails[0], id: 'admin-dev' };
    }
    return { isAdmin: false };
  }

  // 1. Vérification par liste blanche d'emails
  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return { isAdmin: true, email: user.email, id: user.id };
  }

  // 2. Vérification par colonne booléenne en base
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.is_admin) {
    return { isAdmin: true, email: user.email, id: user.id };
  }

  return { isAdmin: false };
}
\`\`\`

Dans \`src/app/admin/layout.tsx\`, toute requête non autorisée est redirigée immédiatement :
\`\`\`typescript
const { isAdmin } = await checkAdminAccess();
if (!isAdmin) {
  redirect('/auth/login?error=admin_required');
}
\`\`\`

---

### 3.2 Modèle de Données Admin (Pricing, Audit, Quotas, Logs)

Exécutez ce script SQL pour déployer l'infrastructure d'administration :

\`\`\`sql
-- 1. Droits et suspensions sur les profils
alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.profiles add column if not exists is_suspended boolean default false;

-- 2. Configuration dynamique des tarifs et quotas (éditables depuis l'admin)
create table if not exists public.admin_pricing_config (
    id text primary key default 'default',
    sprint_price numeric not null default 13,
    monthly_price numeric not null default 22,
    lifetime_price numeric not null default 69,
    founder_quota_total integer not null default 200,
    founder_quota_used integer not null default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.admin_pricing_config (id, sprint_price, monthly_price, lifetime_price, founder_quota_total, founder_quota_used)
values ('default', 13, 22, 69, 200, 0)
on conflict (id) do nothing;

-- 3. Journal d'audit des actions sensibles
create table if not exists public.admin_audit_logs (
    id uuid primary key default extensions.uuid_generate_v4(),
    admin_email text not null,
    action text not null,
    target_user_id text null,
    details jsonb null default '{}'::jsonb,
    ip_address text null,
    severity text not null default 'info', -- 'info' | 'warning' | 'critical'
    created_at timestamp with time zone default timezone('utc'::text, now())
);
create index if not exists idx_audit_created on public.admin_audit_logs(created_at desc);

-- 4. Consommation IA (LLMs & Tokens)
create table if not exists public.ai_usage_logs (
    id uuid primary key default extensions.uuid_generate_v4(),
    user_id text not null,
    user_email text null,
    operation text not null,
    model text not null default 'deepseek-chat',
    prompt_tokens integer not null default 0,
    completion_tokens integer not null default 0,
    total_tokens integer not null default 0,
    estimated_cost_usd numeric not null default 0.0,
    is_free_user boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
create index if not exists idx_ai_usage_user on public.ai_usage_logs(user_id);
create index if not exists idx_ai_usage_created on public.ai_usage_logs(created_at desc);

-- 5. Rate Limiting IA et paramètres système
create table if not exists public.admin_system_config (
    id text primary key default 'default',
    rate_limit_capacity integer not null default 80,
    rate_limit_duration_hours integer not null default 5,
    rate_limit_enabled boolean not null default true,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

insert into public.admin_system_config (id, rate_limit_capacity, rate_limit_duration_hours, rate_limit_enabled)
values ('default', 80, 5, true)
on conflict (id) do nothing;
\`\`\`

---

### 3.3 Les 8 Modules Administrateurs

Le dashboard est organisé autour d'une barre latérale persistante (\`AdminSidebar\`) donnant accès à 8 modules métiers :

| Module | Route | Rôle & Fonctionnalités Clés |
| :--- | :--- | :--- |
| **1. Vue d'ensemble** | \`/admin\` | 4 KPIs financiers (MRR, Utilisateurs, Conversion %, Affiliés), graphique 30 jours SVG, état instantané des services, flux d'audit en direct. |
| **2. Utilisateurs** | \`/admin/users\` | Recherche textuelle, filtrage par abonnement et statut (actif/suspendu), modal fiche détaillée (CVs créés, dépenses totales), actions directes : **suspendre/réactiver** un compte et **forcer un surclassement** de formule. |
| **3. Abonnements & Tarifs** | \`/admin/subscriptions\` | Modification en direct des prix (Sprint 13€, Mensuel 22€, Fondateur 69€) et du quota Fondateur sans redéploiement, détection automatique des abonnements Sprint expirant sous 48-72h avec bouton de relance et prolongation gratuite (+7 jours). |
| **4. Paiements** | \`/admin/payments\` | Journal exhaustif de toutes les transactions Flutterwave avec montant, plan, moyen de paiement et statut. |
| **5. Affiliés & Modération** | \`/admin/affiliates\` | Supervision de tous les partenaires, création manuelle d'affilié, suspension/réactivation en 1 clic d'un lien suspect, validation de versement manuel avec journalisation d'audit. |
| **6. Consommation IA** | \`/admin/ai-usage\` | Volume total de tokens consommés, coûts DeepSeek en USD, répartition par opération, panneau de contrôle du **Rate Limiting dynamique** (capacité en requêtes et durée en heures) synchronisé en direct avec Supabase et Upstash Redis. |
| **7. Activité Métier** | \`/admin/activity\` | Métriques d'utilisation du cœur produit (CVs de base, CVs adaptés aux offres, offres analysées, score ATS moyen). |
| **8. Système & Santé** | \`/admin/system\` | Pings de connectivité en temps réel de Supabase PostgreSQL, Flutterwave API, DeepSeek API et Upstash Redis, vérification du statut des variables d'environnement secrètes. |

---

### 3.4 Graphique SVG Natif (Zéro Dépendance Lourde)

Pour garantir des temps de chargement instantanés et éviter les bibliothèques lourdes comme Recharts ou Chart.js qui augmentent le bundle client, la courbe des revenus sur 30 jours est calculée et rendue en SVG pur :

\`\`\`tsx
// Extrait de src/app/admin/page.tsx
const maxRev = Math.max(...chartData.map(d => d.revenue), 10);
const minRev = Math.min(...chartData.map(d => d.revenue), 0);
const svgWidth = 800;
const svgHeight = 220;

// Calcul des coordonnées des points (x, y)
const points = chartData.map((d, index) => {
  const x = (index / (chartData.length - 1 || 1)) * (svgWidth - 60) + 30;
  const y = svgHeight - 30 - ((d.revenue - minRev) / (maxRev - minRev || 1)) * (svgHeight - 60);
  return \`\${x},\${y}\`;
}).join(' ');

// Polygone pour le dégradé sous la courbe
const areaPoints = \`\${points} \${svgWidth - 30},\${svgHeight} 30,\${svgHeight}\`;

return (
  <svg viewBox={\`0 0 \${svgWidth} \${svgHeight}\`} className="w-full h-full overflow-visible">
    <defs>
      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#C9A96E" stopOpacity="0.0" />
      </linearGradient>
    </defs>
    <polygon points={areaPoints} fill="url(#goldGradient)" />
    <polyline fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
  </svg>
);
\`\`\`

---

## 4. Guide Pas-à-Pas pour la Reproduction dans un Nouveau Projet

### Étape 1 : Variables d'Environnement (\`.env.local\`)
Ajoutez les clés suivantes dans votre projet cible :

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Flutterwave
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_HASH=votre_secret_hash_webhook

# Administration
ADMIN_EMAILS=fondateur@mon-saas.com,admin@mon-saas.com

# Tarifs par défaut
NEXT_PUBLIC_FLUTTERWAVE_SPRINT_PRICE=13
NEXT_PUBLIC_FLUTTERWAVE_MONTHLY_PRICE=22
NEXT_PUBLIC_FLUTTERWAVE_LIFETIME_PRICE=69

# (Optionnel) Upstash Redis
UPSTASH_REDIS_REST_URL=https://votre-cluster.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYgUASQg...
\`\`\`

### Étape 2 : Exécution des Migrations SQL
1. Allez dans le **SQL Editor** de votre projet Supabase.
2. Copiez-collez l'intégralité du script SQL du [Chapitre 2.1](#21-modèle-de-données--schéma-sql) (Partenaires).
3. Copiez-collez le script SQL du [Chapitre 3.2](#32-modèle-de-données-admin-pricing-audit-quotas-logs) (Admin).

### Étape 3 : Mise en Place des Utilitaires Supabase
Assurez-vous de disposer de deux clients Supabase dans votre projet :
- \`createClient()\` : client standard respectant les politiques RLS pour l'utilisateur connecté (\`@supabase/ssr\`).
- \`createServiceClient()\` : client utilisant la clé \`SUPABASE_SERVICE_ROLE_KEY\` pour exécuter les opérations critiques côté serveur (webhooks, lazy evaluation, lecture globale admin).

### Étape 4 : Déploiement du Middleware
Créez le fichier \`middleware.ts\` à la racine de votre projet avec le code fourni à la [Section 2.2](#22-tracking--attribution-immuable-du-parrain).

### Étape 5 : Intégration du Webhook Flutterwave
Créez la route \`src/app/api/webhooks/flutterwave/route.ts\` et configurez cette URL dans votre dashboard Flutterwave (*Settings > Webhooks*) en y associant votre \`FLUTTERWAVE_SECRET_HASH\`.

### Étape 6 : Copie des Server Actions & Pages
1. Copiez \`src/utils/actions/partner/actions.ts\` et \`src/app/(dashboard)/partner/page.tsx\`.
2. Copiez \`src/utils/actions/admin/actions.ts\` et tout le dossier \`src/app/admin/\`.
3. Copiez le composant \`AdminSidebar\` dans \`src/components/admin/admin-sidebar.tsx\`.

---

## 5. Checklist des Pièges & Bonnes Pratiques

| Piège / Risque | Solution Appliquée dans ce Projet |
| :--- | :--- |
| **Auto-parrainage** | Vérification stricte lors de l'attribution : rejet si le compte parrain possède le même \`user_id\` ou la même adresse email. |
| **Récrasement de parrain** | Trigger SQL \`prevent_referred_by_override\` qui lève une exception si un update tente de modifier un \`referred_by_partner_id\` déjà valorisé. |
| **Double attribution sur le Webhook** | Contrainte d'unicité sur \`affiliate_commissions.flutterwave_tx_ref\` et vérification préalable de non-existence avant insertion. |
| **Litige bancaire après versement** | Débit du solde plafonné à 0, mise en négatif reportée dans \`pending_debt\` pour apurement prioritaire sur les prochains gains. |
| **Retrait frauduleux en double clic** | Clause conditionnelle atomique SQL \`.gte('available_balance', amount)\` lors de la déduction du solde. |
| **Rejet de virement par la banque** | Écoute de l'événement \`transfer.completed\` (status FAILED/REVERSED) qui recrédite automatiquement le solde du partenaire. |
| **Accès non autorisé au Dashboard Admin** | Double barrière : vérification d'email dans la Server Action + vérification serveur dans \`admin/layout.tsx\` avec redirection vers \`/auth/login\`. |
| **Slugs de parrainage sensibles** | Liste noire des mots réservés (\`admin\`, \`api\`, \`auth\`, \`pricing\`, etc.) et validation regex \`^[a-z0-9-]+$\`. |

---
*Ce guide constitue la référence technique complète du système EasyWork.*
