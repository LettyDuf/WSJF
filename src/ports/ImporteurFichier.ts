/**
 * Port : import d'un fichier (Excel, JSON).
 *
 * L'import est volontairement strict : toute incohérence est signalée
 * dans `erreurs` plutôt que silencieusement ignorée.
 */

import type { Initiative } from '../domain/index.js';

export interface ErreurImport {
  ligne?: number;
  champ?: string;
  message: string;
}

export interface ResultatImport {
  initiatives: Initiative[];
  erreurs: ErreurImport[];
  versionSchemaDetectee: string | null;
}

export interface ImporteurFichier {
  /** Importe depuis un fichier choisi par l'utilisateur. */
  importer(source: File | Blob): Promise<ResultatImport>;
}
