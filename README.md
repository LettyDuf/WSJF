# Outil de priorisation WSJF

> Outil interne d'aide à la priorisation des initiatives, fondé sur la formule WSJF (Weighted Shortest Job First) de SAFe.

[![Build & Deploy](https://github.com/USER/outil-wsjf/actions/workflows/deploy.yml/badge.svg)](https://github.com/USER/outil-wsjf/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Aperçu

Cet outil aide les **Product Managers**, **architectes de domaine** et **architectes fonctionnels** à comparer leurs initiatives sur un repère commun.

```
Note WSJF = (Valeur + Temps + Risque) / Taille
```

### Caractéristiques

- ✅ **Architecture hexagonale stricte** — domaine pur, ports, adaptateurs interchangeables
- ✅ **Sous-critères qualifiés** par composante WSJF (Faible / Moyen / Fort) pour structurer la conversation
- ✅ **Formule visuelle** qui se construit progressivement pendant la saisie
- ✅ **Vue comparative** avec graphique à bulles et composition empilée
- ✅ **Export multiple** : Excel (SharePoint), Markdown Jira, Markdown exhaustif (gouvernance)
- ✅ **Accessible WCAG 2.1 AA** (radiogroup ARIA, navigation clavier)
- ✅ **148 tests automatisés** (domaine + adaptateurs + UI)
- ✅ **Build single-file HTML autoportant** (~1 Mo, déployable sur SharePoint, Confluence, ou en local)

## Démarrage rapide

### Pour utiliser l'outil

Téléchargez `dist/index.html` et ouvrez-le en double-clic. Aucune installation requise.

Ou bien : ouvrez la version en ligne via GitHub Pages (lien dans les *About* du repo).

### Pour développer

```bash
git clone https://github.com/USER/outil-wsjf.git
cd outil-wsjf
npm install

npm run dev          # serveur de développement avec rechargement automatique
npm test             # toute la suite de tests
npm run build        # produit dist/index.html (fichier autoportant)
```

### Pré-requis dev

- Node.js >= 20
- npm >= 10

## Architecture

```
src/
├── domain/           # Règles métier pures, zéro dépendance externe
│   ├── valueObjects/   EchelleFibonacci, NoteWsjf, NiveauConfiance...
│   ├── entities/       Initiative
│   ├── services/       CalculateurWsjf, ClassificateurZone, InterpreteurNiveau
│   └── constantes/     SeuilsPriorisation, CatalogueSousCriteres
├── ports/            # Interfaces (contrats)
├── adapters/         # Implémentations concrètes
│   ├── persistence/    LocalStorageRepository avec versioning de schéma
│   ├── export/         ExcelExporteur, JsonExporteur, CsvExporteur
│   ├── import/         ExcelImporteur, JsonImporteur (validation stricte)
│   └── notification/   ToastNotificateur, ClipboardAdapter
├── ui/               # Rendu DOM, zéro logique métier
│   ├── state/          StoreApplication (état centralisé)
│   ├── components/     App, OngletEvaluation, OngletComparaison, GrapheBulles...
│   ├── formats/        formatJiraMarkdown, formatExhaustifMarkdown
│   └── helpers/        utilitaires DOM et SVG
└── main.ts           # Composition root
tests/
├── domain/           # Tests unitaires métier (100% couverture)
├── adapters/         # Tests d'intégration adaptateurs
└── ui/               # Tests d'interaction (Testing Library)
```

## Tests

```bash
npm test                # une passe
npm run test:watch      # mode interactif
npm run test:coverage   # rapport de couverture
```

**Cible** : 100 % domaine, > 80 % adaptateurs, > 70 % UI.

## Distribution

Le build produit un **fichier unique** `dist/index.html` (~1 Mo) qui contient HTML + CSS + JS + bibliothèque ExcelJS. Aucune dépendance runtime. Distribution possible :

- **GitHub Pages** : déploiement automatique à chaque push sur `main` (voir le workflow)
- **SharePoint** : dépôt dans une bibliothèque de documents
- **Confluence** : pièce jointe ou macro HTML
- **Local** : ouverture en double-clic depuis le disque

## Méthodologie WSJF

Cet outil implémente **WSJF (Weighted Shortest Job First)** selon SAFe :

- Échelle Fibonacci modifiée : 1, 2, 3, 5, 8, 13 (estimation relative)
- Coût d'attente = Valeur métier + Sensibilité au temps + Réduction du risque / activation d'opportunité
- Taille = effort relatif total (complexité, dépendances, incertitude)
- Note pondérée par confiance disponible à titre indicatif (inspirée de RICE)

**Posture pédagogique** : l'outil affiche des données neutres et la formule en construction. Il **n'interprète jamais** la note ni ne **suggère** de décision — c'est l'équipe humaine qui donne le sens en discussion d'arbitrage.

## Licence

[MIT](LICENSE)

## Auteurs

- **Lætitia Dufour** — conception métier, posture pédagogique

