# Accord de Traitement des Données (DPA) — GhostAI

**Date d’effet : 17 septembre 2026**

> Ce contrat cadre de sous-traitance des données (DPA) est conforme à l'article 28 du RGPD et régit les traitements de données personnelles effectués par GhostAI pour le compte de ses clients professionnels.

## 1. Parties et rôle des parties

Le présent Accord de Traitement des Données (« DPA ») est conclu entre :

- **le Client**, agissant pour son compte et, le cas échéant, pour le compte de ses propres clients, en qualité de responsable du traitement ; et
- **GhostAI (Youcheu Landry)**, projet SaaS en cours d'immatriculation (Cameroun), éditrice du service GhostAI (https://ghostai.app), en qualité de sous-traitant (« GhostAI »). Contact DPO : **privacy@ghostai.app**.

Lorsque le Client traite des données pour le compte de ses propres clients, il garantit disposer des instructions et autorisations nécessaires pour recourir à GhostAI. Il reste responsable de déterminer le rôle des parties au regard de la réglementation applicable.

## 2. Objet, durée et instructions

GhostAI traite les données personnelles uniquement pour fournir le Service de ghostwriting, de génération de contenus, de calibrage de voix, de bibliothèque, d’export et d’assistance associés au contrat principal, pendant la durée de celui-ci et conformément aux instructions documentées du Client.

GhostAI informe le Client si une instruction paraît contraire à la réglementation applicable, sauf interdiction légale de le faire.

## 3. Nature des traitements

Les opérations peuvent inclure la collecte, l’enregistrement, l’organisation, la structuration, l’hébergement, la consultation, l’analyse, la vectorisation, la génération, la restitution, l’export et la suppression des données nécessaires au Service.

Les catégories de personnes concernées peuvent inclure les utilisateurs autorisés du Client, ses collaborateurs, prospects, clients finaux, contacts professionnels et toute personne identifiée dans les contenus transmis par le Client.

Les catégories de données peuvent inclure les coordonnées professionnelles, contenus rédactionnels, profils de style, exemples de publications, données de compte, métadonnées techniques, retours de qualité et, selon les contenus transmis, d’autres données personnelles. Le Client s’abstient de transmettre des données sensibles ou hautement confidentielles sauf nécessité, base légale et mesures appropriées.

## 4. Obligations de GhostAI

GhostAI s’engage à :

- ne traiter les données que sur instruction documentée du Client, sauf obligation légale ;
- veiller à ce que les personnes autorisées à traiter les données soient soumises à une obligation de confidentialité ;
- mettre en œuvre des mesures techniques et organisationnelles appropriées au risque ;
- aider raisonnablement le Client à répondre aux demandes d’exercice de droits, aux analyses d’impact et aux consultations préalables, lorsque la réglementation applicable l’exige ;
- notifier au Client, sans délai injustifié après en avoir pris connaissance, toute violation de données personnelles pertinente ;
- à la fin du contrat, supprimer ou restituer les données selon le choix du Client, sauf conservation imposée par la loi ;
- fournir les informations raisonnablement nécessaires pour démontrer le respect du présent DPA et permettre les audits prévus à l’article 8.

## 5. Sécurité et IA

GhostAI met en œuvre des mesures adaptées, comprenant notamment la limitation des accès, l’authentification sécurisée, la protection des sessions, la journalisation de sécurité et l’hébergement dans une infrastructure PostgreSQL incluant, lorsque nécessaire, une extension vectorielle `pgvector`.

Les contenus du Client, profils de voix et embeddings sont traités pour fournir le Service. GhostAI ne les utilise pas pour entraîner des modèles d’intelligence artificielle publics ou tiers. Lorsque GhostAI recourt à des prestataires d’IA ou d’embeddings, ceux-ci interviennent en qualité de sous-traitants ultérieurs dans les conditions de l’article 6.

## 6. Sous-traitants ultérieurs

Le Client autorise GhostAI à recourir aux sous-traitants ultérieurs nécessaires au Service, notamment les prestataires d’hébergement, de base de données, d’authentification, de paiement, de génération IA et d’embeddings indiqués dans l’Annexe 2.

GhostAI impose à ces sous-traitants des obligations de protection des données substantiellement équivalentes à celles du présent DPA. GhostAI informera le Client de tout ajout ou remplacement matériel par **notification écrite par e-mail ou via l'interface d'administration**, afin de lui permettre de formuler une objection motivée dans le délai de **15 jours calendaires**.

## 7. Transferts internationaux

Si un transfert de données hors de l’Espace économique européen ou hors d’un territoire reconnu adéquat est nécessaire, GhostAI met en œuvre le mécanisme de transfert approprié requis par le droit applicable, tel que les clauses contractuelles types ou une décision d’adéquation.

## 8. Audit

Le Client peut, au plus une fois par période de 12 mois et sous réserve d’un préavis raisonnable, demander les informations nécessaires pour vérifier le respect du DPA. Tout audit sur site est soumis à un accord préalable, à des mesures de confidentialité, de sécurité et de non-perturbation, et ne doit pas compromettre les données d’autres clients.

## 9. Hiérarchie et responsabilité

Le présent DPA prévaut sur le contrat principal en cas de contradiction concernant le traitement des données personnelles. Chaque partie demeure responsable de ses propres obligations au regard de la réglementation applicable. Les limitations de responsabilité prévues au contrat principal s’appliquent dans la mesure permise par la loi.

---

## Annexe 1 — Description du traitement

| Élément | Description |
| --- | --- |
| Objet | Fourniture du Service GhostAI au Client |
| Durée | Durée du contrat principal, puis suppression ou restitution selon le présent DPA |
| Finalités | Génération et transformation de contenus, calibrage de voix, stockage, export, assistance et sécurité |
| Nature | Hébergement, analyse, vectorisation, génération, restitution, suppression |
| Personnes concernées | Utilisateurs du Client, collaborateurs, clients, prospects et contacts présents dans les contenus |
| Données | Données de compte, coordonnées professionnelles, contenus, préférences de style, métadonnées, retours |

## Annexe 2 — Sous-traitants ultérieurs validés

| Prestataire / catégorie | Rôle | Données potentiellement concernées | Localisation |
| --- | --- | --- | --- |
| Vercel Inc. | Hébergement applicatif serverless et réseau Edge | Données du Service, logs de requêtes | États-Unis / Global |
| Neon Inc. / PostgreSQL | Hébergement de la base de données applicative | Données du compte, posts, métadonnées | Union Européenne / Francfort |
| DeepSeek Inc. | Moteur de génération de texte par IA (DeepSeek V3) | Prompts et contenus éditoriaux (sans réentraînement) | Singapour / Global |
| Voyage AI Inc. | Modèle de vectorisation (Embeddings) | Extraits de style et vecteurs de voix | États-Unis |
| Stripe Payments Europe Ltd. | Passerelle de facturation et paiements sécurisés | Données de transaction et coordonnées de facturation | Irlande (UE) |

## Signatures

**Pour le Client**  
Nom : [NOM DU REPRÉSENTANT LÉGAL]  
Fonction : [FONCTION]  
Date : [DATE DE SIGNATURE]

**Pour GhostAI**  
Nom : Youcheu Landry  
Fonction : Fondateur & Responsable éditorial  
Date : 17 septembre 2026
