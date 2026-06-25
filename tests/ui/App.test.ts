import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { StoreApplication } from '../../src/ui/state/StoreApplication';
import { creerApp } from '../../src/ui/components/App';
import type { RepositoryInitiatives } from '../../src/ports/RepositoryInitiatives';
import type { NotificateurUtilisateur } from '../../src/ports/NotificateurUtilisateur';
import type { PressePapier } from '../../src/ports/PressePapier';
import type { ExporteurFichier } from '../../src/ports/ExporteurFichier';
import type { ImporteurFichier } from '../../src/ports/ImporteurFichier';

function deps() {
  const store = new StoreApplication();
  const repository: RepositoryInitiatives = {
    charger: vi.fn().mockResolvedValue([]),
    sauvegarder: vi.fn().mockResolvedValue(undefined),
    vider: vi.fn().mockResolvedValue(undefined),
  };
  const notificateur: NotificateurUtilisateur = { notifier: vi.fn() };
  const pressePapier: PressePapier = { ecrire: vi.fn().mockResolvedValue(true) };
  const exporteur = (): ExporteurFichier => ({ exporter: vi.fn().mockResolvedValue(undefined) });
  const importeur = (): ImporteurFichier => ({
    importer: vi.fn().mockResolvedValue({ initiatives: [], erreurs: [], versionSchemaDetectee: null }),
  });
  return {
    store, repository, notificateur, pressePapier,
    exporteurExcel: exporteur(), exporteurJson: exporteur(), exporteurCsv: exporteur(),
    importeurExcel: importeur(), importeurJson: importeur(),
  };
}

describe('App (navigation CTA contextuel)', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it("affiche par défaut l'onglet Évaluation et masque le panneau Comparaison", () => {
    const d = deps();
    document.body.appendChild(creerApp(d));
    expect(document.getElementById('panel-evaluation')?.style.display).toBe('');
    expect(document.getElementById('panel-comparaison')?.style.display).toBe('none');
  });

  it("affiche un CTA Vue comparative dans le panneau résultat", () => {
    const d = deps();
    document.body.appendChild(creerApp(d));
    const cta = document.querySelector('button[data-action="aller-comparaison"]');
    expect(cta).not.toBeNull();
    expect(cta?.textContent).toMatch(/Vue comparative/);
  });

  it("bascule sur la Vue comparative au clic sur le CTA", () => {
    const d = deps();
    document.body.appendChild(creerApp(d));
    const cta = document.querySelector('button[data-action="aller-comparaison"]') as HTMLButtonElement;
    fireEvent.click(cta);
    expect(document.getElementById('panel-evaluation')?.style.display).toBe('none');
    expect(document.getElementById('panel-comparaison')?.style.display).toBe('');
  });

  it("affiche un bouton Retour en haut de la Vue comparative", () => {
    const d = deps();
    document.body.appendChild(creerApp(d));
    d.store.changerOnglet('comparaison');
    const btnRetour = document.querySelector('.cta-retour');
    expect(btnRetour).not.toBeNull();
    expect(btnRetour?.textContent).toMatch(/Retour/);
  });

  it("revient à l'évaluation au clic sur le bouton Retour", () => {
    const d = deps();
    document.body.appendChild(creerApp(d));
    d.store.changerOnglet('comparaison');
    const btnRetour = document.querySelector('.cta-retour') as HTMLButtonElement;
    fireEvent.click(btnRetour);
    expect(document.getElementById('panel-evaluation')?.style.display).toBe('');
    expect(document.getElementById('panel-comparaison')?.style.display).toBe('none');
  });

  it("met à jour le compteur d'initiatives sur le CTA", async () => {
    const d = deps();
    document.body.appendChild(creerApp(d));
    const compteur = document.querySelector('.cta-comparaison-compteur') as HTMLElement;
    expect(compteur.textContent).toBe('0');
    d.store.remplacerInitiatives([
      // Initiative factice sans passer par le module — mais le store ne valide pas le contenu,
      // donc on mocke avec un objet conformant l'interface minimale du panneau.
      { id: () => 'i1', nom: () => 'A', domaine: () => '',
        elementRepere: () => '', resultatAttendu: () => '',
        valeur: () => null, temps: () => null, risque: () => null, taille: () => null,
        preuves: () => ({ valeur: '', temps: '', risque: '', taille: '' }),
        facteursTaille: () => new Set(),
        qualifications: () => ({ valeur: new Map(), temps: new Map(), risque: new Map(), taille: new Map() }),
        qualiteDecision: () => ({
          confiance: { libelle: () => 'Moyen', facteurPonderation: () => 0.85 } as never,
          decision: { libelle: () => 'À arbitrer' } as never,
          arbitrage: '',
        }),
        dateCreation: () => new Date(),
        estComplete: () => false,
        coutDuDelai: () => 0,
      } as never,
    ]);
    expect(compteur.textContent).toBe('1');
  });
});
