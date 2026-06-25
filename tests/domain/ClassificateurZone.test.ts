import { describe, it, expect } from 'vitest';
import { ClassificateurZone } from '../../src/domain/services/ClassificateurZone';
import { uneInitiative } from './helpers';

describe('ClassificateurZone', () => {
  const c = new ClassificateurZone();

  it('classe en "prioritaire" si coût ≥ 20 et taille ≤ 5', () => {
    // coût = 8+8+8 = 24, taille = 3
    const z = c.classifier(uneInitiative({ valeur: 8, temps: 8, risque: 8, taille: 3 }));
    expect(z).toBe('prioritaire');
  });

  it('classe en "decouper" si coût ≥ 20 et taille > 5', () => {
    // coût = 8+8+8 = 24, taille = 8
    const z = c.classifier(uneInitiative({ valeur: 8, temps: 8, risque: 8, taille: 8 }));
    expect(z).toBe('decouper');
  });

  it('classe en "gainRapide" si coût < 20 et taille ≤ 5', () => {
    // coût = 3+3+3 = 9, taille = 2
    const z = c.classifier(uneInitiative({ valeur: 3, temps: 3, risque: 3, taille: 2 }));
    expect(z).toBe('gainRapide');
  });

  it('classe en "aChallenger" si coût < 20 et taille > 5', () => {
    // coût = 3+3+3 = 9, taille = 13
    const z = c.classifier(uneInitiative({ valeur: 3, temps: 3, risque: 3, taille: 13 }));
    expect(z).toBe('aChallenger');
  });

  it('expose un libellé lisible pour chaque zone', () => {
    expect(c.libelleZone('prioritaire').titre).toBe('À discuter en premier');
    expect(c.libelleZone('decouper').titre).toBe('À découper ou cadrer');
    expect(c.libelleZone('gainRapide').titre).toBe('Gain rapide possible');
    expect(c.libelleZone('aChallenger').titre).toBe('À challenger ou attendre');
  });
});
