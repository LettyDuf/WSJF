/**
 * Composant menu déroulant accessible.
 *
 * Usage :
 *   const menu = creerMenuDeroulant({
 *     libelleBouton: 'Exporter',
 *     classeBouton: 'btn-principal',
 *     options: [
 *       { libelle: 'Excel', description: 'recommandé', surClic: () => {...} },
 *       { libelle: 'JSON', surClic: () => {...} },
 *     ],
 *   });
 *
 * Accessibilité : role="menu" + role="menuitem", aria-expanded, navigation
 * clavier (Échap pour fermer, flèches pour naviguer, Entrée pour sélectionner).
 */

import { elt } from '../helpers/dom.js';

export interface OptionMenu {
  libelle: string;
  description?: string;
  surClic: () => void | Promise<void>;
}

export interface ConfigMenuDeroulant {
  libelleBouton: string;
  classeBouton?: string;
  ariaLabel?: string;
  options: readonly OptionMenu[];
}

export function creerMenuDeroulant(config: ConfigMenuDeroulant): HTMLElement {
  const bouton = elt('button', {
    type: 'button',
    class: (config.classeBouton ?? 'btn-secondaire') + ' menu-deroulant-bouton',
    'aria-haspopup': 'menu',
    'aria-expanded': 'false',
    'aria-label': config.ariaLabel ?? config.libelleBouton,
  }, [
    config.libelleBouton,
    elt('span', { class: 'menu-deroulant-fleche', 'aria-hidden': 'true' }, [' ▾']),
  ]);

  const optionsBoutons: HTMLElement[] = [];
  const liste = elt('div', {
    class: 'menu-deroulant-liste', role: 'menu',
    'aria-label': config.ariaLabel ?? config.libelleBouton,
  });
  liste.style.display = 'none';

  config.options.forEach((opt) => {
    const item = elt('button', {
      type: 'button', role: 'menuitem', class: 'menu-deroulant-item',
    }, [
      elt('span', { class: 'menu-deroulant-item-libelle' }, [opt.libelle]),
      opt.description
        ? elt('span', { class: 'menu-deroulant-item-desc' }, [opt.description])
        : elt('span', {}),
    ]);
    item.addEventListener('click', async () => {
      fermerMenu();
      await opt.surClic();
    });
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      const idx = optionsBoutons.indexOf(item);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        optionsBoutons[(idx + 1) % optionsBoutons.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        optionsBoutons[(idx - 1 + optionsBoutons.length) % optionsBoutons.length]?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        fermerMenu();
        bouton.focus();
      }
    });
    optionsBoutons.push(item);
    liste.appendChild(item);
  });

  function ouvrirMenu(): void {
    liste.style.display = 'block';
    bouton.setAttribute('aria-expanded', 'true');
    optionsBoutons[0]?.focus();
    setTimeout(() => document.addEventListener('click', fermerSiDehors, { once: true }), 0);
  }
  function fermerMenu(): void {
    liste.style.display = 'none';
    bouton.setAttribute('aria-expanded', 'false');
  }
  function fermerSiDehors(e: MouseEvent): void {
    if (!conteneur.contains(e.target as Node)) fermerMenu();
    else setTimeout(() => document.addEventListener('click', fermerSiDehors, { once: true }), 0);
  }
  bouton.addEventListener('click', () => {
    const ouvert = bouton.getAttribute('aria-expanded') === 'true';
    if (ouvert) fermerMenu();
    else ouvrirMenu();
  });
  bouton.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ouvrirMenu();
    }
  });

  const conteneur = elt('div', { class: 'menu-deroulant' }, [bouton, liste]);
  return conteneur;
}
