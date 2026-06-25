import { describe, it, expect } from 'vitest';
import {
  SOUS_CRITERES_VALEUR,
  SOUS_CRITERES_TEMPS,
  SOUS_CRITERES_RISQUE,
  SOUS_CRITERES_TAILLE,
  SOUS_ELEMENTS_QUALITE_DECISION,
  catalogueDe,
} from '../../src/domain/constantes/CatalogueSousCriteres';

describe('CatalogueSousCriteres', () => {
  it('Valeur : 4 sous-critères', () => {
    expect(SOUS_CRITERES_VALEUR).toHaveLength(4);
    expect(SOUS_CRITERES_VALEUR.map((s) => s.lettre)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('Sensibilité au temps : 4 sous-critères', () => {
    expect(SOUS_CRITERES_TEMPS).toHaveLength(4);
    expect(SOUS_CRITERES_TEMPS.map((s) => s.lettre)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('Risque/Opportunité : 6 sous-critères', () => {
    expect(SOUS_CRITERES_RISQUE).toHaveLength(6);
    expect(SOUS_CRITERES_RISQUE.map((s) => s.lettre)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('Taille : 5 sous-critères', () => {
    expect(SOUS_CRITERES_TAILLE).toHaveLength(5);
    expect(SOUS_CRITERES_TAILLE.map((s) => s.lettre)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  it('Qualité de la décision : 3 sous-éléments (sans champ Responsable)', () => {
    expect(SOUS_ELEMENTS_QUALITE_DECISION).toHaveLength(3);
    expect(SOUS_ELEMENTS_QUALITE_DECISION.map((s) => s.lettre)).toEqual(['A', 'B', 'C']);
  });

  it("chaque sous-critère a au moins 3 exemples à discuter", () => {
    const tous = [
      ...SOUS_CRITERES_VALEUR,
      ...SOUS_CRITERES_TEMPS,
      ...SOUS_CRITERES_RISQUE,
      ...SOUS_CRITERES_TAILLE,
    ];
    tous.forEach((s) => {
      expect(s.exemples.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("catalogueDe renvoie le bon catalogue", () => {
    expect(catalogueDe('valeur')).toBe(SOUS_CRITERES_VALEUR);
    expect(catalogueDe('temps')).toBe(SOUS_CRITERES_TEMPS);
    expect(catalogueDe('risque')).toBe(SOUS_CRITERES_RISQUE);
    expect(catalogueDe('taille')).toBe(SOUS_CRITERES_TAILLE);
  });
});
