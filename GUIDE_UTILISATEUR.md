# Guide d'utilisation — Outil de priorisation WSJF

## Pour qui ?

Cet outil aide à comparer plusieurs initiatives sur un repère commun, en utilisant la formule WSJF (Weighted Shortest Job First). Il s'adresse aux Product Managers, architectes de domaine et architectes fonctionnels.

L'outil ne décide pas à votre place. Il donne un ordre de priorité indicatif fondé sur quatre composantes évaluées de façon factuelle. La décision d'arbitrage reste collective.

## Ouvrir l'outil

Trois façons d'y accéder :
1. **En local** : double-cliquer sur `index.html`.
2. **Depuis SharePoint** : ouvrir le fichier `index.html` dans la bibliothèque de documents.
3. **Depuis Confluence** : suivre le lien de la page qui héberge l'outil.

Les données saisies sont sauvegardées **localement dans le navigateur**. Pour partager entre utilisateurs ou postes, il faut exporter et réimporter.

## Évaluer une initiative — la nouvelle structure

L'évaluation d'une composante WSJF se fait en trois temps :

### 1. Critères de réflexion (sous-critères qualifiés)

Chaque composante propose plusieurs **sous-critères** (A, B, C, D, parfois E et F). Pour chacun :
- **Cliquer sur l'option qui décrit le mieux la situation** : Faible / Moyen / Fort. L'état initial est « À qualifier » avec une pastille rouge « Non qualifié ».
- **Cliquer sur l'icône « ? »** pour afficher une liste d'exemples concrets à discuter.

Les sous-critères **ne calculent pas la note Fibonacci**. Ils structurent la discussion et documentent l'évaluation. Les couleurs (rouge / orange / vert) rendent visibles les perceptions pour soutenir le dialogue en équipe.

### 2. Note Fibonacci finale

Après avoir qualifié les sous-critères, **choisir la note Fibonacci** (1, 2, 3, 5, 8, 13) qui synthétise votre conviction relative pour cette composante par rapport à l'élément de repère.

### 3. Notes utiles

Champ texte libre en bas du bloc pour documenter par écrit les éléments factuels qui justifient la note.

## Le bloc « Qualité de la décision » — Hors calcul

Trois sous-éléments (A, B, C) marqués **« Hors calcul »** :
- **A. Niveau de confiance** — dropdown Faible / Moyen / Élevé
- **B. Décision retenue** — dropdown (Traiter maintenant, Planifier, Découper, Clarifier, Mettre en attente, Écarter, À arbitrer)
- **C. Arbitrage explicite** — textarea libre (décision retenue, compromis accepté, hypothèses restantes, condition qui ferait revoir la priorité)

Ces informations ne modifient pas la note WSJF officielle. Elles servent à qualifier la fiabilité de l'ordonnancement et à expliciter le choix.

## Lecture des deux notes affichées

- **Note WSJF (officielle)** — formule SAFe canonique : `(Valeur + Temps + Risque) / Taille`. C'est la note utilisée pour le tri du référentiel, la vue comparative et les graphiques. Défendable en comité.
- **Note pondérée (hors calcul)** — note WSJF multipliée par un facteur de confiance (Élevé ×1,0 / Moyen ×0,85 / Faible ×0,6). Sert d'**alerte indicative** : si la note pondérée est nettement plus basse que la note officielle, c'est un signal que l'évaluation repose sur des hypothèses fragiles.

## Partager le référentiel — workflow recommandé en grande entreprise

L'outil n'a pas de serveur. Le partage se fait par fichier Excel, lisible directement dans Excel ou Excel Online, filtrable, triable, versionné par SharePoint.

### Workflow type pour un comité d'arbitrage

1. **Avant le comité** : télécharger depuis SharePoint la dernière version `wsjf-referentiel-AAAA-MM-JJ.xlsx`.
2. **Ouvrir l'outil**, aller dans l'onglet 2.
3. **Importer Excel ou JSON**, choisir le fichier. Choisir « Remplacer » ou « Fusionner ».
4. **Animer la discussion** sur la base de la vue comparative et des graphiques.
5. **À la fin**, cliquer sur « Exporter Excel ». **Déposer le fichier sur SharePoint**.

L'Excel exporté contient désormais 5 feuilles :
- **Initiatives** : table principale avec note WSJF officielle et note pondérée indicative
- **Éléments factuels** : preuves textuelles, repère, résultat attendu, arbitrage
- **Sous-critères qualifiés** : une ligne par sous-critère qualifié (A, B, C, D...)
- **Métadonnées** : version du schéma, date d'export
- **Référence WSJF** : formule et pédagogie

### Validation à l'import

L'outil vérifie chaque ligne. Si une valeur Fibonacci est invalide (7, 11…) ou si une décision/confiance/qualification est inconnue, la ligne est rejetée avec un message dans la console. Les autres lignes sont importées normalement.

## Points d'attention

- **L'élément de repère est essentiel**. Sans repère commun, les notes ne sont pas comparables.
- **La note ne décide pas**. Elle ordonne, propose, met en relief. Le contexte (capacité, dépendances) reste l'affaire de la discussion.
- **Si la note pondérée est très différente de la note officielle**, la confiance est faible — clarifier avant d'engager.
- **Les seuils (10, 6, 3 et la limite 20 du graphique à bulles) sont des repères**. Modifiables dans `src/domain/constantes/SeuilsPriorisation.ts`.

## Aide

- Pour un bug ou une suggestion : contacter le responsable de l'outil.
- Pour la formation WSJF en général : voir la documentation SAFe (https://scaledagileframework.com).
