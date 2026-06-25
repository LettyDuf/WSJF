/**
 * Onglet "Vue comparative". Lit le même référentiel que l'onglet 1.
 * Fonctions :
 *  - Table comparative triée par note pondérée
 *  - KPIs synthétiques
 *  - Conseil d'arbitrage
 *  - Deux graphiques SVG : bulles + composition empilée
 *  - Import / Export Excel et JSON, Export CSV
 *  - Vider le référentiel
 */

import type { StoreApplication } from '../state/StoreApplication.js';
import type { NotificateurUtilisateur } from '../../ports/NotificateurUtilisateur.js';
import type { RepositoryInitiatives } from '../../ports/RepositoryInitiatives.js';
import type { ExporteurFichier } from '../../ports/ExporteurFichier.js';
import type { ImporteurFichier, ResultatImport } from '../../ports/ImporteurFichier.js';
import { elt } from '../helpers/dom.js';
import { creerTableComparative } from './TableComparative.js';
import { creerKpisComparaison } from './KpisComparaison.js';
import { creerConseilArbitrage } from './ConseilArbitrage.js';
import { creerGrapheBulles } from './GrapheBulles.js';
import { creerGrapheEmpile } from './GrapheEmpile.js';
import { afficherModaleInitiative } from './ModaleInitiative.js';
import { creerMenuDeroulant } from './MenuDeroulant.js';
import { couleurDecision, PALETTE_COMPOSANTES } from './couleursDecision.js';

export interface DepsOngletComparaison {
  store: StoreApplication;
  repository: RepositoryInitiatives;
  notificateur: NotificateurUtilisateur;
  exporteurExcel: ExporteurFichier;
  exporteurJson: ExporteurFichier;
  exporteurCsv: ExporteurFichier;
  importeurExcel: ImporteurFichier;
  importeurJson: ImporteurFichier;
}

const DECISIONS_LEGENDE = [
  'Traiter maintenant', 'Planifier', 'Découper',
  'Clarifier', 'Mettre en attente', 'À arbitrer',
] as const;

export function creerOngletComparaison(deps: DepsOngletComparaison): HTMLElement {
  const { store, repository, notificateur,
    exporteurExcel, exporteurJson, exporteurCsv,
    importeurExcel, importeurJson } = deps;

  const table = creerTableComparative(async (id) => {
    store.retirerInitiative(id);
    await repository.sauvegarder(store.obtenirEtat().initiatives);
    notificateur.notifier('info', 'Initiative retirée du référentiel.');
  });
  table.element.addEventListener('click', (e) => {
    const cible = e.target as HTMLElement;
    if (cible.matches('button[data-action="detail-comp"]')) {
      const id = cible.getAttribute('data-id');
      const init = store.obtenirEtat().initiatives.find((x) => x.id() === id);
      if (!init) return;
      afficherModaleInitiative(init, {
        pressePapier: { ecrire: async (t) => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try { await navigator.clipboard.writeText(t); return true; } catch { return false; }
          }
          return false;
        } },
        notificateur,
        surModification: (i) => {
          store.chargerBrouillonDepuisInitiative(i);
          notificateur.notifier('info', 'Initiative chargée dans le formulaire (onglet 1). Modifie et ré-ajoute.');
        },
      });
    }
  });
  const kpis = creerKpisComparaison();
  const conseil = creerConseilArbitrage();
  const bulles = creerGrapheBulles();
  const empile = creerGrapheEmpile();

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const nomFichierBase = (): string => 'wsjf-referentiel-' + aujourdhui;

  const menuExport = creerMenuDeroulant({
    libelleBouton: 'Exporter',
    classeBouton: 'btn-principal',
    options: [
      {
        libelle: 'Excel',
        description: 'pour SharePoint et comités (recommandé)',
        surClic: async () => {
          try {
            await exporteurExcel.exporter(store.obtenirEtat().initiatives, nomFichierBase());
            notificateur.notifier('succes', 'Export Excel téléchargé.');
          } catch (e) {
            notificateur.notifier('erreur', "Échec de l'export Excel : " + (e as Error).message);
          }
        },
      },
      {
        libelle: 'JSON',
        description: 'backup technique fidèle',
        surClic: async () => {
          await exporteurJson.exporter(store.obtenirEtat().initiatives, nomFichierBase());
          notificateur.notifier('succes', 'Export JSON téléchargé.');
        },
      },
      {
        libelle: 'CSV',
        description: 'analyse rapide tableur',
        surClic: async () => {
          await exporteurCsv.exporter(store.obtenirEtat().initiatives, nomFichierBase());
          notificateur.notifier('succes', 'Export CSV téléchargé.');
        },
      },
    ],
  });
  const inputImport = elt('input', {
    type: 'file', accept: '.xlsx,.json', id: 'inputImport', style: 'display:none',
  }) as HTMLInputElement;
  const btnImport = elt('button', { class: 'btn-secondaire' }, ['Importer Excel ou JSON']);
  const btnVider = elt('button', { class: 'btn-danger' }, ['Vider le référentiel']);

  btnImport.addEventListener('click', () => inputImport.click());
  inputImport.addEventListener('change', async () => {
    const fichier = inputImport.files?.[0];
    if (!fichier) return;
    try {
      const importeur = fichier.name.toLowerCase().endsWith('.json') ? importeurJson : importeurExcel;
      const r: ResultatImport = await importeur.importer(fichier);
      const remplace = window.confirm('Remplacer le référentiel actuel ? (Annuler = fusionner)');
      const liste = remplace ? r.initiatives : [...store.obtenirEtat().initiatives, ...r.initiatives];
      store.remplacerInitiatives(liste);
      await repository.sauvegarder(store.obtenirEtat().initiatives);
      if (r.erreurs.length === 0) {
        notificateur.notifier('succes', 'Import réussi : ' + r.initiatives.length + ' initiative(s).');
      } else {
        notificateur.notifier('avertissement',
          'Import partiel : ' + r.initiatives.length + ' acceptée(s), ' + r.erreurs.length + ' rejetée(s). Voir la console.');
        console.warn("Erreurs d'import :", r.erreurs);
      }
    } catch (e) {
      notificateur.notifier('erreur', "Échec de l'import : " + (e as Error).message);
    } finally {
      inputImport.value = '';
    }
  });
  btnVider.addEventListener('click', async () => {
    if (!window.confirm('Vider tout le référentiel ?')) return;
    store.viderInitiatives();
    await repository.vider();
    notificateur.notifier('info', 'Référentiel vidé.');
  });

  const legendeDecisions = elt('div', { class: 'legende' },
    DECISIONS_LEGENDE.map((d) =>
      elt('span', { class: 'legende-item' }, [
        elt('span', { class: 'puce', style: 'background:' + couleurDecision(d) }),
        ' ' + d,
      ]),
    ));

  const legendeComposantes = elt('div', { class: 'legende' }, [
    elt('span', { class: 'legende-item' }, [
      elt('span', { class: 'puce', style: 'background:' + PALETTE_COMPOSANTES.valeur }), ' Valeur',
    ]),
    elt('span', { class: 'legende-item' }, [
      elt('span', { class: 'puce', style: 'background:' + PALETTE_COMPOSANTES.temps }), ' Temps',
    ]),
    elt('span', { class: 'legende-item' }, [
      elt('span', { class: 'puce', style: 'background:' + PALETTE_COMPOSANTES.risque }), " Risque / opportunité",
    ]),
  ]);

  const racine = elt('main', { class: 'comparaison' }, [
    elt('section', { class: 'panneau' }, [
      elt('div', { class: 'surtitre' }, ['Vue comparative']),
      elt('h1', {}, ["Ordonner les initiatives sur un repère commun"]),
      elt('p', { class: 'aide' }, [
        "Cet onglet lit le même référentiel que l'onglet d'évaluation. Les notes sont triées par note pondérée par la confiance.",
      ]),
      elt('div', { class: 'actions' }, [
        menuExport, btnImport, inputImport, btnVider,
      ]),
      kpis.element,
      conseil.element,
      elt('div', { class: 'table-wrap' }, [table.element]),
    ]),
    elt('section', { class: 'panneau' }, [
      elt('h2', {}, ["Graphique à bulles — coût d'attente vs taille"]),
      elt('p', { class: 'aide' }, [
        "Plus une bulle est haute, plus attendre coûte. Plus elle est à droite, plus le travail est gros. Sa taille reflète la note pondérée.",
      ]),
      elt('div', { class: 'graphe-conteneur' }, [bulles.element]),
      legendeDecisions,
    ]),
    elt('section', { class: 'panneau' }, [
      elt('h2', {}, ["Composition du coût de l'attente"]),
      elt('p', { class: 'aide' }, [
        "Décompose pour chaque initiative la contribution de la valeur, du temps et du risque/opportunité.",
      ]),
      elt('div', { class: 'graphe-conteneur' }, [empile.element]),
      legendeComposantes,
    ]),
  ]);

  store.abonner((etat) => {
    table.mettreAJour(etat.initiatives);
    kpis.mettreAJour(etat.initiatives);
    conseil.mettreAJour(etat.initiatives);
    bulles.mettreAJour(etat.initiatives);
    empile.mettreAJour(etat.initiatives);
  });

  return racine;
}
