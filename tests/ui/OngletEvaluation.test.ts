import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { StoreApplication } from '../../src/ui/state/StoreApplication';
import { creerOngletEvaluation } from '../../src/ui/components/OngletEvaluation';
import type { RepositoryInitiatives } from '../../src/ports/RepositoryInitiatives';
import type { NotificateurUtilisateur } from '../../src/ports/NotificateurUtilisateur';
import type { PressePapier } from '../../src/ports/PressePapier';

function deps() {
  const store = new StoreApplication();
  const repository: RepositoryInitiatives = {
    charger: vi.fn().mockResolvedValue([]),
    sauvegarder: vi.fn().mockResolvedValue(undefined),
    vider: vi.fn().mockResolvedValue(undefined),
  };
  const notificateur: NotificateurUtilisateur = { notifier: vi.fn() };
  const pressePapier: PressePapier = { ecrire: vi.fn().mockResolvedValue(true) };
  return { store, repository, notificateur, pressePapier };
}

describe('OngletEvaluation', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('rend les 4 blocs de composantes WSJF', () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    expect(document.querySelector('[data-clef="valeur"]')).not.toBeNull();
    expect(document.querySelector('[data-clef="temps"]')).not.toBeNull();
    expect(document.querySelector('[data-clef="risque"]')).not.toBeNull();
    expect(document.querySelector('[data-clef="taille"]')).not.toBeNull();
  });

  it("propose 6 cartes Fibonacci par bloc, accessibles au clavier", () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    const cartesValeur = document.querySelectorAll('[data-clef="valeur"] .carte-choix');
    expect(cartesValeur).toHaveLength(6);
    cartesValeur.forEach((c) => {
      expect(c.getAttribute('role')).toBe('radio');
      expect(c.hasAttribute('aria-checked')).toBe(true);
    });
  });

  it("la sélection d'une carte met à jour le brouillon et le panneau résultat", () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    const carte5 = document.querySelector('[data-clef="valeur"] .carte-choix[data-valeur="5"]') as HTMLElement;
    fireEvent.click(carte5);
    expect(d.store.obtenirEtat().brouillon.valeur?.valeur()).toBe(5);
    expect(carte5.classList.contains('selectionnee')).toBe(true);
    expect(carte5.getAttribute('aria-checked')).toBe('true');
  });

  it("Espace sur une carte la sélectionne (clavier)", () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    const carte8 = document.querySelector('[data-clef="temps"] .carte-choix[data-valeur="8"]') as HTMLElement;
    fireEvent.keyDown(carte8, { key: ' ' });
    expect(d.store.obtenirEtat().brouillon.temps?.valeur()).toBe(8);
  });

  it('La flèche droite déplace le focus à la carte suivante', () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    const cartes = document.querySelectorAll('[data-clef="risque"] .carte-choix');
    const premiere = cartes[0] as HTMLElement;
    premiere.focus();
    fireEvent.keyDown(premiere, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cartes[1]);
  });

  it("Ajouter sans composantes affiche un avertissement (toast) sans planter", async () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    const btn = document.getElementById('btnAjouter') as HTMLButtonElement;
    fireEvent.click(btn);
    expect(d.notificateur.notifier).toHaveBeenCalledWith(
      'avertissement', expect.stringContaining('Compléter'),
    );
    expect(d.store.obtenirEtat().initiatives).toHaveLength(0);
  });

  it('Flux complet : remplir nom + 4 cartes -> ajouter -> initiative créée et sauvegardée', async () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    const nom = document.getElementById('nom') as HTMLInputElement;
    nom.value = 'Cas Desjardins';
    fireEvent.input(nom);
    (document.querySelector('[data-clef="valeur"] .carte-choix[data-valeur="8"]') as HTMLElement).click();
    (document.querySelector('[data-clef="temps"] .carte-choix[data-valeur="5"]') as HTMLElement).click();
    (document.querySelector('[data-clef="risque"] .carte-choix[data-valeur="3"]') as HTMLElement).click();
    (document.querySelector('[data-clef="taille"] .carte-choix[data-valeur="2"]') as HTMLElement).click();
    fireEvent.click(document.getElementById('btnAjouter') as HTMLButtonElement);

    await Promise.resolve();
    await Promise.resolve();

    expect(d.store.obtenirEtat().initiatives).toHaveLength(1);
    expect(d.store.obtenirEtat().initiatives[0]?.nom()).toBe('Cas Desjardins');
    expect(d.repository.sauvegarder).toHaveBeenCalled();
    expect(d.notificateur.notifier).toHaveBeenCalledWith('succes', expect.stringContaining('ajoutée'));
  });

  it('Réinitialiser remet le formulaire à zéro et notifie', () => {
    const d = deps();
    document.body.appendChild(creerOngletEvaluation(d));
    const nom = document.getElementById('nom') as HTMLInputElement;
    nom.value = 'Brouillon en cours';
    fireEvent.input(nom);
    (document.querySelector('[data-clef="valeur"] .carte-choix[data-valeur="5"]') as HTMLElement).click();

    fireEvent.click(document.getElementById('btnReinit') as HTMLButtonElement);
    expect(d.store.obtenirEtat().brouillon.nom).toBe('');
    expect(d.store.obtenirEtat().brouillon.valeur).toBeNull();
    expect(d.notificateur.notifier).toHaveBeenCalledWith('info', expect.stringContaining('réinitialisé'));
  });
});
