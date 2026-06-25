/**
 * Adaptateur d'export Excel (.xlsx) basé sur ExcelJS.
 *
 * Structure du classeur (v2.0.0) :
 *  - Initiatives           : table principale
 *  - Éléments factuels     : preuves textuelles par initiative
 *  - Sous-critères qualifiés : qualifications A-F par composante
 *  - Métadonnées           : version, date d'export
 *  - Référence WSJF        : pédagogie de la formule
 */

import ExcelJS from 'exceljs';
import type { Initiative } from '../../domain/index.js';
import { CalculateurWsjf } from '../../domain/index.js';
import type { ExporteurFichier } from '../../ports/ExporteurFichier.js';
import {
  VERSION_SCHEMA,
} from '../persistence/DtoInitiative.js';
import { declencherTelechargement } from './declencherTelechargement.js';

export class ExcelExporteur implements ExporteurFichier {
  private calc = new CalculateurWsjf();

  async exporter(
    initiatives: ReadonlyArray<Initiative>,
    nomFichierBase: string,
  ): Promise<void> {
    const buffer = await this.construireBuffer(initiatives);
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    declencherTelechargement(blob, `${nomFichierBase}.xlsx`);
  }

  async construireBuffer(
    initiatives: ReadonlyArray<Initiative>,
  ): Promise<ArrayBuffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Outil WSJF';
    wb.created = new Date();

    this.feuilleInitiatives(wb, initiatives);
    this.feuillePreuves(wb, initiatives);
    this.feuilleSousCriteres(wb, initiatives);
    this.feuilleMetadonnees(wb);
    this.feuilleReference(wb);

    const buf = await wb.xlsx.writeBuffer();
    return buf as ArrayBuffer;
  }

  private feuilleInitiatives(
    wb: ExcelJS.Workbook,
    initiatives: ReadonlyArray<Initiative>,
  ): void {
    const ws = wb.addWorksheet('Initiatives');
    ws.columns = [
      { header: 'ID', key: 'id', width: 24 },
      { header: 'Nom', key: 'nom', width: 40 },
      { header: 'Domaine', key: 'domaine', width: 22 },
      { header: 'Valeur', key: 'valeur', width: 10 },
      { header: 'Temps', key: 'temps', width: 10 },
      { header: 'Risque', key: 'risque', width: 10 },
      { header: 'Coût du délai', key: 'cout', width: 14 },
      { header: 'Taille', key: 'taille', width: 10 },
      { header: 'Note WSJF', key: 'noteBrute', width: 12 },
      { header: 'Note pondérée (indic.)', key: 'notePonderee', width: 18 },
      { header: 'Confiance', key: 'confiance', width: 12 },
      { header: 'Décision', key: 'decision', width: 22 },
      { header: 'Date de création', key: 'dateCreation', width: 22 },
    ];
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E1D6' },
    };

    for (const init of initiatives) {
      const r = this.calc.calculer(init);
      const qd = init.qualiteDecision();
      ws.addRow({
        id: init.id(),
        nom: init.nom(),
        domaine: init.domaine(),
        valeur: r.valeur,
        temps: r.temps,
        risque: r.risque,
        cout: r.coutDuDelai,
        taille: r.taille,
        noteBrute: Number(r.noteBrute.valeur().toFixed(2)),
        notePonderee: Number(r.notePonderee.valeur().toFixed(2)),
        confiance: qd.confiance.libelle(),
        decision: qd.decision.libelle(),
        dateCreation: init.dateCreation().toISOString().slice(0, 10),
      });
    }
    ws.autoFilter = { from: 'A1', to: { row: 1, column: ws.columnCount } };
  }

  private feuillePreuves(
    wb: ExcelJS.Workbook,
    initiatives: ReadonlyArray<Initiative>,
  ): void {
    const ws = wb.addWorksheet('Éléments factuels');
    ws.columns = [
      { header: 'ID', key: 'id', width: 24 },
      { header: 'Nom', key: 'nom', width: 32 },
      { header: 'Élément de repère', key: 'repere', width: 32 },
      { header: 'Résultat attendu', key: 'resultat', width: 60 },
      { header: 'Notes sur la valeur', key: 'pV', width: 50 },
      { header: 'Notes sur le temps', key: 'pT', width: 50 },
      { header: 'Notes sur le risque', key: 'pR', width: 50 },
      { header: 'Notes sur la taille', key: 'pTa', width: 50 },
      { header: 'Facteurs de taille', key: 'facteurs', width: 40 },
      { header: 'Arbitrage', key: 'arbitrage', width: 60 },
    ];
    ws.getRow(1).font = { bold: true };
    for (const init of initiatives) {
      const p = init.preuves();
      ws.addRow({
        id: init.id(), nom: init.nom(),
        repere: init.elementRepere(),
        resultat: init.resultatAttendu(),
        pV: p.valeur, pT: p.temps, pR: p.risque, pTa: p.taille,
        facteurs: Array.from(init.facteursTaille()).join(', '),
        arbitrage: init.qualiteDecision().arbitrage,
      });
    }
  }

  private feuilleSousCriteres(
    wb: ExcelJS.Workbook,
    initiatives: ReadonlyArray<Initiative>,
  ): void {
    const ws = wb.addWorksheet('Sous-critères qualifiés');
    ws.columns = [
      { header: 'ID initiative', key: 'id', width: 24 },
      { header: 'Nom', key: 'nom', width: 32 },
      { header: 'Composante', key: 'comp', width: 14 },
      { header: 'Sous-critère', key: 'lettre', width: 14 },
      { header: 'Qualification', key: 'qual', width: 16 },
    ];
    ws.getRow(1).font = { bold: true };
    for (const init of initiatives) {
      const q = init.qualifications();
      const composantes = [
        ['Valeur', q.valeur],
        ['Temps', q.temps],
        ['Risque', q.risque],
        ['Taille', q.taille],
      ] as const;
      composantes.forEach(([nom, map]) => {
        for (const [lettre, qual] of map) {
          ws.addRow({
            id: init.id(), nom: init.nom(),
            comp: nom, lettre, qual: qual.libelle(),
          });
        }
      });
    }
  }

  private feuilleMetadonnees(wb: ExcelJS.Workbook): void {
    const ws = wb.addWorksheet('Métadonnées');
    ws.columns = [
      { header: 'Clé', key: 'cle', width: 30 },
      { header: 'Valeur', key: 'val', width: 60 },
    ];
    ws.getRow(1).font = { bold: true };
    ws.addRow({ cle: 'Version du schéma', val: VERSION_SCHEMA });
    ws.addRow({ cle: "Date d'export", val: new Date().toISOString() });
    ws.addRow({ cle: 'Outil', val: 'Outil de priorisation WSJF' });
  }

  private feuilleReference(wb: ExcelJS.Workbook): void {
    const ws = wb.addWorksheet('Référence WSJF');
    ws.columns = [{ header: 'Référence', key: 'ref', width: 100 }];
    ws.getRow(1).font = { bold: true };
    const lignes = [
      'Formule officielle : Note WSJF = Coût du délai / Taille du travail',
      "Coût du délai = Valeur métier + Sensibilité au temps + Réduction du risque ou activation d'opportunité",
      'Échelle Fibonacci modifiée : 1, 2, 3, 5, 8, 13',
      '',
      'Seuils de niveau de la note brute :',
      '  - Très élevée : ≥ 10',
      '  - Élevée      : ≥ 6',
      '  - Moyenne     : ≥ 3',
      '  - Faible      : < 3',
      '',
      'Note pondérée par la confiance (indicative, hors calcul officiel) :',
      '  - Confiance Élevé  : note × 1,0',
      '  - Confiance Moyen  : note × 0,85',
      '  - Confiance Faible : note × 0,6',
      "  Sert d'alerte visuelle, jamais d'arbitrage seul.",
      '',
      'Les sous-critères qualifiés (Faible / Moyen / Fort) structurent la discussion et documentent',
      "l'évaluation. Ils ne calculent pas la note Fibonacci finale, qui reste choisie en synthèse.",
      '',
      'La note WSJF sert à ordonner les initiatives entre elles. Elle ne décide pas seule.',
    ];
    for (const l of lignes) ws.addRow({ ref: l });
  }
}
