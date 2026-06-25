/**
 * Port : export d'un fichier (Excel, JSON, CSV...).
 * Effet de bord côté navigateur : déclenche un téléchargement.
 */

import type { Initiative } from '../domain/index.js';

export interface ExporteurFichier {
  /**
   * Exporte les initiatives sous forme de fichier téléchargeable.
   * @param initiatives liste à exporter
   * @param nomFichierBase nom de fichier sans extension (l'adaptateur ajoute la sienne)
   */
  exporter(
    initiatives: ReadonlyArray<Initiative>,
    nomFichierBase: string,
  ): Promise<void>;
}
