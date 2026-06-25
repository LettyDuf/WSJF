import { describe, it, expect } from 'vitest';
import { NiveauConfiance } from '../../src/domain/valueObjects/NiveauConfiance';

describe('NiveauConfiance', () => {
  it('accepte les trois libellés valides', () => {
    expect(NiveauConfiance.depuis('Faible').libelle()).toBe('Faible');
    expect(NiveauConfiance.depuis('Moyen').libelle()).toBe('Moyen');
    expect(NiveauConfiance.depuis('Élevé').libelle()).toBe('Élevé');
  });

  it("rejette tout autre libellé avec un message d'erreur explicite", () => {
    expect(() => NiveauConfiance.depuis('eleve')).toThrowError(
      /Niveau de confiance invalide/,
    );
  });

  describe('facteur de pondération', () => {
    it('Élevé renvoie 1.0', () => {
      expect(NiveauConfiance.depuis('Élevé').facteurPonderation()).toBe(1.0);
    });

    it('Moyen renvoie 0.85', () => {
      expect(NiveauConfiance.depuis('Moyen').facteurPonderation()).toBe(0.85);
    });

    it('Faible renvoie 0.6', () => {
      expect(NiveauConfiance.depuis('Faible').facteurPonderation()).toBe(0.6);
    });
  });

  it('moyen() retourne un niveau Moyen par défaut', () => {
    expect(NiveauConfiance.moyen().libelle()).toBe('Moyen');
  });
});
