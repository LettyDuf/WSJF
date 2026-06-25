/**
 * Composant : ligne d'un sous-critère qualifié.
 *
 * Structure :
 *  - Libellé sous forme de question + icône "?" pour l'aide
 *  - Pastille "Non qualifié" tant que aucune option ≠ "À qualifier" n'est choisie
 *  - Boutons radio pills : À qualifier / Faible / Moyen / Fort
 *  - Boîte "Exemples à discuter" avec liste à puces
 *
 * Accessibilité :
 *  - role="radiogroup" sur le conteneur de boutons
 *  - role="radio" + aria-checked sur chaque option
 *  - flèches gauche/droite naviguent dans le groupe
 *  - bouton aide aria-label, panneau replié au démarrage
 */

import { QualificationSousCritere, QUALIFICATIONS } from '../../domain/index.js';
import type { DescripteurSousCritere } from '../../domain/index.js';
import { elt } from '../helpers/dom.js';

export interface RetourSousCritere {
  element: HTMLElement;
  mettreAJour: (q: QualificationSousCritere | null) => void;
}

export function creerSousCritereQualifie(
  composanteClef: string,
  descripteur: DescripteurSousCritere,
  surChangement: (q: QualificationSousCritere) => void,
): RetourSousCritere {
  const idGroupe = 'sc-' + composanteClef + '-' + descripteur.lettre;
  const idTitre = idGroupe + '-titre';

  const titre = elt('div', {
    class: 'sc-titre',
    id: idTitre,
  }, [
    elt('span', { class: 'sc-lettre' }, [descripteur.lettre + '.']),
    ' ' + descripteur.libelle,
  ]);

  const aide = elt('div', { class: 'sc-aide', id: idGroupe + '-aide' });
  aide.style.display = 'none';
  aide.appendChild(
    elt('div', { class: 'sc-aide-titre' }, ['Exemples à discuter']),
  );
  aide.appendChild(
    elt('ul', {},
      descripteur.exemples.map((ex) => elt('li', {}, [ex])),
    ),
  );

  const btnAide = elt('button', {
    type: 'button',
    class: 'sc-bouton-aide',
    'aria-label': 'Afficher les exemples à discuter',
    'aria-expanded': 'false',
    'aria-controls': idGroupe + '-aide',
  }, ['?']);
  btnAide.addEventListener('click', () => {
    const ouvert = aide.style.display !== 'none';
    aide.style.display = ouvert ? 'none' : 'block';
    btnAide.setAttribute('aria-expanded', String(!ouvert));
  });
  const groupeOptions = elt('div', {
    class: 'sc-options',
    role: 'radiogroup',
    'aria-labelledby': idTitre,
  });
  const boutons: HTMLElement[] = [];
  QUALIFICATIONS.forEach((libelle) => {
    const bouton = elt('button', {
      type: 'button',
      class: 'sc-option sc-option--' + libelle.replace(/[éÉ ]/g, (c) =>
        c === ' ' ? '-' : c === 'é' ? 'e' : 'E').toLowerCase(),
      role: 'radio',
      'aria-checked': 'false',
      tabindex: '-1',
      'data-libelle': libelle,
    }, [libelle]);
    bouton.addEventListener('click', () => {
      surChangement(QualificationSousCritere.depuis(libelle));
    });
    bouton.addEventListener('keydown', (e: KeyboardEvent) => {
      const idx = boutons.indexOf(bouton);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        surChangement(QualificationSousCritere.depuis(libelle));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        boutons[(idx + 1) % boutons.length]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        boutons[(idx - 1 + boutons.length) % boutons.length]?.focus();
      }
    });
    boutons.push(bouton);
    groupeOptions.appendChild(bouton);
  });

  const enteteTitre = elt('div', { class: 'sc-entete' }, [titre, btnAide]);

  const element = elt('div', { class: 'sous-critere' }, [
    enteteTitre,
    groupeOptions,
    aide,
  ]);

  function mettreAJour(q: QualificationSousCritere | null): void {
    const libelleCourant = q?.libelle() ?? 'Non qualifié';
    let trouve = false;
    boutons.forEach((b) => {
      const lib = b.getAttribute('data-libelle')!;
      const choisi = lib === libelleCourant;
      b.classList.toggle('sc-option--selectionnee', choisi);
      b.setAttribute('aria-checked', choisi ? 'true' : 'false');
      b.setAttribute('tabindex', choisi ? '0' : '-1');
      if (choisi) trouve = true;
    });
    if (!trouve && boutons[0]) boutons[0].setAttribute('tabindex', '0');
  }

  mettreAJour(null);
  return { element, mettreAJour };
}
