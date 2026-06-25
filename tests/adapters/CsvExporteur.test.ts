import { describe, it, expect } from 'vitest';
import { CsvExporteur } from '../../src/adapters/export/CsvExporteur';
import { uneInitiative } from '../domain/helpers';

describe('CsvExporteur', () => {
  it('produit un CSV avec en-tête et lignes', () => {
    const exp = new CsvExporteur();
    const texte = exp.construireTexte([
      uneInitiative({ nom: 'Élément Test', valeur: 8, temps: 5, risque: 3, taille: 2 }),
    ]);
    expect(texte.charCodeAt(0)).toBe(0xfeff);
    const lignes = texte.slice(1).split('\r\n');
    expect(lignes[0]).toContain('"Nom"');
    expect(lignes[0]).toContain('"Note pondérée (indic.)"');
    expect(lignes[1]).toContain('"Élément Test"');
    expect(lignes[1]).toContain('"8"');
  });

  it('échappe correctement les guillemets', () => {
    const exp = new CsvExporteur();
    const texte = exp.construireTexte([uneInitiative({ nom: 'Avec "guillemets"' })]);
    expect(texte).toContain('"Avec ""guillemets"""');
  });
});
