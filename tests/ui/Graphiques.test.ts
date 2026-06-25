import { describe, it, expect } from 'vitest';
import { creerGrapheBulles } from '../../src/ui/components/GrapheBulles';
import { creerGrapheEmpile } from '../../src/ui/components/GrapheEmpile';
import { uneInitiative } from '../domain/helpers';

describe('GrapheBulles', () => {
  it('affiche un message si la liste est vide', () => {
    const g = creerGrapheBulles();
    g.mettreAJour([]);
    expect(g.element.textContent).toMatch(/Ajoute des initiatives/);
  });

  it('produit un cercle par initiative', () => {
    const g = creerGrapheBulles();
    g.mettreAJour([
      uneInitiative({ nom: 'A', valeur: 8, temps: 5, risque: 3, taille: 2 }),
      uneInitiative({ nom: 'B', valeur: 5, temps: 5, risque: 5, taille: 5 }),
      uneInitiative({ nom: 'C', valeur: 3, temps: 3, risque: 3, taille: 8 }),
    ]);
    const cercles = g.element.querySelectorAll('circle');
    expect(cercles).toHaveLength(3);
  });

  it('attache un <title> à chaque bulle pour le survol', () => {
    const g = creerGrapheBulles();
    g.mettreAJour([uneInitiative({ nom: 'Init A', valeur: 8, temps: 5, risque: 3, taille: 2 })]);
    const titre = g.element.querySelector('circle title');
    expect(titre?.textContent).toMatch(/Init A/);
  });

  it("décale les bulles superposées pour qu'elles restent visibles", () => {
    const g = creerGrapheBulles();
    // Deux initiatives identiques → mêmes coordonnées de base
    g.mettreAJour([
      uneInitiative({ nom: 'A', valeur: 5, temps: 5, risque: 5, taille: 5 }),
      uneInitiative({ nom: 'B', valeur: 5, temps: 5, risque: 5, taille: 5 }),
    ]);
    const cercles = Array.from(g.element.querySelectorAll('circle'));
    const cx0 = parseFloat(cercles[0]!.getAttribute('cx')!);
    const cx1 = parseFloat(cercles[1]!.getAttribute('cx')!);
    const cy0 = parseFloat(cercles[0]!.getAttribute("cy")!);
    const cy1 = parseFloat(cercles[1]!.getAttribute("cy")!);
    expect(cx0 !== cx1 || cy0 !== cy1).toBe(true);
  });

  it('redessine entièrement le SVG à chaque mise à jour', () => {
    const g = creerGrapheBulles();
    g.mettreAJour([uneInitiative({ nom: 'A' })]);
    g.mettreAJour([
      uneInitiative({ nom: 'X' }),
      uneInitiative({ nom: 'Y' }),
    ]);
    expect(g.element.querySelectorAll('circle')).toHaveLength(2);
  });
});

describe('GrapheEmpile', () => {
  it('affiche un message si la liste est vide', () => {
    const g = creerGrapheEmpile();
    g.mettreAJour([]);
    expect(g.element.textContent).toMatch(/Ajoute des initiatives/);
  });

  it('produit 3 segments par initiative (valeur, temps, risque)', () => {
    const g = creerGrapheEmpile();
    g.mettreAJour([
      uneInitiative({ nom: 'A', valeur: 8, temps: 5, risque: 3, taille: 2 }),
      uneInitiative({ nom: 'B', valeur: 5, temps: 5, risque: 5, taille: 5 }),
    ]);
    const rects = g.element.querySelectorAll('rect');
    expect(rects).toHaveLength(2 * 3);
  });

  it("attache un <title> à chaque segment pour identifier la composante", () => {
    const g = creerGrapheEmpile();
    g.mettreAJour([uneInitiative({ nom: 'A', valeur: 8, temps: 5, risque: 3, taille: 2 })]);
    const titres = g.element.querySelectorAll('rect title');
    expect(titres).toHaveLength(3);
    const textes = Array.from(titres).map((t) => t.textContent);
    expect(textes.some((t) => t?.startsWith('valeur'))).toBe(true);
    expect(textes.some((t) => t?.startsWith('temps'))).toBe(true);
    expect(textes.some((t) => t?.startsWith('risque'))).toBe(true);
  });

  it('trie les barres par note pondérée décroissante', () => {
    const g = creerGrapheEmpile();
    g.mettreAJour([
      uneInitiative({ nom: 'Faible', valeur: 1, temps: 1, risque: 1, taille: 13 }),
      uneInitiative({ nom: 'Haute', valeur: 13, temps: 8, risque: 5, taille: 2 }),
    ]);
    const textes = g.element.querySelectorAll('text');
    const noms = Array.from(textes)
      .map((t) => t.textContent ?? '')
      .filter((t) => t === 'Haute' || t === 'Faible');
    expect(noms[0]).toBe('Haute');
    expect(noms[1]).toBe('Faible');
  });
});
