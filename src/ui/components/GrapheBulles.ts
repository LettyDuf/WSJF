/**
 * Graphique à bulles : axes Taille (X) vs Coût d'attente (Y).
 * Couleur = décision. Taille de la bulle = note pondérée.
 * Les zones de fond aident à lire (prioritaire / découper / gain rapide / attendre).
 *
 * Composant isolé : prend en entrée une liste d'initiatives, produit un SVG.
 */

import {
  CalculateurWsjf,
  ClassificateurZone,
  SEUILS_ZONE,
  type Initiative,
} from '../../domain/index.js';
import { svgElt, svgTexte, viderSvg } from '../helpers/svg.js';
import { couleurDecision } from './couleursDecision.js';

interface PointBulle {
  initiative: Initiative;
  index: number;
  baseX: number;
  baseY: number;
  dx: number;
  dy: number;
  rayon: number;
  couleur: string;
}

const LARGEUR = 860;
const HAUTEUR = 540;
const PADDING = { left: 86, right: 44, top: 46, bottom: 80 };
const MAX_TAILLE = 13;
const MAX_COUT = 30;

export interface RetourGrapheBulles {
  element: SVGElement;
  mettreAJour: (initiatives: ReadonlyArray<Initiative>) => void;
}

export function creerGrapheBulles(): RetourGrapheBulles {
  const calc = new CalculateurWsjf();
  const classif = new ClassificateurZone();

  const svg = svgElt('svg', {
    viewBox: '0 0 ' + LARGEUR + ' ' + HAUTEUR,
    role: 'img',
    'aria-label': "Graphique à bulles : coût de l'attente vs taille du travail",
  });

  function mettreAJour(initiatives: ReadonlyArray<Initiative>): void {
    viderSvg(svg);
    dessinerZones(svg);
    dessinerGrille(svg);
    dessinerAxes(svg);

    if (initiatives.length === 0) {
      svg.appendChild(svgTexte(
        { x: LARGEUR / 2, y: HAUTEUR / 2, 'text-anchor': 'middle', class: 'axis-text' },
        'Ajoute des initiatives au référentiel.',
      ));
      return;
    }

    const noteMax = Math.max(
      ...initiatives.map((i) => calc.calculer(i).noteBrute.valeur()),
      0.01,
    );

    let points: PointBulle[] = initiatives.map((init, index) => {
      const r = calc.calculer(init);
      return {
        initiative: init,
        index,
        baseX: PADDING.left + (Math.min(r.taille, MAX_TAILLE) / MAX_TAILLE) * (LARGEUR - PADDING.left - PADDING.right),
        baseY: HAUTEUR - PADDING.bottom - (Math.min(r.coutDuDelai, MAX_COUT) / MAX_COUT) * (HAUTEUR - PADDING.top - PADDING.bottom),
        dx: 0,
        dy: 0,
        rayon: 12 + (r.noteBrute.valeur() / noteMax) * 22,
        couleur: couleurDecision(init.qualiteDecision().decision.libelle()),
      };
    });
    points = appliquerClusterDecalage(points);

    points.forEach((p) => {
      const cx = p.baseX + p.dx;
      const cy = p.baseY + p.dy;
      const titre = svgElt('title', {});
      titre.textContent = p.initiative.nom() + ' — ' + classif.libelleZone(classif.classifier(p.initiative)).titre;
      const cercle = svgElt('circle', {
        cx, cy, r: p.rayon,
        fill: p.couleur, opacity: '0.9',
        stroke: '#263445', 'stroke-width': '1.2',
      });
      cercle.appendChild(titre);
      svg.appendChild(cercle);
      svg.appendChild(svgTexte(
        { x: cx, y: cy, class: 'bubble-text', 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#fff', 'font-weight': '950' },
        String(p.index + 1),
      ));
    });
  }

  return { element: svg, mettreAJour };
}

function dessinerZones(svg: SVGElement): void {
  const xSplit = PADDING.left + (SEUILS_ZONE.TAILLE_IMPORTANTE / MAX_TAILLE) * (LARGEUR - PADDING.left - PADDING.right);
  const ySplit = HAUTEUR - PADDING.bottom - (SEUILS_ZONE.COUT_ELEVE / MAX_COUT) * (HAUTEUR - PADDING.top - PADDING.bottom);
  const zones: Array<[string, number, number, number, number]> = [
    ['#fff3d6', PADDING.left, PADDING.top, xSplit - PADDING.left, ySplit - PADDING.top],
    ['#e8e2f3', xSplit, PADDING.top, LARGEUR - PADDING.right - xSplit, ySplit - PADDING.top],
    ['#e0f1e8', PADDING.left, ySplit, xSplit - PADDING.left, HAUTEUR - PADDING.bottom - ySplit],
    ['#ededed', xSplit, ySplit, LARGEUR - PADDING.right - xSplit, HAUTEUR - PADDING.bottom - ySplit],
  ];
  zones.forEach(([fill, x, y, w, h]) =>
    svg.appendChild(svgElt('rect', { fill, x, y, width: w, height: h }))
  );
  svg.appendChild(svgElt('line', {
    x1: xSplit, y1: PADDING.top, x2: xSplit, y2: HAUTEUR - PADDING.bottom,
    stroke: '#637083', 'stroke-width': '1.4', 'stroke-dasharray': '7 6',
  }));
  svg.appendChild(svgElt('line', {
    x1: PADDING.left, y1: ySplit, x2: LARGEUR - PADDING.right, y2: ySplit,
    stroke: '#637083', 'stroke-width': '1.4', 'stroke-dasharray': '7 6',
  }));
  // Centres des 4 quadrants (texte centré dedans, plus lisible).
  const cxGauche = (PADDING.left + xSplit) / 2;
  const cxDroite = (xSplit + LARGEUR - PADDING.right) / 2;
  const cyHaut = (PADDING.top + ySplit) / 2;
  const cyBas = (ySplit + HAUTEUR - PADDING.bottom) / 2;
  const baseAttrs = {
    fill: '#27384f', 'font-size': '13', 'font-weight': '900',
    'text-anchor': 'middle', 'dominant-baseline': 'middle',
  };
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxGauche, y: cyHaut }, 'Prioritaire'));
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxGauche, y: cyHaut + 16, 'font-size': '11', 'font-weight': '700', fill: '#536277' }, "attente coûte cher · effort limité"));
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxDroite, y: cyHaut }, 'À découper'));
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxDroite, y: cyHaut + 16, 'font-size': '11', 'font-weight': '700', fill: '#536277' }, "attente coûte cher · gros effort"));
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxGauche, y: cyBas }, 'Gain rapide'));
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxGauche, y: cyBas + 16, 'font-size': '11', 'font-weight': '700', fill: '#536277' }, "attente peu coûteuse · effort limité"));
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxDroite, y: cyBas }, 'À challenger'));
  svg.appendChild(svgTexte({ ...baseAttrs, x: cxDroite, y: cyBas + 16, 'font-size': '11', 'font-weight': '700', fill: '#536277' }, "attente peu coûteuse · gros effort"));
}

function dessinerGrille(svg: SVGElement): void {
  for (let i = 0; i <= 5; i++) {
    const y = PADDING.top + (i * (HAUTEUR - PADDING.top - PADDING.bottom)) / 5;
    svg.appendChild(svgElt('line', { x1: PADDING.left, y1: y, x2: LARGEUR - PADDING.right, y2: y, stroke: '#e4eaf0', 'stroke-width': '1' }));
    const x = PADDING.left + (i * (LARGEUR - PADDING.left - PADDING.right)) / 5;
    svg.appendChild(svgElt('line', { x1: x, y1: PADDING.top, x2: x, y2: HAUTEUR - PADDING.bottom, stroke: '#e4eaf0', 'stroke-width': '1' }));
  }
}

function dessinerAxes(svg: SVGElement): void {
  svg.appendChild(svgElt('line', { x1: PADDING.left, y1: HAUTEUR - PADDING.bottom, x2: LARGEUR - PADDING.right, y2: HAUTEUR - PADDING.bottom, stroke: '#8f9bab', 'stroke-width': '1.4' }));
  svg.appendChild(svgElt('line', { x1: PADDING.left, y1: PADDING.top, x2: PADDING.left, y2: HAUTEUR - PADDING.bottom, stroke: '#8f9bab', 'stroke-width': '1.4' }));
  svg.appendChild(svgTexte(
    { x: LARGEUR / 2, y: HAUTEUR - 20, 'text-anchor': 'middle', fill: '#536277', 'font-size': '12' },
    'Taille du travail relatif',
  ));
  svg.appendChild(svgTexte(
    { x: 22, y: HAUTEUR / 2, transform: 'rotate(-90 22 ' + (HAUTEUR / 2) + ')', fill: '#536277', 'font-size': '12' },
    "Coût de l'attente",
  ));
  [1, 3, 5, 8, 13].forEach((v) => {
    const x = PADDING.left + (v / MAX_TAILLE) * (LARGEUR - PADDING.left - PADDING.right);
    svg.appendChild(svgTexte(
      { x, y: HAUTEUR - PADDING.bottom + 24, 'text-anchor': 'middle', fill: '#536277', 'font-size': '12' },
      String(v),
    ));
  });
  [10, 20, 30].forEach((v) => {
    const y = HAUTEUR - PADDING.bottom - (v / MAX_COUT) * (HAUTEUR - PADDING.top - PADDING.bottom);
    svg.appendChild(svgTexte(
      { x: PADDING.left - 12, y: y + 4, 'text-anchor': 'end', fill: '#536277', 'font-size': '12' },
      String(v),
    ));
  });
}

/**
 * Décale légèrement les bulles qui partagent les mêmes coordonnées
 * pour qu'elles restent visibles. Algorithme : cercles autour d'un centre commun.
 */
function appliquerClusterDecalage(points: PointBulle[]): PointBulle[] {
  const groupes = new Map<string, number[]>();
  points.forEach((p, i) => {
    const clef = p.baseX.toFixed(1) + '|' + p.baseY.toFixed(1);
    const existant = groupes.get(clef) ?? [];
    existant.push(i);
    groupes.set(clef, existant);
  });
  groupes.forEach((indices) => {
    const n = indices.length;
    if (n === 1) return;
    indices.forEach((idx, j) => {
      const a = (2 * Math.PI * j) / n - Math.PI / 2;
      const p = points[idx]!;
      p.dx = Math.cos(a) * 18;
      p.dy = Math.sin(a) * 18;
    });
  });
  return points;
}
