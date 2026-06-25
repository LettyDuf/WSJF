/**
 * Port : référentiel d'initiatives.
 *
 * Toute implémentation (localStorage, fetch vers un API, IndexedDB...)
 * doit respecter ce contrat. Le domaine et l'UI ne connaissent que ce port.
 */

import type { Initiative } from '../domain/index.js';

export interface RepositoryInitiatives {
  /** Charge toutes les initiatives persistées. Retourne [] si rien n'est stocké. */
  charger(): Promise<Initiative[]>;

  /** Persiste la liste complète des initiatives (écrasement total). */
  sauvegarder(initiatives: ReadonlyArray<Initiative>): Promise<void>;

  /** Supprime toutes les initiatives persistées. */
  vider(): Promise<void>;
}
