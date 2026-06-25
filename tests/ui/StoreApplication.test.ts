import { describe, it, expect, vi } from 'vitest';
import { StoreApplication, brouillonVide } from '../../src/ui/state/StoreApplication';
import { EchelleFibonacci, NiveauConfiance, DecisionPriorisation } from '../../src/domain';

describe('StoreApplication', () => {
  it('démarre avec un brouillon vide et aucune initiative', () => {
    const s = new StoreApplication();
    const e = s.obtenirEtat();
    expect(e.brouillon.nom).toBe('');
    expect(e.brouillon.valeur).toBeNull();
    expect(e.initiatives).toEqual([]);
    expect(e.ongletActif).toBe('evaluation');
  });

  it('notifie les abonnés à chaque modification', () => {
    const s = new StoreApplication();
    const obs = vi.fn();
    s.abonner(obs);
    obs.mockClear();
    s.modifierBrouillon({ nom: 'Test' });
    expect(obs).toHaveBeenCalledTimes(1);
    expect(obs).toHaveBeenCalledWith(expect.objectContaining({
      brouillon: expect.objectContaining({ nom: 'Test' }),
    }));
  });

  it("abonner() appelle immédiatement l'observateur avec l'état courant", () => {
    const s = new StoreApplication();
    const obs = vi.fn();
    s.abonner(obs);
    expect(obs).toHaveBeenCalledTimes(1);
  });

  it("la fonction renvoyée par abonner() désabonne", () => {
    const s = new StoreApplication();
    const obs = vi.fn();
    const desabonner = s.abonner(obs);
    obs.mockClear();
    desabonner();
    s.modifierBrouillon({ nom: 'X' });
    expect(obs).not.toHaveBeenCalled();
  });

  it('bascule un facteur de taille', () => {
    const s = new StoreApplication();
    s.basculerFacteurTaille('Plusieurs équipes');
    expect(s.obtenirEtat().brouillon.facteursTaille.has('Plusieurs équipes')).toBe(true);
    s.basculerFacteurTaille('Plusieurs équipes');
    expect(s.obtenirEtat().brouillon.facteursTaille.has('Plusieurs équipes')).toBe(false);
  });

  describe('validerEtAjouterBrouillon', () => {
    it('refuse un brouillon sans nom', () => {
      const s = new StoreApplication();
      s.modifierBrouillon({
        valeur: EchelleFibonacci.depuis(5),
        temps: EchelleFibonacci.depuis(5),
        risque: EchelleFibonacci.depuis(5),
        taille: EchelleFibonacci.depuis(5),
      });
      expect(s.validerEtAjouterBrouillon()).toBeNull();
    });

    it('refuse un brouillon incomplet sur les composantes', () => {
      const s = new StoreApplication();
      s.modifierBrouillon({ nom: 'X', valeur: EchelleFibonacci.depuis(5) });
      expect(s.validerEtAjouterBrouillon()).toBeNull();
    });

    it("ajoute l'initiative et réinitialise le brouillon quand tout est valide", () => {
      const s = new StoreApplication();
      s.modifierBrouillon({
        nom: 'Initiative X',
        valeur: EchelleFibonacci.depuis(8),
        temps: EchelleFibonacci.depuis(5),
        risque: EchelleFibonacci.depuis(3),
        taille: EchelleFibonacci.depuis(2),
        confiance: NiveauConfiance.depuis('Élevé'),
        decision: DecisionPriorisation.depuis('Traiter maintenant'),
      });
      const init = s.validerEtAjouterBrouillon();
      expect(init).not.toBeNull();
      expect(s.obtenirEtat().initiatives).toHaveLength(1);
      expect(s.obtenirEtat().brouillon.nom).toBe('');
      expect(init!.nom()).toBe('Initiative X');
      expect(init!.coutDuDelai()).toBe(16);
    });
  });

  it('retire une initiative par id', () => {
    const s = new StoreApplication();
    s.modifierBrouillon({
      nom: 'A',
      valeur: EchelleFibonacci.depuis(5),
      temps: EchelleFibonacci.depuis(5),
      risque: EchelleFibonacci.depuis(5),
      taille: EchelleFibonacci.depuis(5),
    });
    const init = s.validerEtAjouterBrouillon()!;
    s.retirerInitiative(init.id());
    expect(s.obtenirEtat().initiatives).toHaveLength(0);
  });

  it("brouillonVide() renvoie un brouillon avec confiance Moyen et décision À arbitrer", () => {
    const b = brouillonVide();
    expect(b.confiance.libelle()).toBe('Moyen');
    expect(b.decision.libelle()).toBe('À arbitrer');
  });
});
