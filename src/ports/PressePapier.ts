/**
 * Port : écriture dans le presse-papier système.
 */

export interface PressePapier {
  /** Tente d'écrire le texte. Retourne true si la copie a réussi. */
  ecrire(texte: string): Promise<boolean>;
}
