/**
 * Adaptateur d'import depuis un fichier Excel (.xlsx) produit par ExcelExporteur.
 *
 * Validation stricte par ligne :
 *  - Nom non vide
 *  - Valeurs Fibonacci pour Valeur, Temps, Risque, Taille
 *  - Confiance et Décision dans les énumérations admises
 *  - Qualifications de sous-critères dans { Non qualifié, Faible, Moyen, Fort }
 *
 * Tolère l'absence des feuilles "Éléments factuels" et "Sous-critères qualifiés"
 * (cas des imports d'Excel construits à la main, ou des exports v1).
 */

import ExcelJS from 'exceljs';
import type {
  ImporteurFichier,
  ResultatImport,
  ErreurImport,
} from '../../ports/ImporteurFichier.js';
import {
  Initiative,
  EchelleFibonacci,
  NiveauConfiance,
  DecisionPriorisation,
  QualificationSousCritere,
  FACTEURS_TAILLE,
  type FacteurTaille,
  type QualificationsParComposante,
} from '../../domain/index.js';

interface PreuvesBrutes {
  repere: string;
  resultat: string;
  pV: string;
  pT: string;
  pR: string;
  pTa: string;
  facteurs: string;
  arbitrage: string;
}

type CompositionQualif = Map<string, QualificationSousCritere>;
interface QualifsBrutes {
  valeur: CompositionQualif;
  temps: CompositionQualif;
  risque: CompositionQualif;
  taille: CompositionQualif;
}

export class ExcelImporteur implements ImporteurFichier {
  async importer(source: File | Blob): Promise<ResultatImport> {
    const buffer = await source.arrayBuffer();
    return this.depuisBuffer(buffer);
  }

  async depuisBuffer(buffer: ArrayBuffer): Promise<ResultatImport> {
    const erreurs: ErreurImport[] = [];
    const initiatives: Initiative[] = [];
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.load(buffer);
    } catch (e) {
      erreurs.push({ message: `Fichier Excel illisible : ${(e as Error).message}` });
      return { initiatives, erreurs, versionSchemaDetectee: null };
    }

    const versionSchema = this.lireVersionSchema(wb);
    const preuvesParId = this.lirePreuves(wb);
    const qualifsParId = this.lireQualifications(wb, erreurs);
    const wsInit = wb.getWorksheet('Initiatives');
    if (!wsInit) {
      erreurs.push({ message: 'Feuille "Initiatives" introuvable.' });
      return { initiatives, erreurs, versionSchemaDetectee: versionSchema };
    }

    wsInit.eachRow((row, numLigne) => {
      if (numLigne === 1) return;
      try {
        const init = this.lireLigne(row, preuvesParId, qualifsParId);
        initiatives.push(init);
      } catch (e) {
        erreurs.push({ ligne: numLigne, message: (e as Error).message });
      }
    });

    return { initiatives, erreurs, versionSchemaDetectee: versionSchema };
  }

  private lireVersionSchema(wb: ExcelJS.Workbook): string | null {
    const ws = wb.getWorksheet('Métadonnées');
    if (!ws) return null;
    let trouve: string | null = null;
    ws.eachRow((row) => {
      const cle = String(row.getCell(1).value ?? '').trim();
      if (cle === 'Version du schéma') {
        trouve = String(row.getCell(2).value ?? '').trim();
      }
    });
    return trouve;
  }

  private lirePreuves(wb: ExcelJS.Workbook): Map<string, PreuvesBrutes> {
    const map = new Map<string, PreuvesBrutes>();
    const ws = wb.getWorksheet('Éléments factuels');
    if (!ws) return map;
    ws.eachRow((row, num) => {
      if (num === 1) return;
      const id = String(row.getCell(1).value ?? '').trim();
      if (!id) return;
      map.set(id, {
        repere: String(row.getCell(3).value ?? ''),
        resultat: String(row.getCell(4).value ?? ''),
        pV: String(row.getCell(5).value ?? ''),
        pT: String(row.getCell(6).value ?? ''),
        pR: String(row.getCell(7).value ?? ''),
        pTa: String(row.getCell(8).value ?? ''),
        facteurs: String(row.getCell(9).value ?? ''),
        arbitrage: String(row.getCell(10).value ?? ''),
      });
    });
    return map;
  }

  private lireQualifications(
    wb: ExcelJS.Workbook,
    erreurs: ErreurImport[],
  ): Map<string, QualifsBrutes> {
    const map = new Map<string, QualifsBrutes>();
    const ws = wb.getWorksheet('Sous-critères qualifiés');
    if (!ws) return map;
    ws.eachRow((row, num) => {
      if (num === 1) return;
      const id = String(row.getCell(1).value ?? '').trim();
      const comp = String(row.getCell(3).value ?? '').trim().toLowerCase();
      const lettre = String(row.getCell(4).value ?? '').trim();
      const qual = String(row.getCell(5).value ?? '').trim();
      if (!id || !comp || !lettre || !qual) return;
      if (!QualificationSousCritere.estLibelleAdmis(qual)) {
        erreurs.push({
          ligne: num,
          champ: 'Sous-critère ' + comp + ' ' + lettre,
          message: 'Qualification inconnue : ' + qual,
        });
        return;
      }
      const exist = map.get(id) ?? {
        valeur: new Map(), temps: new Map(), risque: new Map(), taille: new Map(),
      };
      const cle = comp as keyof QualifsBrutes;
      if (cle === 'valeur' || cle === 'temps' || cle === 'risque' || cle === 'taille') {
        exist[cle].set(lettre, QualificationSousCritere.depuis(qual));
        map.set(id, exist);
      }
    });
    return map;
  }

  private lireLigne(
    row: ExcelJS.Row,
    preuvesParId: Map<string, PreuvesBrutes>,
    qualifsParId: Map<string, QualifsBrutes>,
  ): Initiative {
    const id = String(row.getCell(1).value ?? '').trim() || Initiative.genererId();
    const nom = String(row.getCell(2).value ?? '').trim();
    if (!nom) throw new Error('Nom vide');
    const domaine = String(row.getCell(3).value ?? '').trim();
    const valeur = lireFibonacci(row.getCell(4).value, 'Valeur');
    const temps = lireFibonacci(row.getCell(5).value, 'Temps');
    const risque = lireFibonacci(row.getCell(6).value, 'Risque');
    const taille = lireFibonacci(row.getCell(8).value, 'Taille');
    const confianceLib = String(row.getCell(11).value ?? 'Moyen').trim();
    const decisionLib = String(row.getCell(12).value ?? 'À arbitrer').trim();
    const dateBrut = String(row.getCell(13).value ?? '').trim();
    const dateCreation = dateBrut ? new Date(dateBrut) : new Date();

    const preuves = preuvesParId.get(id);
    const facteursListe = preuves
      ? preuves.facteurs.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const facteursValides = new Set<FacteurTaille>(
      facteursListe.filter((f): f is FacteurTaille =>
        (FACTEURS_TAILLE as readonly string[]).includes(f),
      ),
    );
    const qualifs: QualificationsParComposante = qualifsParId.get(id) ?? {
      valeur: new Map(), temps: new Map(), risque: new Map(), taille: new Map(),
    };

    return Initiative.creer({
      id, nom, domaine,
      elementRepere: preuves?.repere ?? '',
      resultatAttendu: preuves?.resultat ?? '',
      valeur, temps, risque, taille,
      preuves: {
        valeur: preuves?.pV ?? '',
        temps: preuves?.pT ?? '',
        risque: preuves?.pR ?? '',
        taille: preuves?.pTa ?? '',
      },
      facteursTaille: facteursValides,
      qualifications: qualifs,
      qualiteDecision: {
        confiance: NiveauConfiance.depuis(confianceLib),
        decision: DecisionPriorisation.depuis(decisionLib),
        arbitrage: preuves?.arbitrage ?? '',
      },
      dateCreation,
    });
  }
}

function lireFibonacci(
  brut: ExcelJS.CellValue,
  nomChamp: string,
): EchelleFibonacci | null {
  if (brut === null || brut === undefined || brut === '') return null;
  const n = typeof brut === 'number' ? brut : Number(brut);
  if (!Number.isFinite(n)) throw new Error(`${nomChamp} : valeur non numérique`);
  if (!EchelleFibonacci.estValeurAdmise(n)) {
    throw new Error(`${nomChamp} : valeur ${n} hors échelle Fibonacci`);
  }
  return EchelleFibonacci.depuis(n);
}
