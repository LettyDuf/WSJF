import { describe, it, expect } from 'vitest';
import { CalculateurWsjf } from '../../src/domain/services/CalculateurWsjf';
import { uneInitiative } from './helpers';

describe('CalculateurWsjf', () => {
  const calc = new CalculateurWsjf();

  it('calcule la note brute pour une initiative complète', () => {
    const r = calc.calculer(
      uneInitiative({ valeur: 8, temps: 5, risque: 3, taille: 2, confiance: 'Élevé' }),
    );
    expect(r.complet).toBe(true);
    expect(r.coutDuDelai).toBe(16);
    expect(r.noteBrute.valeur()).toBe(8);
  });

  it('renvoie une note à zéro pour une initiative incomplète', () => {
    const r = calc.calculer(uneInitiative({ taille: null }));
    expect(r.complet).toBe(false);
    expect(r.noteBrute.valeur()).toBe(0);
    expect(r.notePonderee.valeur()).toBe(0);
  });

  it('pondère la note par le facteur de confiance', () => {
    const r = calc.calculer(
      uneInitiative({ valeur: 8, temps: 5, risque: 3, taille: 2, confiance: 'Faible' }),
    );
    // note brute = 16/2 = 8, facteur Faible = 0.6, note pondérée = 4.8
    expect(r.noteBrute.valeur()).toBe(8);
    expect(r.notePonderee.valeur()).toBeCloseTo(4.8, 5);
    expect(r.facteurConfiance).toBe(0.6);
  });

  it('ne pondère pas avec confiance Élevé', () => {
    const r = calc.calculer(
      uneInitiative({ valeur: 8, temps: 5, risque: 3, taille: 2, confiance: 'Élevé' }),
    );
    expect(r.noteBrute.valeur()).toBe(r.notePonderee.valeur());
  });

  it('atteint la note maximale théorique de 39 avec composantes max et taille min', () => {
    const r = calc.calculer(
      uneInitiative({ valeur: 13, temps: 13, risque: 13, taille: 1, confiance: 'Élevé' }),
    );
    expect(r.coutDuDelai).toBe(39);
    expect(r.noteBrute.valeur()).toBe(39);
  });
});
