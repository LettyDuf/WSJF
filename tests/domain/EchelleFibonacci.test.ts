import { describe, it, expect } from 'vitest';
import { EchelleFibonacci } from '../../src/domain/valueObjects/EchelleFibonacci';

describe('EchelleFibonacci', () => {
  describe('valeurs admises', () => {
    it.each([1, 2, 3, 5, 8, 13])('accepte la valeur %s', (v) => {
      expect(EchelleFibonacci.depuis(v).valeur()).toBe(v);
    });
  });

  describe('valeurs rejetées', () => {
    it.each([0, 4, 7, 11, -1, 21, 100])(
      'rejette la valeur hors échelle %s',
      (v) => {
        expect(() => EchelleFibonacci.depuis(v)).toThrowError(/Valeur Fibonacci invalide/);
      },
    );

    it('rejette NaN', () => {
      expect(() => EchelleFibonacci.depuis(Number.NaN)).toThrowError();
    });
  });

  describe('depuisOuNul', () => {
    it('retourne null pour null/undefined', () => {
      expect(EchelleFibonacci.depuisOuNul(null)).toBeNull();
      expect(EchelleFibonacci.depuisOuNul(undefined)).toBeNull();
    });

    it('retourne null pour une valeur hors échelle', () => {
      expect(EchelleFibonacci.depuisOuNul(7)).toBeNull();
    });

    it('retourne une instance pour une valeur admise', () => {
      expect(EchelleFibonacci.depuisOuNul(5)?.valeur()).toBe(5);
    });
  });

  describe('égalité', () => {
    it('deux instances avec la même valeur sont égales', () => {
      expect(EchelleFibonacci.depuis(8).egal(EchelleFibonacci.depuis(8))).toBe(true);
    });

    it('deux instances avec des valeurs différentes ne sont pas égales', () => {
      expect(EchelleFibonacci.depuis(8).egal(EchelleFibonacci.depuis(5))).toBe(false);
    });
  });
});
