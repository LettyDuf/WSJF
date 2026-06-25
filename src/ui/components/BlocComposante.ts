/**
 * Composant : bloc de saisie d'une composante WSJF (v2.1 — section rétractable).
 *
 * Structure :
 *  1. En-tête + sous-titre pédagogique
 *  2. Bloc "Critères de réflexion sur [composante]" RÉTRACTABLE
 *     - en-tête : titre + compteur (X/N qualifiés) + bouton +/−
 *     - corps : amorce + liste des sous-critères qualifiés
 *     - auto-repli quand X = N (tout qualifié)
 *  3. Cartes Fibonacci (note finale)
 *  4. Textarea "Notes utiles sur [composante]"
 */

import { EchelleFibonacci, catalogueDe } from '../../domain/index.js';
import type {
  ValeurFibonacci,
  ClefComposanteCatalogue,
  QualificationSousCritere,
} from '../../domain/index.js';
import { elt } from '../helpers/dom.js';
import { creerSousCritereQualifie } from './SousCritereQualifie.js';

export type ClefComposante = ClefComposanteCatalogue;

export interface ConfigBlocComposante {
  clef: ClefComposante;
  numero: number;
  titre: string;
  sousTitre: string;
  couleur: 'bleu' | 'orange' | 'vert' | 'violet';
  pastille: string;
  texteAmorceReflexion: string;
  descriptionsValeurs: Record<ValeurFibonacci, string>;
  preuveLibelle: string;
  preuvePlaceholder: string;
}

export interface RetourBloc {
  element: HTMLElement;
  mettreAJour: (
    selection: EchelleFibonacci | null,
    texteValeur: string,
    qualifs: ReadonlyMap<string, QualificationSousCritere>,
  ) => void;
}

export interface CallbacksBloc {
  surChangement: (valeur: EchelleFibonacci) => void;
  surTexte: (texte: string) => void;
  surQualification: (lettre: string, q: QualificationSousCritere) => void;
}

export function creerBlocComposante(
  config: ConfigBlocComposante,
  callbacks: CallbacksBloc,
): RetourBloc {
  const valeurs = EchelleFibonacci.valeursAdmises();
  const cartes: HTMLElement[] = [];

  // --- groupe Fibonacci ---
  const groupeFibo = elt('div', {
    class: 'choix',
    role: 'radiogroup',
    'aria-labelledby': 'titre-' + config.clef,
  });
  valeurs.forEach((v) => {
    const carte = elt('div', {
      class: 'carte-choix',
      role: 'radio', tabindex: '-1',
      'data-valeur': String(v),
      'aria-checked': 'false',
    }, [
      elt('span', { class: 'rond', 'aria-hidden': 'true' }),
      elt('div', {}, [
        elt('div', { class: 'titre-choix' }, [String(v)]),
        elt('div', { class: 'description-choix' }, [
          config.descriptionsValeurs[v] ?? '',
        ]),
      ]),
    ]);
    carte.addEventListener('click', () =>
      callbacks.surChangement(EchelleFibonacci.depuis(v)),
    );
    carte.addEventListener('keydown', (e: KeyboardEvent) => {
      const idx = cartes.indexOf(carte);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        callbacks.surChangement(EchelleFibonacci.depuis(v));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); cartes[(idx + 1) % cartes.length]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); cartes[(idx - 1 + cartes.length) % cartes.length]?.focus();
      }
    });
    cartes.push(carte);
    groupeFibo.appendChild(carte);
  });

  // --- sous-critères qualifiés ---
  const catalogue = catalogueDe(config.clef);
  const refsSC = catalogue.map((d) => {
    const sc = creerSousCritereQualifie(config.clef, d, (q) =>
      callbacks.surQualification(d.lettre, q),
    );
    return { lettre: d.lettre, sc };
  });
  const total = catalogue.length;
  const conteneurSC = elt('div', { class: 'sous-criteres' });
  refsSC.forEach(({ sc }) => conteneurSC.appendChild(sc.element));

  // --- section "Critères de réflexion" rétractable ---
  const idCorps = 'reflexion-corps-' + config.clef;
  const compteur = elt('span', { class: 'reflexion-compteur' }, ['0 / ' + total + ' qualifiés']);
  const btnRetracter = elt('button', {
    type: 'button',
    class: 'reflexion-bouton-retracter',
    'aria-controls': idCorps,
    'aria-expanded': 'true',
    'aria-label': 'Replier ou déplier les critères de réflexion',
  }, ['−']);
  const enteteReflexion = elt('div', { class: 'reflexion-entete' }, [
    elt('div', {}, [
      elt('div', { class: 'reflexion-titre' }, [
        'Critères de réflexion sur ' + libelleSection(config.clef),
      ]),
      compteur,
    ]),
    btnRetracter,
  ]);
  const corpsReflexion = elt('div', { class: 'reflexion-corps', id: idCorps }, [
    elt('p', { class: 'critere-reflexion-amorce' }, [config.texteAmorceReflexion]),
    conteneurSC,
  ]);
  const sectionReflexion = elt('div', { class: 'critere-reflexion' }, [
    enteteReflexion, corpsReflexion,
  ]);

  let utilisateurAReplie = false;
  let utilisateurADeplie = false;
  function setReplie(replie: boolean): void {
    sectionReflexion.classList.toggle('replie', replie);
    corpsReflexion.style.display = replie ? 'none' : '';
    btnRetracter.textContent = replie ? '+' : '−';
    btnRetracter.setAttribute('aria-expanded', replie ? 'false' : 'true');
  }
  btnRetracter.addEventListener('click', () => {
    const estReplie = sectionReflexion.classList.contains('replie');
    setReplie(!estReplie);
    if (estReplie) utilisateurADeplie = true;
    else utilisateurAReplie = true;
  });

  // --- textarea "Notes utiles" ---
  const textarea = elt('textarea', {
    id: 'preuve-' + config.clef,
    placeholder: config.preuvePlaceholder,
    'aria-label': config.preuveLibelle,
  });
  textarea.addEventListener('input', () => callbacks.surTexte(textarea.value));

  // --- assemblage ---
  const element = elt('section', {
    class: 'bloc bloc--' + config.couleur,
    'data-clef': config.clef,
  }, [
    elt('div', { class: 'entete-bloc' }, [
      elt('div', {}, [
        elt('div', { class: 'titre-bloc' }, [
          elt('div', { class: 'numero' }, [String(config.numero)]),
          elt('h2', { id: 'titre-' + config.clef }, [config.titre]),
        ]),
        elt('p', { class: 'aide' }, [config.sousTitre]),
      ]),
      elt('div', { class: 'pastille' }, [config.pastille]),
    ]),
    sectionReflexion,
    groupeFibo,
    elt('label', { for: 'preuve-' + config.clef }, [config.preuveLibelle]),
    textarea,
  ]);
  element.id = 'bloc-' + config.clef;

  function mettreAJour(
    selection: EchelleFibonacci | null,
    texteValeur: string,
    qualifs: ReadonlyMap<string, QualificationSousCritere>,
  ): void {
    cartes.forEach((c) => {
      const v = Number(c.getAttribute('data-valeur'));
      const choisie = selection?.valeur() === v;
      c.classList.toggle('selectionnee', choisie);
      c.setAttribute('aria-checked', choisie ? 'true' : 'false');
      c.setAttribute('tabindex', choisie ? '0' : '-1');
    });
    if (selection === null && cartes[0]) cartes[0].setAttribute('tabindex', '0');
    if (textarea.value !== texteValeur) textarea.value = texteValeur;

    refsSC.forEach(({ lettre, sc }) => {
      sc.mettreAJour(qualifs.get(lettre) ?? null);
    });

    // Compteur + auto-repli
    let nbQualif = 0;
    refsSC.forEach(({ lettre }) => {
      const q = qualifs.get(lettre);
      if (q && q.estQualifie()) nbQualif++;
    });
    if (nbQualif === total) {
      compteur.textContent = '✓ ' + total + ' / ' + total + ' qualifiés';
      compteur.classList.add('reflexion-compteur--complet');
      // Auto-repli si l'utilisateur n'a pas explicitement déplié
      if (!utilisateurADeplie) setReplie(true);
    } else {
      compteur.textContent = nbQualif + ' / ' + total + ' qualifiés';
      compteur.classList.remove('reflexion-compteur--complet');
      // Auto-déplier si l'utilisateur n'a pas explicitement replié
      if (!utilisateurAReplie) setReplie(false);
    }
  }

  return { element, mettreAJour };
}

function libelleSection(clef: ClefComposante): string {
  switch (clef) {
    case 'valeur': return 'la valeur';
    case 'temps': return 'la sensibilité au temps';
    case 'risque': return "le risque ou l'opportunité";
    case 'taille': return 'la taille du travail';
  }
}
