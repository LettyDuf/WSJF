import { describe, it, expect } from 'vitest';
import { NoteWsjf } from '../../src/domain/valueObjects/NoteWsjf';

describe('NoteWsjf', () => {
  it('accepte une valeur positive', () => {
    expect(NoteWsjf.depuis(5.5).valeur()).toBe(5.5);
  });

  it('accepte zéro', () => {
    expect(NoteWsjf.zero().valeur()).toBe(0);
  });

  it('rejette une valeur négative', () => {
    expect(() => NoteWsjf.depuis(-1)).toThrowError(/négative/);
  });

  it('rejette une valeur non finie', () => {
    expect(() => NoteWsjf.depuis(Number.POSITIVE_INFINITY)).toThrowError(
      /non finie/,
    );
    expect(() => NoteWsjf.depuis(Number.NaN)).toThrowError(/non finie/);
  });

  describe('formatFr', () => {
    it('formate avec virgule et 2 décimales', () => {
      expect(NoteWsjf.depuis(7.3).formatFr()).toBe('7,30');
      expect(NoteWsjf.depuis(10).formatFr()).toBe('10,00');
      expect(NoteWsjf.depuis(0).formatFr()).toBe('0,00');
    });
  });

  describe('comparaison', () => {
    it('compare correctement deux notes', () => {
      const haute = NoteWsjf.depuis(10);
      const basse = NoteWsjf.depuis(5);
      expect(haute.estSuperieureA(basse)).toBe(true);
      expect(basse.estSuperieureA(haute)).toBe(false);
    });
  });
});
