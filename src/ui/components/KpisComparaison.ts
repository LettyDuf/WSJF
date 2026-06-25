/**
 * Cartes d'indicateurs synthétiques pour l'onglet comparatif.
 * Calculs simples sur l'ensemble des initiatives.
 */

import {
  CalculateurWsjf,
  type Initiative,
} from '../../domain/index.js';
import { elt } from '../helpers/dom.js';

export interface RetourKpis {
  element: HTMLElement;
  mettreAJour: (initiatives: ReadonlyArray<Initiative>) => void;
}

const DECISIONS_VIGILANCE = ['Clarifier', 'Découper'] as const;

export function creerKpisComparaison(): RetourKpis {
  const calc = new CalculateurWsjf();
  const vNb = elt('div', { class: 'kpi-valeur', id: 'kpiNb' }, ['0']);
  const vTop = elt('div', { class: 'kpi-valeur', id: 'kpiTop' }, ['—']);
  const vCout = elt('div', { class: 'kpi-valeur', id: 'kpiCout' }, ['—']);
  const vVigilance = elt('div', { class: 'kpi-valeur', id: 'kpiVigilance' }, ['—']);

  function carte(valeur: HTMLElement, libelle: string): HTMLElement {
    return elt('div', { class: 'kpi-carte' }, [
      valeur,
      elt('div', { class: 'kpi-libelle' }, [libelle]),
    ]);
  }

  const element = elt('div', { class: 'kpis' }, [
    carte(vNb, 'Initiatives comparées'),
    carte(vTop, 'Meilleure note WSJF'),
    carte(vCout, "Coût moyen de l'attente"),
    carte(vVigilance, 'À clarifier ou découper'),
  ]);

  function mettreAJour(initiatives: ReadonlyArray<Initiative>): void {
    const n = initiatives.length;
    vNb.textContent = String(n);
    if (n === 0) {
      vTop.textContent = '—';
      vCout.textContent = '—';
      vVigilance.textContent = '—';
      return;
    }
    const notes = initiatives.map((i) => calc.calculer(i).noteBrute.valeur());
    const couts = initiatives.map((i) => calc.calculer(i).coutDuDelai);
    vTop.textContent = Math.max(...notes).toFixed(2).replace('.', ',');
    vCout.textContent = (couts.reduce((a, b) => a + b, 0) / n).toFixed(1).replace('.', ',');
    const vigilance = initiatives.filter((i) =>
      (DECISIONS_VIGILANCE as readonly string[]).includes(i.qualiteDecision().decision.libelle()),
    ).length;
    vVigilance.textContent = String(vigilance);
  }

  return { element, mettreAJour };
}
