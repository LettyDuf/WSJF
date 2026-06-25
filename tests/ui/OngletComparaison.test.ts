import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { StoreApplication } from '../../src/ui/state/StoreApplication';
import { creerOngletComparaison } from '../../src/ui/components/OngletComparaison';
import { uneInitiative } from '../domain/helpers';
import type { RepositoryInitiatives } from '../../src/ports/RepositoryInitiatives';
import type { NotificateurUtilisateur } from '../../src/ports/NotificateurUtilisateur';
import type { ExporteurFichier } from '../../src/ports/ExporteurFichier';
import type { ImporteurFichier } from '../../src/ports/ImporteurFichier';

function depsCompletes() {
  const store = new StoreApplication();
  const repository: RepositoryInitiatives = {
    charger: vi.fn().mockResolvedValue([]),
    sauvegarder: vi.fn().mockResolvedValue(undefined),
    vider: vi.fn().mockResolvedValue(undefined),
  };
  const notificateur: NotificateurUtilisateur = { notifier: vi.fn() };
  const exporteur = (): ExporteurFichier => ({ exporter: vi.fn().mockResolvedValue(undefined) });
  const importeur = (): ImporteurFichier => ({
    importer: vi.fn().mockResolvedValue({ initiatives: [], erreurs: [], versionSchemaDetectee: null }),
  });
  return {
    store,
    repository,
    notificateur,
    exporteurExcel: exporteur(),
    exporteurJson: exporteur(),
    exporteurCsv: exporteur(),
    importeurExcel: importeur(),
    importeurJson: importeur(),
  };
}

describe('OngletComparaison', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('affiche un message vide quand le référentiel est vide', () => {
    const d = depsCompletes();
    document.body.appendChild(creerOngletComparaison(d));
    expect(document.body.textContent).toMatch(/Aucune initiative/);
  });

  it('rend une ligne par initiative dans la table', () => {
    const d = depsCompletes();
    d.store.remplacerInitiatives([
      uneInitiative({ nom: 'A', valeur: 8, temps: 5, risque: 3, taille: 2 }),
      uneInitiative({ nom: 'B', valeur: 5, temps: 5, risque: 5, taille: 5 }),
    ]);
    document.body.appendChild(creerOngletComparaison(d));
    const lignes = document.querySelectorAll('#corpsComparatif tr');
    expect(lignes).toHaveLength(2);
  });

  it('trie les lignes par note pondérée décroissante', () => {
    const d = depsCompletes();
    d.store.remplacerInitiatives([
      uneInitiative({ nom: 'Petite valeur', valeur: 3, temps: 3, risque: 3, taille: 5 }), // note brute = 9/5 = 1.8
      uneInitiative({ nom: 'Grosse valeur', valeur: 13, temps: 8, risque: 5, taille: 2 }), // note brute = 26/2 = 13
    ]);
    document.body.appendChild(creerOngletComparaison(d));
    const premiereCellule = document.querySelectorAll('#corpsComparatif tr')[0]
      ?.querySelectorAll('td')[1];
    expect(premiereCellule?.textContent).toBe('Grosse valeur');
  });

  it('met à jour les KPIs', () => {
    const d = depsCompletes();
    d.store.remplacerInitiatives([
      uneInitiative({ nom: 'A', valeur: 8, temps: 5, risque: 3, taille: 2, decision: 'Découper' }),
      uneInitiative({ nom: 'B', valeur: 5, temps: 5, risque: 5, taille: 5, decision: 'Clarifier' }),
    ]);
    document.body.appendChild(creerOngletComparaison(d));
    expect(document.getElementById('kpiNb')?.textContent).toBe('2');
    expect(document.getElementById('kpiVigilance')?.textContent).toBe('2');
  });

  it('appelle exporteur Excel au clic dans le menu Exporter', async () => {
    const d = depsCompletes();
    d.store.remplacerInitiatives([uneInitiative()]);
    document.body.appendChild(creerOngletComparaison(d));
    const btnMenu = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.startsWith('Exporter'))!;
    fireEvent.click(btnMenu);
    const option = Array.from(document.querySelectorAll('button[role="menuitem"]')).find((b) => b.textContent?.includes('Excel'))!;
    fireEvent.click(option);
    await Promise.resolve();
    await Promise.resolve();
    expect(d.exporteurExcel.exporter).toHaveBeenCalled();
    expect(d.notificateur.notifier).toHaveBeenCalledWith('succes', expect.stringContaining('Excel'));
  });

  it("retire une initiative au clic sur le bouton Retirer", async () => {
    const d = depsCompletes();
    const init = uneInitiative({ nom: 'À retirer' });
    d.store.remplacerInitiatives([init]);
    document.body.appendChild(creerOngletComparaison(d));
    const btn = document.querySelector('button[data-action="retirer-comp"]') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    fireEvent.click(btn);
    await Promise.resolve();
    expect(d.store.obtenirEtat().initiatives).toHaveLength(0);
    expect(d.repository.sauvegarder).toHaveBeenCalled();
  });
});
