/**
 * Graphique à barres horizontales empilées.
 * Pour chaque initiative : une barre composée des contributions
 * valeur + temps + risque au coût d'attente.
 */

import {
  CalculateurWsjf,
  type Initiative,
} from '../../domain/index.js';
import { svgElt, svgTexte, viderSvg } from '../helpers/svg.js';
import { PALETTE_COMPOSANTES } from './couleursDecision.js';

const LARGEUR = 980;
const HAUTEUR_BASE = 200;
const PADDING = { left: 255, right: 70, top: 44, bottom: 54 };
const ROW_HEIGHT = 48;
const BAR_HEIGHT = 26;
const PAS_GRILLE = 10;
const COUT_MIN_AXE = 30;

export interface RetourGrapheEmpile {
  element: SVGElement;
  mettreAJour: (initiatives: ReadonlyArray<Initiative>) => void;
}

export function creerGrapheEmpile(): RetourGrapheEmpile {
  const calc = new CalculateurWsjf();
  const svg = svgElt('svg', {
    viewBox: '0 0 ' + LARGEUR + ' ' + HAUTEUR_BASE,
    role: 'img',
    'aria-label': "Composition du coût de l'attente par initiative",
  });

  function mettreAJour(initiatives: ReadonlyArray<Initiative>): void {
    viderSvg(svg);

    if (initiatives.length === 0) {
      svg.setAttribute('viewBox', '0 0 ' + LARGEUR + ' ' + HAUTEUR_BASE);
      svg.appendChild(svgTexte(
        { x: LARGEUR / 2, y: HAUTEUR_BASE / 2, 'text-anchor': 'middle', fill: '#536277', 'font-size': '12' },
        'Ajoute des initiatives au référentiel.',
      ));
      return;
    }

    const triees = [...initiatives].sort((a, b) => calc.calculer(b).noteBrute.valeur() - calc.calculer(a).noteBrute.valeur());
    const hauteur = PADDING.top + triees.length * ROW_HEIGHT + PADDING.bottom;
    svg.setAttribute('viewBox', '0 0 ' + LARGEUR + ' ' + hauteur);

    const coutMax = Math.max(
      COUT_MIN_AXE,
      ...triees.map((i) => calc.calculer(i).coutDuDelai),
    );

    for (let v = 0; v <= coutMax; v += PAS_GRILLE) {
      const x = PADDING.left + (v / coutMax) * (LARGEUR - PADDING.left - PADDING.right);
      svg.appendChild(svgElt('line', { x1: x, y1: PADDING.top - 8, x2: x, y2: hauteur - PADDING.bottom, stroke: '#e4eaf0', 'stroke-width': '1' }));
      if (v > 0) {
        svg.appendChild(svgTexte(
          { x, y: hauteur - PADDING.bottom + 22, 'text-anchor': 'middle', fill: '#536277', 'font-size': '12' },
          String(v),
        ));
      }
    }
    svg.appendChild(svgElt('line', {
      x1: PADDING.left, y1: hauteur - PADDING.bottom,
      x2: LARGEUR - PADDING.right, y2: hauteur - PADDING.bottom,
      stroke: '#8f9bab', 'stroke-width': '1.4',
    }));
    svg.appendChild(svgTexte(
      { x: (PADDING.left + LARGEUR - PADDING.right) / 2, y: hauteur - 14, 'text-anchor': 'middle', fill: '#536277', 'font-size': '12' },
      "Coût de l'attente total",
    ));

    triees.forEach((init, i) => {
      const y = PADDING.top + i * ROW_HEIGHT;
      const r = calc.calculer(init);
      const nomCourt = init.nom().length > 30 ? init.nom().slice(0, 30) + '…' : init.nom();
      svg.appendChild(svgTexte(
        { x: 18, y: y + 18, fill: '#102033', 'font-size': '12', 'font-weight': '900' },
        nomCourt,
      ));
      svg.appendChild(svgTexte(
        { x: 18, y: y + 34, fill: '#536277', 'font-size': '12' },
        init.qualiteDecision().decision.libelle() + ' · WSJF ' + r.noteBrute.formatFr(),
      ));

      let x0 = PADDING.left;
      const composantes: Array<['valeur' | 'temps' | 'risque', string]> = [
        ['valeur', PALETTE_COMPOSANTES.valeur],
        ['temps', PALETTE_COMPOSANTES.temps],
        ['risque', PALETTE_COMPOSANTES.risque],
      ];
      composantes.forEach(([k, c]) => {
        const valeur = r[k];
        const largeur = (valeur / coutMax) * (LARGEUR - PADDING.left - PADDING.right);
        const rect = svgElt('rect', {
          x: x0, y, width: largeur, height: BAR_HEIGHT, rx: '6', fill: c,
        });
        const titre = svgElt('title', {});
        titre.textContent = k + ' = ' + valeur;
        rect.appendChild(titre);
        svg.appendChild(rect);
        if (largeur > 26) {
          svg.appendChild(svgTexte(
            {
              x: x0 + largeur / 2, y: y + BAR_HEIGHT / 2,
              'text-anchor': 'middle', 'dominant-baseline': 'middle',
              fill: '#fff', 'font-size': '11', 'font-weight': '950',
            },
            String(valeur),
          ));
        }
        x0 += largeur;
      });
      svg.appendChild(svgTexte(
        { x: x0 + 8, y: y + 17, fill: '#536277', 'font-size': '12' },
        "Total " + r.coutDuDelai,
      ));
    });
  }

  return { element: svg, mettreAJour };
}
