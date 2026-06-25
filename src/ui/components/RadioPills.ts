/**
 * Groupe de radio pills horizontal — équivalent design d'un select pour 2-4 options.
 *
 * Accessibilité : role="radiogroup", role="radio" + aria-checked sur chaque bouton.
 * Navigation clavier : flèches gauche/droite, Espace/Entrée pour sélectionner.
 */

import { elt } from '../helpers/dom.js';

export interface RetourPills {
  element: HTMLElement;
  setSelection: (libelle: string) => void;
}

export function creerRadioPills(
  options: readonly string[],
  libelleInitial: string,
  surChangement: (libelle: string) => void,
  ariaLabel: string,
): RetourPills {
  const groupe = elt('div', {
    class: 'pills',
    role: 'radiogroup',
    'aria-label': ariaLabel,
  });
  const boutons: HTMLElement[] = [];
  options.forEach((lib) => {
    const b = elt('button', {
      type: 'button',
      class: 'pills-bouton',
      role: 'radio',
      'aria-checked': lib === libelleInitial ? 'true' : 'false',
      tabindex: lib === libelleInitial ? '0' : '-1',
      'data-libelle': lib,
    }, [lib]);
    b.addEventListener('click', () => surChangement(lib));
    b.addEventListener('keydown', (e: KeyboardEvent) => {
      const idx = boutons.indexOf(b);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        surChangement(lib);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        boutons[(idx + 1) % boutons.length]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        boutons[(idx - 1 + boutons.length) % boutons.length]?.focus();
      }
    });
    boutons.push(b);
    groupe.appendChild(b);
  });

  function setSelection(libelle: string): void {
    boutons.forEach((b) => {
      const lib = b.getAttribute('data-libelle');
      const choisi = lib === libelle;
      b.classList.toggle('pills-bouton--selectionnee', choisi);
      b.setAttribute('aria-checked', choisi ? 'true' : 'false');
      b.setAttribute('tabindex', choisi ? '0' : '-1');
    });
  }

  return { element: groupe, setSelection };
}
