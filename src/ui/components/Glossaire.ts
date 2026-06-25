/**
 * Tooltips/glossaire — composant léger.
 */

import { elt } from '../helpers/dom.js';

const DEFINITIONS: Record<string, string> = {
  WSJF: "Weighted Shortest Job First — méthode de priorisation SAFe qui ordonne les initiatives selon le ratio coût d'attente / taille du travail.",
  Fibonacci: "Échelle 1, 2, 3, 5, 8, 13 utilisée pour des estimations relatives. Les écarts s'agrandissent volontairement pour éviter la fausse précision sur les grandes valeurs.",
  "élément de repère": "Une initiative déjà notée qui sert de référence pour comparer toutes les autres. Sans repère commun, les notes deviennent arbitraires.",
  "coût d'attente": "Ce que ça coûte de ne pas faire cette initiative tout de suite : valeur perdue, opportunités manquées, dépendances bloquées. Plus c'est élevé, plus le retarder coûte cher.",
  "note pondérée": "Note WSJF multipliée par un facteur de confiance (Élevé ×1, Moyen ×0,85, Faible ×0,6). Sert d'alerte indicative quand l'évaluation repose sur des hypothèses fragiles. Hors calcul officiel.",
};

export function termeAvecAide(terme: string, defOverride?: string): HTMLElement {
  const definition = defOverride ?? DEFINITIONS[terme] ?? '';
  const conteneur = elt('span', { class: 'terme-aide', tabindex: '0' });
  const visible = terme.length <= 6
    ? elt('abbr', { title: definition }, [terme])
    : elt('span', { title: definition }, [terme]);
  const bulle = elt('span', { class: 'terme-bulle', role: 'tooltip' }, [definition]);
  conteneur.appendChild(visible);
  conteneur.appendChild(bulle);
  return conteneur;
}

export const TERMES_GLOSSAIRE = DEFINITIONS;
