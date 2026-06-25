import { describe, it, expect } from 'vitest';
import { Initiative } from '../../src/domain/entities/Initiative';
import { uneInitiative } from './helpers';

describe('Initiative', () => {
  it('est complète quand les 4 composantes sont saisies', () => {
    const init = uneInitiative({ valeur: 5, temps: 5, risque: 5, taille: 5 });
    expect(init.estComplete()).toBe(true);
  });

  it("n'est pas complète si une composante manque", () => {
    const init = uneInitiative({ taille: null });
    expect(init.estComplete()).toBe(false);
  });

  it('calcule le coût du délai comme valeur + temps + risque', () => {
    const init = uneInitiative({ valeur: 8, temps: 5, risque: 3, taille: 5 });
    expect(init.coutDuDelai()).toBe(16);
  });

  it('porte des qualifications vides par défaut', () => {
    const init = uneInitiative();
    const q = init.qualifications();
    expect(q.valeur.size).toBe(0);
    expect(q.temps.size).toBe(0);
    expect(q.risque.size).toBe(0);
    expect(q.taille.size).toBe(0);
  });

  it('rejette un nom vide', () => {
    expect(() => uneInitiative({ nom: '   ' })).toThrowError(/nom/);
  });

  it('genererId produit des identifiants distincts', () => {
    const a = Initiative.genererId();
    const b = Initiative.genererId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^init-/);
  });
});
