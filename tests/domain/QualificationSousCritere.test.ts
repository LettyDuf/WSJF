import { describe, it, expect } from 'vitest';
import { QualificationSousCritere } from '../../src/domain/valueObjects/QualificationSousCritere';

describe('QualificationSousCritere', () => {
  it.each(['Non qualifié', 'Faible', 'Moyen', 'Fort'])(
    'accepte la valeur "%s"',
    (v) => {
      expect(QualificationSousCritere.depuis(v).libelle()).toBe(v);
    },
  );

  it('rejette une valeur inconnue', () => {
    expect(() => QualificationSousCritere.depuis('Élevé')).toThrowError(/invalide/);
  });

  it('nonQualifie() est non qualifié', () => {
    const q = QualificationSousCritere.nonQualifie();
    expect(q.libelle()).toBe('Non qualifié');
    expect(q.estQualifie()).toBe(false);
  });

  it('estQualifie() retourne true pour Faible, Moyen, Fort', () => {
    expect(QualificationSousCritere.depuis('Faible').estQualifie()).toBe(true);
    expect(QualificationSousCritere.depuis('Moyen').estQualifie()).toBe(true);
    expect(QualificationSousCritere.depuis('Fort').estQualifie()).toBe(true);
  });

  it('égalité fonctionne', () => {
    const a = QualificationSousCritere.depuis('Moyen');
    const b = QualificationSousCritere.depuis('Moyen');
    expect(a.egal(b)).toBe(true);
    expect(a.egal(QualificationSousCritere.depuis('Fort'))).toBe(false);
  });
});
