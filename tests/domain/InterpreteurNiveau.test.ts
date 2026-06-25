import { describe, it, expect } from 'vitest';
import { InterpreteurNiveau } from '../../src/domain/services/InterpreteurNiveau';
import { NoteWsjf } from '../../src/domain/valueObjects/NoteWsjf';

describe('InterpreteurNiveau', () => {
  const i = new InterpreteurNiveau();

  describe('niveau', () => {
    it('Très élevée à partir de 10', () => {
      expect(i.niveau(NoteWsjf.depuis(10))).toBe('Très élevée');
      expect(i.niveau(NoteWsjf.depuis(15))).toBe('Très élevée');
    });

    it('Élevée entre 6 (inclus) et 10 (exclu)', () => {
      expect(i.niveau(NoteWsjf.depuis(6))).toBe('Élevée');
      expect(i.niveau(NoteWsjf.depuis(9.99))).toBe('Élevée');
    });

    it('Moyenne entre 3 (inclus) et 6 (exclu)', () => {
      expect(i.niveau(NoteWsjf.depuis(3))).toBe('Moyenne');
      expect(i.niveau(NoteWsjf.depuis(5.99))).toBe('Moyenne');
    });

    it('Faible en dessous de 3', () => {
      expect(i.niveau(NoteWsjf.depuis(2.99))).toBe('Faible');
      expect(i.niveau(NoteWsjf.depuis(0))).toBe('Faible');
    });
  });

  describe('recommandation', () => {
    it('produit un texte différent pour chaque niveau', () => {
      const niveaux = [
        i.recommandation(NoteWsjf.depuis(15)),
        i.recommandation(NoteWsjf.depuis(7)),
        i.recommandation(NoteWsjf.depuis(4)),
        i.recommandation(NoteWsjf.depuis(1)),
      ];
      expect(new Set(niveaux).size).toBe(4);
    });
  });
});
