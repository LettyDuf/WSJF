/**
 * Helpers typés pour la création d'éléments DOM.
 * Évite les répétitions et garantit la cohérence des attributs.
 */

type AttributsElement = Record<string, string | number | boolean | undefined>;

export function elt<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributs: AttributsElement = {},
  enfants: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [cle, valeur] of Object.entries(attributs)) {
    if (valeur === undefined || valeur === false) continue;
    if (cle === 'class' || cle === 'className') {
      e.className = String(valeur);
    } else if (valeur === true) {
      e.setAttribute(cle, '');
    } else {
      e.setAttribute(cle, String(valeur));
    }
  }
  for (const enf of enfants) {
    e.appendChild(typeof enf === 'string' ? document.createTextNode(enf) : enf);
  }
  return e;
}

export function vider(noeud: HTMLElement): void {
  while (noeud.firstChild) noeud.removeChild(noeud.firstChild);
}
