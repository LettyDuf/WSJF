/**
 * Constantes métier centralisées.
 *
 * Toutes les valeurs numériques utilisées dans les règles WSJF sont définies ici.
 * Aucun "magic number" n'est admis ailleurs dans le code.
 *
 * Pour modifier un seuil : modifier ici, puis ajuster les tests qui s'y réfèrent.
 *
 * Sources :
 * - Échelle Fibonacci modifiée : convention SAFe (Scaled Agile Framework).
 * - Seuils de niveau et de zone : repères pragmatiques, à ajuster selon le retour
 *   d'expérience de l'équipe. Ils servent à orienter la discussion, pas à décider.
 */

/** Valeurs admises pour les composantes WSJF (échelle Fibonacci modifiée SAFe). */
export const ECHELLE_FIBONACCI = [1, 2, 3, 5, 8, 13] as const;

/** Type des valeurs Fibonacci admises. */
export type ValeurFibonacci = (typeof ECHELLE_FIBONACCI)[number];

/**
 * Seuils d'interprétation qualitative de la note WSJF.
 *
 * La note WSJF = coût du délai / taille. Coût maximal = 3 × 13 = 39.
 * Taille minimale = 1. Donc note maximale théorique = 39.
 *
 * - Très élevée (≥ 10) : top ~25 % des notes théoriques, candidat à arbitrer tôt.
 * - Élevée (≥ 6)       : second quartile, à comparer avec le haut de la liste.
 * - Moyenne (≥ 3)      : milieu de tableau, comparaison nécessaire.
 * - Faible (< 3)       : à challenger ou planifier plus tard.
 */
export const SEUILS_NIVEAU = {
  TRES_ELEVE: 10,
  ELEVE: 6,
  MOYEN: 3,
} as const;

/**
 * Seuils utilisés par le graphique à bulles (coût du délai vs taille).
 *
 * - Coût élevé : ≥ 20 (au-dessus de la moitié du coût maximal théorique de 39).
 * - Taille importante : > 5 (au-dessus du milieu de l'échelle Fibonacci).
 */
export const SEUILS_ZONE = {
  COUT_ELEVE: 20,
  TAILLE_IMPORTANTE: 5,
} as const;

/**
 * Facteurs de pondération de la note WSJF par le niveau de confiance.
 *
 * Choix de design : une initiative évaluée avec une confiance faible voit sa note
 * réduite, pour éviter qu'elle ne remonte artificiellement la file de priorité
 * sur la base de chiffres fragiles.
 *
 * Valeurs choisies pour produire un écart visible sans écraser les notes faibles.
 * À calibrer selon le retour d'expérience après quelques cycles de priorisation.
 */
export const FACTEURS_CONFIANCE = {
  ELEVE: 1.0,
  MOYEN: 0.85,
  FAIBLE: 0.6,
} as const;

/**
 * Facteurs de taille qui appellent une vigilance particulière au moment
 * de l'engagement. Affichés sous forme de cases à cocher dans l'interface.
 */
export const FACTEURS_TAILLE = [
  'Plusieurs équipes',
  'Dépendances externes',
  'Risque de régression',
  'Incertitude technique',
  'Sécurité ou conformité',
  'Données ou migration',
] as const;

export type FacteurTaille = (typeof FACTEURS_TAILLE)[number];

/** Seuil au-delà duquel la présence cumulée de facteurs de taille déclenche une alerte. */
export const SEUIL_FACTEURS_TAILLE_ALERTE = 4;
