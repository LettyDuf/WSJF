/**
 * Bloc "Conseil d'arbitrage" : texte de discussion à ouvrir.
 * Aide la lecture du référentiel — n'arbitre pas à la place de l'équipe.
 */

import {
  CalculateurWsjf,
  ClassificateurZone,
  type Initiative,
} from '../../domain/index.js';
import { elt } from '../helpers/dom.js';

export interface RetourConseil {
  element: HTMLElement;
  mettreAJour: (initiatives: ReadonlyArray<Initiative>) => void;
}

export function creerConseilArbitrage(): RetourConseil {
  const calc = new CalculateurWsjf();
  const classif = new ClassificateurZone();
  const titre = elt('div', { class: 'conseil-titre', id: 'conseilTitre' }, [
    'Ajoute au moins deux initiatives.',
  ]);
  const texte = elt('p', { class: 'conseil-texte', id: 'conseilTexte' }, [
    'Le conseil devient utile quand plusieurs éléments sont évalués.',
  ]);

  const guide = elt('div', { class: 'conseil-carte conseil-guide' }, [
    elt('div', { class: 'conseil-titre' }, ["Comment lire le coût d'attente"]),
    elt('ul', {}, [
      elt('li', {}, [
        elt('b', {}, ['Élevé : ']),
        "attendre risque de faire perdre beaucoup de valeur ou laisse un risque ouvert.",
      ]),
      elt('li', {}, [
        elt('b', {}, ['Faible : ']),
        "attendre a peu d'effet visible à court terme.",
      ]),
      elt('li', {}, [
        "La limite visuelle à 20 est un repère, pas une vérité absolue.",
      ]),
    ]),
  ]);

  const element = elt('div', { class: 'conseil-grille' }, [
    elt('div', { class: 'conseil-carte conseil-principal' }, [titre, texte]),
    guide,
  ]);

  function mettreAJour(initiatives: ReadonlyArray<Initiative>): void {
    if (initiatives.length === 0) {
      titre.textContent = 'Ajoute au moins deux initiatives.';
      texte.textContent = 'Le conseil devient utile quand plusieurs éléments sont évalués.';
      return;
    }
    const trieParNote = [...initiatives].sort(
      (a, b) => calc.calculer(b).noteBrute.valeur() - calc.calculer(a).noteBrute.valeur(),
    );
    const trieParCout = [...initiatives].sort(
      (a, b) => calc.calculer(b).coutDuDelai - calc.calculer(a).coutDuDelai,
    );
    const tete = trieParNote[0]!;
    const piedNote = trieParCout[0]!;
    const r = calc.calculer(tete);
    const zone = classif.classifier(tete);

    const segments: string[] = [];
    segments.push(
      'Note WSJF ' + r.noteBrute.formatFr() +
      ", coût d'attente " + r.coutDuDelai +
      ', taille ' + r.taille + '.',
    );
    if (tete.qualiteDecision().confiance.libelle() === 'Faible') {
      segments.push("La confiance est faible — clarifier avant tout engagement.");
    } else if (zone === 'decouper') {
      segments.push("Le travail est gros — chercher un découpage avant l'engagement complet.");
    } else if (zone === 'prioritaire') {
      segments.push("Bon candidat pour ouvrir la discussion de priorité.");
    } else if (zone === 'gainRapide') {
      segments.push("Effort limité — peut être traité rapidement si la capacité existe.");
    } else {
      segments.push("Coût d'attente limité — challenger ou différer si la capacité est sous tension.");
    }
    if (piedNote.id() !== tete.id()) {
      segments.push(
        "À comparer avec " + piedNote.nom() +
        ", qui porte le coût d'attente le plus élevé (" +
        calc.calculer(piedNote).coutDuDelai + ").",
      );
    }
    titre.textContent = 'Discussion à ouvrir : ' + tete.nom();
    texte.textContent = segments.join(' ');
  }

  return { element, mettreAJour };
}
