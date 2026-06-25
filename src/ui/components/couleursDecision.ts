/**
 * Palette de couleurs par type de décision, utilisée par les graphiques.
 * Centralisée pour cohérence visuelle entre bulles et empilé.
 */

import type { LibelleDecision } from '../../domain/index.js';

const PALETTE: Record<LibelleDecision, string> = {
  'Traiter maintenant': '#467f73',
  'Planifier': '#6c8fbf',
  'Découper': '#8e7cc3',
  'Clarifier': '#f6c177',
  'Mettre en attente': '#a7a7a7',
  'À arbitrer': '#d97d7d',
  'Écarter': '#7c7c7c',
};

export function couleurDecision(libelle: string): string {
  return PALETTE[libelle as LibelleDecision] ?? '#7c7c7c';
}

export const PALETTE_COMPOSANTES = {
  valeur: '#4f73a6',
  temps: '#a66a2f',
  risque: '#6d5cae',
} as const;
