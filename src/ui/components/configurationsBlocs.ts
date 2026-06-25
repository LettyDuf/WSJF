import type { ConfigBlocComposante } from './BlocComposante.js';

const AMORCE = "Répondre à chaque énoncé par Faible, Moyen ou Fort. Les couleurs rendent les perceptions visibles pour soutenir la discussion ; elles ne produisent aucune recommandation de note. La note finale reste une estimation relative en Fibonacci.";

export const CONFIG_VALEUR: ConfigBlocComposante = {
  clef: 'valeur', numero: 1,
  titre: 'Valeur utilisateur-métier',
  sousTitre: "Mesure ce que ça apporte au client, à l'utilisateur ou au métier. Ne mesure pas l'urgence, ni l'effort.",
  couleur: 'bleu', pastille: "Dans le coût d'attente",
  texteAmorceReflexion: AMORCE,
  descriptionsValeurs: {
    1: "Valeur très faible, effet limité ou population marginale.",
    2: "Valeur faible, effet restreint ou bénéfice peu démontré.",
    3: "Valeur modérée ou limitée à une population clairement identifiée.",
    5: "Valeur claire pour une population ou un résultat métier identifié.",
    8: "Valeur forte : effet important, population significative ou objectif prioritaire.",
    13: "Valeur très forte : effet majeur, stratégique ou largement observable.",
  },
  preuveLibelle: 'Éléments factuels sur la valeur',
  preuvePlaceholder: 'Données, observations, utilisateurs concernés, effet attendu, hypothèses principales.',
};

export const CONFIG_TEMPS: ConfigBlocComposante = {
  clef: 'temps', numero: 2,
  titre: 'Sensibilité au temps',
  sousTitre: "Mesure ce que ça coûte d'attendre. Ne mesure pas la pression perçue ni la promesse politique.",
  couleur: 'orange', pastille: "Dans le coût d'attente",
  texteAmorceReflexion: AMORCE,
  descriptionsValeurs: {
    1: "La valeur varie peu avec le temps.",
    2: "Le délai a un effet limité.",
    3: "Le délai crée une perte modérée.",
    5: "Le délai entraîne une perte significative ou une fenêtre temporelle importante.",
    8: "Le délai réduit fortement la valeur.",
    13: "Le délai fait perdre une part majeure de la valeur.",
  },
  preuveLibelle: 'Notes utiles sur la sensibilité au temps',
  preuvePlaceholder: "Date, fenêtre, effet d'un report, dépendance, contrainte externe.",
};

export const CONFIG_RISQUE: ConfigBlocComposante = {
  clef: 'risque', numero: 3,
  titre: "Réduction du risque ou activation d'opportunité",
  sousTitre: "Mesure le risque réduit ou l'opportunité ouverte. Utile pour les sujets techniques, d'architecture ou de conformité.",
  couleur: 'vert', pastille: "Dans le coût d'attente",
  texteAmorceReflexion: AMORCE,
  descriptionsValeurs: {
    1: "Effet faible sur le risque ou les possibilités futures.",
    2: "Effet limité et localisé.",
    3: "Effet modéré ou préparation utile.",
    5: "Effet clair sur la réduction du risque ou l'activation d'une capacité future.",
    8: "Effet fort : dépendance importante levée, risque réduit ou opportunité ouverte.",
    13: "Effet très fort : risque majeur réduit ou capacité structurante rendue possible.",
  },
  preuveLibelle: "Notes utiles sur le risque ou l'opportunité",
  preuvePlaceholder: 'Risque, dépendance, dette, conformité, capacité future, comparaison avec le repère.',
};

export const CONFIG_TAILLE: ConfigBlocComposante = {
  clef: 'taille', numero: 4,
  titre: 'Taille du travail',
  sousTitre: "Mesure l'effort relatif total (complexité, dépendances, incertitude). Ce n'est pas une estimation en heures ni en jours.",
  couleur: 'violet', pastille: 'Diviseur',
  texteAmorceReflexion: AMORCE,
  descriptionsValeurs: {
    1: "Très petit : travail simple, peu de dépendances, faible incertitude.",
    2: "Petit : périmètre limité, dépendances faibles ou bien connues.",
    3: "Moyen : périmètre compréhensible, quelques dépendances ou incertitudes.",
    5: "Standard : effort, complexité et dépendances représentatifs du travail habituel.",
    8: "Grand : plusieurs dépendances, validations ou zones d'incertitude.",
    13: "Très grand : périmètre large, forte incertitude ou découpage probablement nécessaire.",
  },
  preuveLibelle: 'Notes utiles sur la taille et le découpage',
  preuvePlaceholder: 'Périmètre, systèmes touchés, dépendances, validations, incertitudes, vérification, déploiement ou option de découpage.',
};
