/**
 * Bandeau d'accueil pédagogique.
 *
 * Affiché en haut de l'onglet 1 au premier chargement.
 * 4 étapes courtes pour comprendre l'outil. Rétractable.
 * État (ouvert/fermé) persisté dans localStorage.
 */

import { elt } from '../helpers/dom.js';

const CLE_ETAT = 'wsjf:bandeau-accueil:replie';

export function creerBandeauAccueil(): HTMLElement {
  const etapes: Array<[string, string]> = [
    ['1', "Renseigne le nom de ton initiative et un élément de repère — une autre initiative déjà notée qui sert de référence pour comparer."],
    ['2', "Pour chaque composante (Valeur, Temps, Risque, Taille), qualifie les sous-critères en Faible / Moyen / Fort. Les couleurs aident la discussion."],
    ['3', "Choisis ensuite la note Fibonacci finale (1 à 13) qui synthétise ta conviction pour cette composante par rapport à ton repère."],
    ['4', "Quand tu as plusieurs initiatives, le bouton « Vue comparative » te montre l'ordre conseillé et les graphiques d'arbitrage."],
  ];

  const liste = elt('div', { class: 'accueil-etapes' },
    etapes.map(([n, t]) =>
      elt('div', { class: 'accueil-etape' }, [
        elt('div', { class: 'accueil-numero', 'aria-hidden': 'true' }, [n]),
        elt('div', { class: 'accueil-texte' }, [t]),
      ]),
    ),
  );

  const btnRetracter = elt('button', {
    type: 'button', class: 'accueil-bouton-retracter',
    'aria-label': 'Replier le bandeau',
  }, ['Replier']);

  const corps = elt('div', { class: 'accueil-corps' }, [liste]);

  const bandeau = elt('section', {
    class: 'accueil-bandeau', role: 'region',
    'aria-label': "Présentation rapide de l'outil",
  }, [
    elt('div', { class: 'accueil-entete' }, [
      elt('div', {}, [
        elt('div', { class: 'accueil-surtitre' }, ['Première fois ?']),
        elt('h2', { class: 'accueil-titre' }, ["Comment utiliser cet outil en 4 étapes"]),
      ]),
      btnRetracter,
    ]),
    corps,
  ]);

  function setReplie(replie: boolean): void {
    bandeau.classList.toggle('replie', replie);
    corps.style.display = replie ? 'none' : '';
    btnRetracter.textContent = replie ? 'Déplier' : 'Replier';
    btnRetracter.setAttribute('aria-expanded', replie ? 'false' : 'true');
    try { localStorage.setItem(CLE_ETAT, replie ? '1' : '0'); } catch { /* ignore */ }
  }

  btnRetracter.addEventListener('click', () => {
    setReplie(!bandeau.classList.contains('replie'));
  });

  // État initial : déplié au 1er chargement, replié sinon
  let replieInitial = false;
  try { replieInitial = localStorage.getItem(CLE_ETAT) === '1'; } catch { /* ignore */ }
  setReplie(replieInitial);

  return bandeau;
}
