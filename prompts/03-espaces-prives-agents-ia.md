> **Héritage du socle.** Ce document décrit la construction des espaces privés, du portail
> entreprise et des agents pour le titre d'origine, « Le Corporate ». Il est conservé comme
> historique technique et n'a pas été réécrit : il décrit sept agents, BOMA Infos en compte
> huit (CDC §4.6). L'identité, la charte, les rubriques et les agents en vigueur sont ceux de
> BOMA Infos : voir [`README.md`](../README.md) et [`CAHIER-DES-CHARGES.md`](../CAHIER-DES-CHARGES.md).

# Prompt 3/3 — Espaces privés, portail entreprise et agents

> À exécuter après les lots 1 et 2. Référence : `../CAHIER-DES-CHARGES.md` (§4.3, §4.4, §4.6, §5.3).
> Objectif : la chaîne complète, de la rédaction à la publication, entreprises
> incluses, assistée par les agents.

---

## Contexte

Les lots 1 et 2 ont livré le design system et le journal public. Ce lot ajoute
**qui écrit, qui valide, qui publie** — et les agents qui suppriment le travail
répétitif.

Deux principes gouvernent tout ce lot :

1. **Un agent propose, un humain dispose.** Aucun agent ne publie, ne refuse ni
   ne modifie un contenu sans validation humaine explicite.
2. **Le cloisonnement est absolu.** Une entreprise ne voit jamais rien d'une
   autre entreprise. Ceci se vérifie côté serveur, à chaque requête, jamais
   seulement dans l'interface.

---

## Ce que tu dois livrer

### 1. Authentification et rôles

Avec **better-auth** sur Convex, les quatre rôles du §4.3 :

| Rôle | Périmètre |
|---|---|
| **Administrateur** (rédaction en chef) | Tout : publication, rubriques, comptes, réglages, agents, statistiques. |
| **Éditeur / Journaliste** | Rédige, soumet, publie dans ses rubriques autorisées. Ni comptes ni réglages. |
| **Client / Entreprise** | Uniquement son espace : dépôts, statuts, statistiques de ses publications. |
| **Lecteur** | Favoris, historique, préférences de newsletter. |

Exigences de sécurité, en réponse directe aux défauts constatés sur l'ancien
site :

- **Double authentification obligatoire** pour Administrateur et Éditeur.
- **Aucun identifiant par défaut** : pas de compte `admin` (l'ancien site expose
  le sien via son API). Comptes nominatifs.
- **Aucune énumération de comptes** : messages d'erreur d'authentification
  indifférenciés, API qui ne liste pas les utilisateurs.
- Limitation de débit sur la connexion, les formulaires et les dépôts.
- Sessions révocables, déconnexion de tous les appareils.
- **Journal d'audit horodaté** de toute action sensible : publication,
  dépublication, changement de rôle, validation de compte, suppression.
- Autorisations vérifiées **côté serveur** dans chaque fonction Convex.

Écrans : connexion, mot de passe oublié, configuration 2FA, profil. Tous en
français, validés par Zod.

### 2. Back-office rédaction

Pour Administrateur et Éditeur :

- **Tableau de bord** — à publier, en attente de revue, dépôts entreprises en
  attente, articles récents, audience.
- **Liste des articles** — filtres (statut, rubrique, auteur, origine),
  recherche, actions groupées.
- **Éditeur d'article** — éditeur de contenu riche (titres, gras, italique,
  listes, citations, liens, images légendées, encadrés, intertitres). Champs :
  chapô, rubrique, auteur, média principal, points-clés, SEO, programmation.
  Enregistrement automatique, historique des versions, aperçu.
  Les suggestions d'agents apparaissent **dans le flanc de l'éditeur**, chacune
  acceptable ou rejetable individuellement (`AgentSuggestionCard`).
- **Médiathèque** — import multiple, recherche, variantes générées, `alt`
  proposé par l'agent Média et modifiable.
- **Rubriques** — création, renommage, réordonnancement, couleur d'accent.
- **Comptes** (administrateur seul) — rôles, validation des entreprises,
  révocation.
- **Réglages** — identité du site, réseaux, newsletter, agents (activation
  unitaire, plafond de dépense), redirections.

### 3. Portail entreprise — le cœur de la demande

L'entreprise dépose son actualité elle-même ; la rédaction garde la main.

**Inscription** : raison sociale, NIF/RCCM, secteur, logo, contact. Le compte est
**validé manuellement** par un administrateur — pas d'ouverture automatique.

**Dépôt** (`SubmissionForm`) : titre, chapô, corps, visuels, rubrique souhaitée,
date de diffusion demandée, type (communiqué, nomination, résultats, événement,
publi-rédactionnel). Brouillon possible, reprise plus tard.

**Workflow** — statuts et transitions :

```
brouillon → soumis → en revue → modifications demandées → (re-soumis)
                            ↘ programmé → publié
                            ↘ refusé (motif obligatoire)
```

- À la soumission, l'**agent Modération** (§4.6, agent 5) produit une fiche de
  pré-qualification pour le rédacteur en chef : score de conformité à la charte,
  détection du publi-rédactionnel non déclaré, allégations à vérifier, doublons.
  **Cette fiche conseille ; la décision reste humaine.**
- La revue (`ReviewPanel`) permet : accepter · demander des modifications avec
  commentaires situés · refuser avec motif obligatoire.
- Chaque transition est notifiée par **courriel**, et par **WhatsApp** si le
  numéro est renseigné.

**Mention obligatoire** : tout contenu d'origine partenaire porte une mention
**« Communiqué »** ou **« Contenu partenaire »**, visible sur l'article et dans
les listes, **non contournable par l'entreprise**. C'est une exigence
déontologique, pas une option d'affichage.

**Retour à l'entreprise** : suivi des statuts, et une fois publié — vues, temps
de lecture moyen, partages. Rien sur les autres entreprises.

### 4. Les sept agents

Implémente les agents du §4.6. Chacun : déclencheur défini, suggestion tracée,
acceptable ou rejetable, historique conservé dans `AgentRun`.

| # | Agent | Ce qu'il supprime comme travail répétitif | Déclencheur |
|---|---|---|---|
| 1 | **Relecture** | Orthographe, grammaire, **typographie française** (espaces insécables avant `; : ! ?`, guillemets « », capitales accentuées), style maison. | À l'enregistrement |
| 2 | **Titraille** | 3 propositions de titre, 1 chapô, 1 accroche réseaux, 1 méta-description. | À la demande |
| 3 | **SEO** | Slug, métadonnées, mots-clés, **maillage interne** (repère les articles liés du fonds), données structurées `NewsArticle`. | À l'enregistrement |
| 4 | **Média** | **Texte alternatif** de chaque image, légende, recadrages 16:9 / 1:1 / 1200×630, conversion AVIF/WebP, compression. | À l'import |
| 5 | **Modération** | Pré-qualification des dépôts entreprises (voir §3 ci-dessus). | À la soumission |
| 6 | **Diffusion** | Déclinaisons **LinkedIn, WhatsApp, Facebook** ; composition de la **newsletter hebdomadaire** à partir des articles de la semaine. | À la publication |
| 7 | **Transcription** | Audio/vidéo d'interview → texte horodaté → trame questions/réponses. Sert la rubrique **Interview**. | À l'import d'un média |

**Garde-fous — à implémenter, pas seulement à documenter :**

- Journal complet des exécutions (agent, entrée, sortie, coût, décision humaine).
- **Plafond de dépense mensuel** avec alerte et arrêt.
- Désactivation individuelle de chaque agent depuis les réglages.
- **Repli manuel toujours disponible** : si un agent est indisponible, la tâche
  reste faisable à la main. Aucun blocage de la chaîne éditoriale.
- Les données éditoriales ne servent pas à l'entraînement de modèles tiers.
- Une suggestion rejetée n'est jamais réappliquée silencieusement.

Utilise l'ordonnanceur Convex pour les traitements différés (transcription,
newsletter) ; les traitements longs ne bloquent jamais l'interface.

### 5. Statistiques

Pour la rédaction : audience par article et rubrique, temps de lecture,
sources de trafic, partages. Pour l'entreprise : uniquement ses publications.
Mesure respectueuse de la vie privée, sans traqueur tiers — l'ancien site charge
MonsterInsights/Google Analytics, on s'en passe.

---

## Vérification — de bout en bout

1. **Parcours entreprise complet, réellement exécuté** : créer une entreprise,
   la valider en administrateur, déposer une actualité en tant qu'entreprise,
   voir la fiche de l'agent Modération, demander des modifications, re-soumettre,
   publier, constater la mention « Communiqué » sur l'article public, et voir
   les statistiques revenir côté entreprise. **Raconte ce que tu as constaté.**
2. **Cloisonnement** : avec deux entreprises distinctes, vérifie qu'aucune ne
   peut accéder aux données de l'autre — y compris en appelant directement les
   fonctions serveur, pas seulement via l'interface.
3. **Rôles** : un Éditeur ne peut ni gérer les comptes ni changer les réglages ;
   vérifie-le côté serveur.
4. Les 7 agents produisent chacun une suggestion validable ; la désactivation
   d'un agent et le plafond de dépense fonctionnent.
5. 2FA active et exigée pour Administrateur et Éditeur.
6. L'API ne permet aucune énumération de comptes.
7. Le journal d'audit enregistre bien publication, changement de rôle et
   validation d'entreprise.
8. Les budgets de performance du lot 2 **tiennent toujours** sur le site public :
   re-mesure et donne les chiffres.
9. `bun run build` et contrôle de types sans erreur.

---

## Critères de recette du projet (§6.2)

Le projet est livré quand : les budgets de performance sont tenus et vérifiés en
intégration continue ; l'audit d'accessibilité AA ne remonte aucun défaut
bloquant ; les en-têtes de sécurité sont en place ; **un dépôt d'entreprise
parcourt tout le workflow jusqu'à publication** ; les 7 agents produisent des
suggestions validables ; les anciennes URL répondent ; **la rédaction publie
sans assistance technique**.

---

## Livrable attendu

La chaîne éditoriale complète et fonctionnelle : connexion à rôles cloisonnés,
back-office de rédaction, portail entreprise avec workflow de modération jusqu'à
la publication, sept agents opérationnels sous garde-fous, statistiques — avec
le compte rendu des parcours réellement testés.
