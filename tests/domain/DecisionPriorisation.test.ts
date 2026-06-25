import { describe, it, expect } from 'vitest';
import {
  DecisionPriorisation,
  DECISIONS_PRIORISATION,
} from '../../src/domain/valueObjects/DecisionPriorisation';

describe('DecisionPriorisation', () => {
  it.each(DECISIONS_PRIORISATION)('accepte le libellé "%s"', (lib) => {
    expect(DecisionPriorisation.depuis(lib).libelle()).toBe(lib);
  });

  it('rejette un libellé inconnu', () => {
    expect(() => DecisionPriorisation.depuis('À discuter')).toThrowError(
      /Décision invalide/,
    );
  });

  it('aArbitrer() retourne "À arbitrer" par défaut', () => {
    expect(DecisionPriorisation.aArbitrer().libelle()).toBe('À arbitrer');
  });
});
