import { describe, it, expect } from 'vitest';
import { ExcelExporteur } from '../../src/adapters/export/ExcelExporteur';
import { ExcelImporteur } from '../../src/adapters/import/ExcelImporteur';
import { uneInitiative } from '../domain/helpers';

describe('Excel export/import round-trip', () => {
  it('exporte puis réimporte les initiatives à l\'identique', async () => {
    const exp = new ExcelExporteur();
    const imp = new ExcelImporteur();
    const initiatives = [
      uneInitiative({ nom: 'Auth unifiée', valeur: 13, temps: 8, risque: 5, taille: 3, confiance: 'Élevé', decision: 'Traiter maintenant' }),
      uneInitiative({ nom: 'Migration paiement', valeur: 8, temps: 5, risque: 13, taille: 13, confiance: 'Faible', decision: 'Découper' }),
    ];
    const buffer = await exp.construireBuffer(initiatives);
    const r = await imp.depuisBuffer(buffer);

    expect(r.erreurs).toEqual([]);
    expect(r.versionSchemaDetectee).toBe('2.0.0');
    expect(r.initiatives).toHaveLength(2);

    const a = r.initiatives[0]!;
    expect(a.nom()).toBe('Auth unifiée');
    expect(a.valeur()?.valeur()).toBe(13);
    expect(a.qualiteDecision().confiance.libelle()).toBe('Élevé');
    expect(a.qualiteDecision().decision.libelle()).toBe('Traiter maintenant');

    const b = r.initiatives[1]!;
    expect(b.taille()?.valeur()).toBe(13);
    expect(b.qualiteDecision().confiance.libelle()).toBe('Faible');
  });

  it('rapporte une erreur pour une ligne avec Fibonacci invalide', async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Initiatives');
    ws.addRow(['ID','Nom','Domaine','Valeur','Temps','Risque','Coût','Taille','NoteB','NoteP','Confiance','Décision','Resp','Date']);
    ws.addRow(['id-1','OK','D',5,5,5,15,5,3,3,'Moyen','À arbitrer','','2026-06-13']);
    ws.addRow(['id-2','KO Fibonacci','D',7,5,5,17,5,3.4,3.4,'Moyen','À arbitrer','','2026-06-13']);
    const buf = await wb.xlsx.writeBuffer();

    const r = await new ExcelImporteur().depuisBuffer(buf as ArrayBuffer);
    expect(r.initiatives).toHaveLength(1);
    expect(r.initiatives[0]?.nom()).toBe('OK');
    expect(r.erreurs).toHaveLength(1);
    expect(r.erreurs[0]?.message).toMatch(/Fibonacci/);
    expect(r.erreurs[0]?.ligne).toBe(3);
  });

  it('rapporte une erreur quand la feuille Initiatives manque', async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('Autre');
    const buf = await wb.xlsx.writeBuffer();
    const r = await new ExcelImporteur().depuisBuffer(buf as ArrayBuffer);
    expect(r.initiatives).toHaveLength(0);
    expect(r.erreurs[0]?.message).toMatch(/Initiatives/);
  });

  it('rejette un fichier Excel illisible', async () => {
    const garbage = new TextEncoder().encode('pas un xlsx').buffer;
    const r = await new ExcelImporteur().depuisBuffer(garbage);
    expect(r.initiatives).toEqual([]);
    expect(r.erreurs[0]?.message).toMatch(/Excel illisible/);
  });
});
