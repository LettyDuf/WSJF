/**
 * Adaptateur d'import depuis un fichier JSON produit par JsonExporteur.
 *
 * Validation stricte : tout DTO invalide est rapporté dans `erreurs`
 * plutôt que silencieusement ignoré. L'appelant décide quoi en faire.
 */

import type {
  ImporteurFichier,
  ResultatImport,
  ErreurImport,
} from '../../ports/ImporteurFichier.js';
import type {
  DtoFichierComplet,
  DtoInitiative,
} from '../persistence/DtoInitiative.js';
import { dtoVersInitiative } from '../persistence/MapperInitiative.js';
import type { Initiative } from '../../domain/index.js';

export class JsonImporteur implements ImporteurFichier {
  async importer(source: File | Blob): Promise<ResultatImport> {
    const texte = await source.text();
    return this.depuisTexte(texte);
  }

  /** Méthode publique pour test : importe directement depuis une chaîne. */
  depuisTexte(texte: string): ResultatImport {
    const erreurs: ErreurImport[] = [];
    const initiatives: Initiative[] = [];

    let contenu: DtoFichierComplet;
    try {
      contenu = JSON.parse(texte) as DtoFichierComplet;
    } catch (e) {
      erreurs.push({ message: `JSON invalide : ${(e as Error).message}` });
      return { initiatives, erreurs, versionSchemaDetectee: null };
    }

    if (!contenu || !Array.isArray(contenu.initiatives)) {
      erreurs.push({
        message: 'Structure inattendue : champ "initiatives" absent ou non liste.',
      });
      return {
        initiatives,
        erreurs,
        versionSchemaDetectee: contenu?.versionSchema ?? null,
      };
    }

    contenu.initiatives.forEach((dto: DtoInitiative, index: number) => {
      try {
        initiatives.push(dtoVersInitiative(dto));
      } catch (e) {
        erreurs.push({
          ligne: index + 1,
          message: (e as Error).message,
        });
      }
    });

    return {
      initiatives,
      erreurs,
      versionSchemaDetectee: contenu.versionSchema ?? null,
    };
  }
}
