/**
 * Catalogue des sous-critères qualitatifs par composante WSJF.
 *
 * Reformulation v2.1 — exemples pédagogiques :
 *  - Verbes d'action et observations concrètes (« on sait qui… », « un audit a déjà signalé… »)
 *  - 5 exemples maximum par sous-critère
 *  - Cohabitation Faible→Fort dans la liste : du moins au plus engageant
 *  - Bloc 5 : exemples = signes qu'un score Fort est mérité
 *
 * Source pédagogique : posture combinée Analyste d'Affaires + Product Manager + Coach Agile.
 *
 * Les sous-critères ne participent PAS au calcul de la note WSJF.
 * Ils structurent la conversation et documentent l'évaluation.
 * La note Fibonacci finale reste une estimation relative en synthèse.
 */

export type ClefComposanteCatalogue = 'valeur' | 'temps' | 'risque' | 'taille';

export interface DescripteurSousCritere {
  readonly lettre: string;
  readonly libelle: string;
  readonly exemples: readonly string[];
}

export const SOUS_CRITERES_VALEUR: readonly DescripteurSousCritere[] = [
  {
    lettre: 'A',
    libelle: "La clarté et l'importance du problème ou de l'occasion sont :",
    exemples: [
      "le problème est nommé en mots de l'utilisateur, pas en mots de solution",
      'on peut citer une situation concrète vécue ou observée',
      "plusieurs personnes ressentent le même irritant (ce n'est pas un cas isolé)",
      "l'impact si on ne fait rien est nommé (qui souffre, combien, à quelle fréquence)",
      'le sponsor sait expliquer le besoin en deux phrases',
    ],
  },
  {
    lettre: 'B',
    libelle: 'La population touchée ou la portée métier est :',
    exemples: [
      'on sait qui en bénéficie (rôle, segment, équipe) avec un volume estimé',
      "l'usage est régulier ou récurrent, pas un cas occasionnel",
      'le segment est petit en volume mais à fort enjeu (clients premium, conformité, partenaire clé)',
      'le bénéfice touche plusieurs parcours ou plusieurs équipes',
      'des données factuelles (analytics, support, terrain) confirment la portée',
    ],
  },
  {
    lettre: 'C',
    libelle: "Le confort utilisateur, l'expérience, le résultat métier ou l'impact économique attendu est :",
    exemples: [
      'on peut nommer un indicateur (taux de conversion, NPS, temps de traitement, coût unitaire)',
      "l'effet est observable au-delà d'une seule équipe ou d'un seul écran",
      'le gain est chiffré ou estimable, même approximativement',
      "l'utilisateur final peut décrire ce qui sera plus simple ou plus rapide",
      "le résultat ne dépend pas d'un facteur incontrôlable (marché, comportement client)",
    ],
  },
  {
    lettre: 'D',
    libelle: 'La contribution aux objectifs produit, métier ou stratégiques est :',
    exemples: [
      "l'objectif stratégique ou l'OKR auquel ça contribue peut être nommé",
      'sans ce travail, un engagement annuel ou pluriannuel risque de ne pas tenir',
      'c\'est cité explicitement dans la roadmap du domaine ou du programme',
      "l'absence se ferait sentir au prochain comité de direction",
      "cela rend possible d'autres initiatives déjà priorisées",
    ],
  },
];

export const SOUS_CRITERES_TEMPS: readonly DescripteurSousCritere[] = [
  {
    lettre: 'A',
    libelle: 'La contrainte de fenêtre temporelle pour les parties prenantes concernées est :',
    exemples: [
      'une date externe précise est imposée (réglementaire, contractuelle, lancement annoncé)',
      "une période d'usage intense approche (fin d'année, campagne, saison fiscale)",
      'un comité ou un sponsor attend la livraison pour une décision spécifique',
      "au-delà d'une date, le contexte change et l'effet recherché disparaît",
      "d'autres équipes ont planifié leur travail autour de cette livraison",
    ],
  },
  {
    lettre: 'B',
    libelle: "La perte de valeur, d'utilité ou d'option si l'élément est reporté est :",
    exemples: [
      'chaque mois de retard se traduit par une perte chiffrable (ventes, coûts, charges)',
      'un concurrent ou une solution alternative pourrait combler le besoin entretemps',
      'le retard fait grandir un contournement manuel ou un coût opérationnel récurrent',
      "au-delà d'un délai, on basculera sur un Plan B moins satisfaisant",
      "l'apprentissage utile aux étapes suivantes serait perdu si on diffère",
    ],
  },
  {
    lettre: 'C',
    libelle: "L'impact du report sur la qualité de l'expérience, du service, des opérations ou de la décision est :",
    exemples: [
      "pendant l'attente, les utilisateurs continuent de subir un irritant ou un dysfonctionnement",
      'des décisions opérationnelles continuent d\'être prises sans donnée fiable',
      "l'équipe ou le support absorbe une charge supplémentaire récurrente",
      "le risque d'erreur ou d'incident reste ouvert tant que rien n'est livré",
      "l'image perçue par le client ou l'utilisateur se dégrade au fil du temps",
    ],
  },
  {
    lettre: 'D',
    libelle: 'Le besoin de synchronisation avec des rôles, comités, engagements ou fenêtres de planification est :',
    exemples: [
      'une autre équipe ou un autre projet ne peut pas démarrer sans ce livrable',
      'un comité ou un sponsor attend ce livrable à une date connue',
      "la fenêtre de budget ou de capacité d'équipe se referme bientôt",
      "le contenu du livrable nécessite une décision préalable d'un acteur précis",
      'sans cette livraison, un engagement public ou interne sera difficile à tenir',
    ],
  },
];

export const SOUS_CRITERES_RISQUE: readonly DescripteurSousCritere[] = [
  {
    lettre: 'A',
    libelle: "Le risque de non-conformité, d'incident de sécurité, d'interruption de service ou d'échec opérationnel que cet élément réduit est :",
    exemples: [
      "un audit ou un contrôle réglementaire (AMF, OSFI, BPI…) a déjà signalé ce point",
      'une exposition de données, une fraude ou un incident est déjà documenté',
      'un service critique connaît des dégradations ou pannes récurrentes',
      'les opérations utilisent un traitement manuel ou un contournement fragile',
      'une défaillance publique pourrait affecter la réputation auprès des clients',
    ],
  },
  {
    lettre: 'B',
    libelle: "L'occasion produit, métier ou stratégique que cet élément permet réellement d'exploiter est :",
    exemples: [
      'un nouveau parcours client ou un nouveau canal devient possible',
      "un segment ou un partenaire qu'on ne pouvait pas servir devient accessible",
      'une donnée ou une capacité déjà disponible peut enfin être utilisée',
      'une automatisation lève une charge récurrente sur les opérations',
      "une trajectoire stratégique nommée gagne un trimestre d'avance",
    ],
  },
  {
    lettre: 'C',
    libelle: 'Le blocage actuel levé pour permettre des fonctionnalités, intégrations, migrations ou automatisations déjà identifiées est :',
    exemples: [
      "d'autres travaux du backlog sont en attente de cette capacité (on peut les nommer)",
      "une migration ou une intégration est gelée tant que ce n'est pas livré",
      'une équipe est forcée de produire du contournement faute de cette fondation',
      "le coût d'opportunité est concret : on sait quelles initiatives décoincent",
      "c'est un prérequis explicitement cité dans une roadmap ou un PI plan",
    ],
  },
  {
    lettre: 'D',
    libelle: "La réduction d'une fragilité déjà connue du service, de la solution ou des opérations est :",
    exemples: [
      'des incidents ou tickets récurrents sont déjà documentés',
      "l'équipe de maintenance signale une charge croissante",
      'une dépendance non maintenue ou vieillissante reste en production',
      'un contournement opérationnel coûte du temps à chaque cycle',
      "l'observabilité (logs, métriques, alertes) est insuffisante pour diagnostiquer",
    ],
  },
  {
    lettre: 'E',
    libelle: "L'inconnue technique, fonctionnelle, réglementaire ou opérationnelle qui empêche de choisir une solution, de découper le travail ou d'engager la suite est :",
    exemples: [
      "l'équipe hésite entre 2-3 options de solution sans pouvoir trancher",
      "la faisabilité technique n'a pas encore été démontrée par un POC",
      "une règle métier ou réglementaire reste ambiguë et bloque le cadrage",
      "la meilleure façon de découper le travail n'est pas évidente",
      "une dépendance critique pourrait reconfigurer toute l'approche",
    ],
  },
  {
    lettre: 'F',
    libelle: 'Le risque de prendre trop tôt une décision de solution difficile à renverser est :',
    exemples: [
      "une architecture cible serait verrouillée sans avoir testé les hypothèses",
      "un outil ou une plateforme serait choisi avant d'avoir comparé les options",
      "un découpage serait figé alors qu'il risque de créer du re-travail",
      'une migration serait lancée sans preuve que la cible tient',
      'on engagerait des ressources sur un Plan A alors que le Plan B reste pertinent',
    ],
  },
];

export const SOUS_CRITERES_TAILLE: readonly DescripteurSousCritere[] = [
  {
    lettre: 'A',
    libelle: 'Le périmètre fonctionnel ou technique à livrer est :',
    exemples: [
      'un seul écran, une seule règle ou un seul composant à modifier',
      'plusieurs écrans, processus ou composants touchés en même temps',
      'le périmètre est encore trop large et doit être découpé',
      'le livrable couvre plusieurs domaines fonctionnels difficiles à délimiter',
      "l'équipe ne peut pas l'absorber dans une seule itération ou un seul PI",
    ],
  },
  {
    lettre: 'B',
    libelle: 'Le nombre de systèmes, composants, équipes ou domaines touchés est :',
    exemples: [
      'un seul composant ou une seule équipe pilote tout',
      'plusieurs composants ou microservices à modifier en parallèle',
      'plusieurs équipes ou domaines doivent se coordonner',
      'une intégration avec sécurité, données ou opérations est nécessaire',
      'un effet de bord est possible sur des parcours non directement visés',
    ],
  },
  {
    lettre: 'C',
    libelle: 'Le niveau de dépendances, validations ou coordination nécessaire est :',
    exemples: [
      "l'équipe peut décider et avancer seule",
      'une autre équipe interne doit livrer ou valider en amont',
      'un avis architecture, sécurité ou conformité est obligatoire',
      'une dépendance externe (fournisseur, partenaire) conditionne l\'avancement',
      "plusieurs approbations doivent s'enchaîner avant la mise en production",
    ],
  },
  {
    lettre: 'D',
    libelle: "L'incertitude restante sur la solution, les règles ou le découpage est :",
    exemples: [
      'la solution est déjà connue et a déjà été pratiquée dans un cas comparable',
      'les règles métier sont partiellement clarifiées et nécessitent un atelier',
      'le découpage est encore théorique et reste à valider en équipe',
      "des hypothèses techniques ou fonctionnelles n'ont pas été testées",
      'plusieurs options de solution restent plausibles sans départage',
    ],
  },
  {
    lettre: 'E',
    libelle: "L'effort de vérification, déploiement, accompagnement ou transition opérationnelle est :",
    exemples: [
      'les tests sont simples et le déploiement suit la procédure habituelle',
      "des essais d'intégration ou de non-régression significatifs sont à prévoir",
      'une formation, une communication ou un accompagnement du métier est nécessaire',
      'une reprise de données ou une transition opérationnelle complexe est à gérer',
      'le déploiement est sensible et nécessite une fenêtre, du suivi ou un rollback',
    ],
  },
];

/**
 * Catalogue de sous-éléments du bloc 5 — Qualité de la décision (hors calcul).
 *
 * Reformulation v2.1 : les exemples décrivent les signes d'un score Fort.
 */
export const SOUS_ELEMENTS_QUALITE_DECISION = [
  {
    lettre: 'A',
    libelle: 'Le niveau de confiance dans les notes choisies est :',
    exemples: [
      'toutes les parties prenantes ont la même lecture du sujet',
      'les données et hypothèses qui appuient les notes sont solides',
      'les dépendances clés sont identifiées et confirmées',
      'le découpage est suffisamment stable pour engager une suite',
      'aucune hypothèse fragile ne pourrait inverser les notes choisies',
    ],
  },
  {
    lettre: 'B',
    libelle: 'La décision retenue après discussion est :',
    exemples: [
      "l'équipe a tranché clairement et la décision est documentée",
      'la décision tient compte du ratio, de la capacité disponible et des dépendances',
      'la décision est cohérente avec les autres décisions du portefeuille',
      'tous les participants ont entendu et adhèrent au choix (consentement éclairé)',
      'les conditions qui feraient revoir la décision sont nommées',
    ],
  },
  {
    lettre: 'C',
    libelle: "L'arbitrage explicite retenu est :",
    exemples: [
      'la décision retenue et son raisonnement sont écrits noir sur blanc',
      "le compromis accepté est nommé (ce qu'on choisit de ne pas faire)",
      'les hypothèses restantes à vérifier sont listées',
      "les conditions qui feraient revoir l'ordre de priorité sont explicites",
      "l'arbitrage peut être expliqué à un autre comité sans recontextualiser",
    ],
  },
] as const;

/** Toutes les valeurs admises pour une qualification de sous-critère. */
export const QUALIFICATIONS = ['Non qualifié', 'Faible', 'Moyen', 'Fort'] as const;
export type LibelleQualification = (typeof QUALIFICATIONS)[number];

/** Retourne le catalogue applicable à une composante donnée. */
export function catalogueDe(clef: ClefComposanteCatalogue): readonly DescripteurSousCritere[] {
  switch (clef) {
    case 'valeur': return SOUS_CRITERES_VALEUR;
    case 'temps': return SOUS_CRITERES_TEMPS;
    case 'risque': return SOUS_CRITERES_RISQUE;
    case 'taille': return SOUS_CRITERES_TAILLE;
  }
}
