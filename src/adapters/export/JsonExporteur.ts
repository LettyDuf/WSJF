/**
 * Adaptateur d'export en format JSON.
 *
 * Format pivot de l'outil : préserve l'intégralité des données (round-trip parfait).
 * Structure : { versionSchema, dateExport, initiatives: DtoInitiative[] }.
 */

import type { Initiative } from '../../domain/index.js';
import type { ExporteurFichier } from '../../ports/ExporteurFichier.js';
import {
  VERSION_SCHEMA,
  type DtoFichierComplet,
} from '../persistence/DtoInitiative.js';
import { initiativeVersDto } from '../persistence/MapperInitiative.js';
import { declencherTelechargement } from './declencherTelechargement.js';

export class JsonExporteur implements ExporteurFichier {
  async exporter(
    initiatives: ReadonlyArray<Initiative>,
    nomFichierBase: string,
  ): Promise<void> {
    const texte = this.construireTexte(initiatives);
    const blob = new Blob([texte], {
      type: 'application/json;charset=utf-8',
    });
    declencherTelechargement(blob, nomFichierBase + '.json');
  }

  /** Pour test et inspection : produit la chaîne JSON sans déclencher de téléchargement. */
  construireTexte(initiatives: ReadonlyArray<Initiative>): string {
    const contenu: DtoFichierComplet = {
      versionSchema: VERSION_SCHEMA,
      dateExport: new Date().toISOString(),
      initiatives: initiatives.map(initiativeVersDto),
    };
    return JSON.stringify(contenu, null, 2);
  }
}
