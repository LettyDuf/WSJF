/**
 * Helpers de création d'éléments SVG.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

type AttributsSvg = Record<string, string | number | boolean | undefined>;

export function svgElt<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributs: AttributsSvg = {},
  enfants: (Node | string)[] = [],
): SVGElementTagNameMap[K] {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [cle, valeur] of Object.entries(attributs)) {
    if (valeur === undefined || valeur === false) continue;
    e.setAttribute(cle, String(valeur));
  }
  for (const enf of enfants) {
    e.appendChild(typeof enf === 'string' ? document.createTextNode(enf) : enf);
  }
  return e;
}

export function svgTexte(
  attributs: AttributsSvg,
  texte: string,
): SVGTextElement {
  const e = svgElt('text', attributs);
  e.textContent = texte;
  return e;
}

export function viderSvg(e: SVGElement): void {
  while (e.firstChild) e.removeChild(e.firstChild);
}
