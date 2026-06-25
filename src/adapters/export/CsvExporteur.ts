import type { Initiative } from '../../domain/index.js';
import type { ExporteurFichier } from '../../ports/ExporteurFichier.js';
import { CalculateurWsjf } from '../../domain/index.js';
import { declencherTelechargement } from './declencherTelechargement.js';

const ENTETES = [
  'Nom', 'Domaine', 'Valeur', 'Temps', 'Risque', 'Coût du délai', 'Taille',
  'Note WSJF', 'Note pondérée (indic.)', 'Confiance', 'Décision', 'Date de création',
] as const;

const BOM_UTF8 = '﻿';

export class CsvExporteur implements ExporteurFichier {
  private calc = new CalculateurWsjf();

  async exporter(initiatives: ReadonlyArray<Initiative>, nomFichierBase: string): Promise<void> {
    const texte = this.construireTexte(initiatives);
    const blob = new Blob([texte], { type: 'text/csv;charset=utf-8' });
    declencherTelechargement(blob, nomFichierBase + '.csv');
  }

  construireTexte(initiatives: ReadonlyArray<Initiative>): string {
    const lignes = [ENTETES, ...initiatives.map((i) => this.ligne(i))];
    const csv = lignes.map((l) => l.map(echapper).join(',')).join('\r\n');
    return BOM_UTF8 + csv;
  }

  private ligne(init: Initiative): readonly string[] {
    const r = this.calc.calculer(init);
    const qd = init.qualiteDecision();
    return [
      init.nom(), init.domaine(),
      String(r.valeur), String(r.temps), String(r.risque),
      String(r.coutDuDelai), String(r.taille),
      r.noteBrute.formatFr(), r.notePonderee.formatFr(),
      qd.confiance.libelle(), qd.decision.libelle(),
      init.dateCreation().toISOString(),
    ];
  }
}

function echapper(valeur: string): string {
  return '"' + String(valeur).replaceAll('"', '""') + '"';
}
