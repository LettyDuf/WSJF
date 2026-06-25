/**
 * Composant racine : deux panneaux (Évaluation / Comparaison) qui se basculent
 * via des CTA contextuels.
 *
 * Important : le scrollIntoView est appelé UNIQUEMENT au changement d'onglet,
 * jamais à chaque modification du store (sinon le clic sur une pill scrolle
 * involontairement la page en haut).
 */

import { elt } from '../helpers/dom.js';
import type { StoreApplication, IdentifiantOnglet } from '../state/StoreApplication.js';
import type { RepositoryInitiatives } from '../../ports/RepositoryInitiatives.js';
import type { NotificateurUtilisateur } from '../../ports/NotificateurUtilisateur.js';
import type { PressePapier } from '../../ports/PressePapier.js';
import type { ExporteurFichier } from '../../ports/ExporteurFichier.js';
import type { ImporteurFichier } from '../../ports/ImporteurFichier.js';
import { creerOngletEvaluation } from './OngletEvaluation.js';
import { creerOngletComparaison } from './OngletComparaison.js';

export interface DepsApp {
  store: StoreApplication;
  repository: RepositoryInitiatives;
  notificateur: NotificateurUtilisateur;
  pressePapier: PressePapier;
  exporteurExcel: ExporteurFichier;
  exporteurJson: ExporteurFichier;
  exporteurCsv: ExporteurFichier;
  importeurExcel: ImporteurFichier;
  importeurJson: ImporteurFichier;
}

export function creerApp(deps: DepsApp): HTMLElement {
  const panneauEval = creerOngletEvaluation(deps);
  panneauEval.id = 'panel-evaluation';

  const panneauComp = creerOngletComparaison(deps);
  panneauComp.id = 'panel-comparaison';

  const btnRetour = elt('button', {
    class: 'cta-retour', type: 'button',
    'aria-label': "Retour à l'évaluation",
  }, ['← Retour à l\'évaluation']);
  btnRetour.addEventListener('click', () => deps.store.changerOnglet('evaluation'));
  panneauComp.insertBefore(btnRetour, panneauComp.firstChild);

  panneauEval.addEventListener('click', (e) => {
    const cible = e.target as HTMLElement;
    if (cible.closest('[data-action="aller-comparaison"]')) {
      deps.store.changerOnglet('comparaison');
    }
  });

  panneauComp.style.display = 'none';

  // Mémoriser l'onglet précédent pour ne scroller qu'au changement réel.
  let ongletPrecedent: IdentifiantOnglet = deps.store.obtenirEtat().ongletActif;

  deps.store.abonner((etat) => {
    const evalActif = etat.ongletActif === 'evaluation';
    panneauEval.style.display = evalActif ? '' : 'none';
    panneauComp.style.display = evalActif ? 'none' : '';

    if (etat.ongletActif !== ongletPrecedent) {
      // Scroll uniquement au changement réel d'onglet.
      const cible = evalActif ? panneauEval : panneauComp;
      if (typeof cible.scrollIntoView === 'function') {
        cible.scrollIntoView({ behavior: 'auto' });
      }
      ongletPrecedent = etat.ongletActif;
    }
  });

  return elt('div', { class: 'app' }, [panneauEval, panneauComp]);
}
