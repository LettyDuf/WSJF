/**
 * Composant table comparative.
 * Affiche une ligne par initiative avec les composantes, le coût, les notes,
 * la confiance et la décision. Tri par défaut sur la note pondérée.
 */

import {
  CalculateurWsjf,
  type Initiative,
} from '../../domain/index.js';
import { elt, vider } from '../helpers/dom.js';

export interface RetourTable {
  element: HTMLElement;
  mettreAJour: (initiatives: ReadonlyArray<Initiative>) => void;
}

export type CallbackRetrait = (id: string) => void;

const COLONNES = [
  'Rang', 'Initiative', 'Valeur', 'Temps', 'Risque', 'Coût',
  'Taille', 'Note brute', 'Note WSJF', 'Confiance', 'Décision', '',
] as const;

export function creerTableComparative(
  surRetrait: CallbackRetrait,
): RetourTable {
  const calc = new CalculateurWsjf();
  const corps = elt('tbody', { id: 'corpsComparatif' });

  const thead = elt('thead', {}, [
    elt('tr', {}, COLONNES.map((c) => elt('th', { scope: 'col' }, [c]))),
  ]);

  const table = elt('table', { class: 'liste-table', 'aria-label': 'Initiatives comparées' }, [
    thead, corps,
  ]);

  table.addEventListener('click', (e) => {
    const cible = e.target as HTMLElement;
    if (cible.matches('button[data-action="retirer-comp"]')) {
      const id = cible.getAttribute('data-id');
      if (id) surRetrait(id);
    }
  });

  function mettreAJour(initiatives: ReadonlyArray<Initiative>): void {
    vider(corps);
    if (initiatives.length === 0) {
      const tr = elt('tr', {}, [
        elt('td', { colspan: String(COLONNES.length), class: 'petit', style: 'text-align:center;' }, [
          'Aucune initiative dans le référentiel. Ajoute une initiative depuis le premier onglet ou importe un fichier.',
        ]),
      ]);
      corps.appendChild(tr);
      return;
    }
    const triees = [...initiatives].sort((a, b) =>
      calc.calculer(b).noteBrute.valeur() - calc.calculer(a).noteBrute.valeur(),
    );
    triees.forEach((init, rang) => {
      const r = calc.calculer(init);
      const qd = init.qualiteDecision();
      const btnDet = elt('button', {
        class: 'mini-btn mini-btn-detail', 'data-action': 'detail-comp', 'data-id': init.id(),
        'aria-label': 'Voir le détail de ' + init.nom(),
      }, ['Détail']);
      const btn = elt('button', {
        class: 'mini-btn', 'data-action': 'retirer-comp', 'data-id': init.id(),
        'aria-label': 'Retirer ' + init.nom(),
      }, ['Retirer']);
      const tr = elt('tr', {}, [
        elt('td', {}, [String(rang + 1)]),
        elt('td', {}, [init.nom()]),
        elt('td', {}, [String(r.valeur)]),
        elt('td', {}, [String(r.temps)]),
        elt('td', {}, [String(r.risque)]),
        elt('td', {}, [String(r.coutDuDelai)]),
        elt('td', {}, [String(r.taille)]),
        elt('td', {}, [r.noteBrute.formatFr()]),
        elt('td', {}, [r.noteBrute.formatFr()]),
        elt('td', {}, [qd.confiance.libelle()]),
        elt('td', {}, [qd.decision.libelle()]),
        elt('td', { class: 'actions-cellule' }, [btnDet, btn]),
      ]);
      corps.appendChild(tr);
    });
  }

  return { element: table, mettreAJour };
}
