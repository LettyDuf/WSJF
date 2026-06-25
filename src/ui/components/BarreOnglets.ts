/**
 * Barre d'onglets sticky avec gestion ARIA tablist/tab/tabpanel.
 */

import type { StoreApplication, IdentifiantOnglet } from '../state/StoreApplication.js';
import { elt } from '../helpers/dom.js';

export function creerBarreOnglets(store: StoreApplication): HTMLElement {
  const btnEval = elt('button', {
    class: 'tab-btn', role: 'tab', 'aria-selected': 'true', 'aria-controls': 'panel-evaluation',
    id: 'tab-evaluation', tabindex: '0',
  }, ['1. Évaluer une initiative']);
  const btnComp = elt('button', {
    class: 'tab-btn', role: 'tab', 'aria-selected': 'false', 'aria-controls': 'panel-comparaison',
    id: 'tab-comparaison', tabindex: '-1',
  }, ['2. Vue comparative']);

  function activer(o: IdentifiantOnglet): void {
    store.changerOnglet(o);
  }

  btnEval.addEventListener('click', () => activer('evaluation'));
  btnComp.addEventListener('click', () => activer('comparaison'));
  btnEval.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); btnComp.focus(); activer('comparaison'); }
  });
  btnComp.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); btnEval.focus(); activer('evaluation'); }
  });

  const barre = elt('nav', { class: 'tabs-sticky', role: 'tablist', 'aria-label': 'Onglets' }, [
    btnEval, btnComp,
  ]);

  store.abonner((etat) => {
    const evalActif = etat.ongletActif === 'evaluation';
    btnEval.classList.toggle('actif', evalActif);
    btnComp.classList.toggle('actif', !evalActif);
    btnEval.setAttribute('aria-selected', evalActif ? 'true' : 'false');
    btnComp.setAttribute('aria-selected', evalActif ? 'false' : 'true');
    btnEval.setAttribute('tabindex', evalActif ? '0' : '-1');
    btnComp.setAttribute('tabindex', evalActif ? '-1' : '0');
  });

  return barre;
}
