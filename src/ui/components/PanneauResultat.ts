/**
 * Panneau Résultat — visualisation progressive de la formule WSJF.
 *
 * Au lieu d'afficher une note finale (ou rien), on montre l'équation WSJF
 * en train de se construire au fur et à mesure que l'utilisateur saisit
 * ses composantes Fibonacci.
 *
 *   Note WSJF = (Valeur + Temps + Risque) / Taille
 *
 * États :
 *   - aucune saisie : tous les emplacements sont des « ? » discrets
 *   - saisie partielle : les chiffres saisis remplacent les « ? »
 *   - saisie complète : on déroule en plus les étapes intermédiaires
 *     (somme du numérateur, puis résultat final)
 *
 * Aucune interprétation textuelle de la note. Aucune recommandation.
 * Note pondérée par la confiance affichée discrètement en dessous,
 * avec son facteur explicite (× 0,85 — Confiance Moyen).
 */

import { CalculateurWsjf } from '../../domain/index.js';
import { elt, vider } from '../helpers/dom.js';
import type { BrouillonInitiative, EtatApplication } from '../state/StoreApplication.js';

export interface RetourPanneau {
  element: HTMLElement;
  mettreAJour: (etat: EtatApplication) => void;
}

export function creerPanneauResultat(): RetourPanneau {
  const calc = new CalculateurWsjf();

  // -- Équation principale (3 lignes : libellés / chiffres / résultat) --
  const ligneLibelles = elt('div', { class: 'formule-ligne formule-ligne-libelles' }, [
    elt('span', { class: 'op' }, ['(']),
    elt('span', { class: 'composante composante-valeur' }, ['Valeur']),
    elt('span', { class: 'op' }, ['+']),
    elt('span', { class: 'composante composante-temps' }, ['Temps']),
    elt('span', { class: 'op' }, ['+']),
    elt('span', { class: 'composante composante-risque' }, ['Risque']),
    elt('span', { class: 'op' }, [')']),
    elt('span', { class: 'op op-division' }, ['/']),
    elt('span', { class: 'composante composante-taille' }, ['Taille']),
  ]);

  const slotValeur = elt('span', { class: 'slot slot-valeur', 'data-cle': 'valeur' }, ['?']);
  const slotTemps = elt('span', { class: 'slot slot-temps', 'data-cle': 'temps' }, ['?']);
  const slotRisque = elt('span', { class: 'slot slot-risque', 'data-cle': 'risque' }, ['?']);
  const slotTaille = elt('span', { class: 'slot slot-taille', 'data-cle': 'taille' }, ['?']);
  const ligneChiffres = elt('div', { class: 'formule-ligne formule-ligne-chiffres' }, [
    elt('span', { class: 'op' }, ['(']),
    slotValeur,
    elt('span', { class: 'op' }, ['+']),
    slotTemps,
    elt('span', { class: 'op' }, ['+']),
    slotRisque,
    elt('span', { class: 'op' }, [')']),
    elt('span', { class: 'op op-division' }, ['/']),
    slotTaille,
  ]);

  // Étapes intermédiaires (apparaissent uniquement quand complet)
  const etapeSomme = elt('div', { class: 'formule-etape', style: 'display: none;' });
  const etapeResultat = elt('div', { class: 'formule-etape formule-resultat', style: 'display: none;' });

  // Bloc équation
  const blocEquation = elt('div', { class: 'formule-equation' }, [
    elt('div', { class: 'formule-titre' }, ['Note WSJF =']),
    elt('div', { class: 'formule-corps' }, [
      ligneLibelles, ligneChiffres, etapeSomme, etapeResultat,
    ]),
  ]);

  // Note pondérée (apparaît quand complet, en dessous)
  const blocPonderee = elt('div', { class: 'note-ponderee-bloc', style: 'display: none;' });

  // Carte principale
  const carteResultat = elt('div', { class: 'carte-resultat' }, [
    blocEquation, blocPonderee,
  ]);

  // CTA Vue comparative (inchangé)
  const ctaComparaison = elt('button', {
    class: 'cta-comparaison', type: 'button',
    'data-action': 'aller-comparaison',
    'aria-label': 'Aller à la vue comparative',
  });
  const ctaTexte = elt('span', { class: 'cta-comparaison-label' }, ['Vue comparative']);
  const ctaCompteur = elt('span', { class: 'cta-comparaison-compteur' }, ['0']);
  const ctaFleche = elt('span', { class: 'cta-comparaison-fleche', 'aria-hidden': 'true' }, ['→']);
  ctaComparaison.appendChild(ctaTexte);
  ctaComparaison.appendChild(ctaCompteur);
  ctaComparaison.appendChild(ctaFleche);

  // Liste priorisée
  const tableCorps = elt('tbody', { id: 'corpsListe' });
  const tableListe = elt('table', { class: 'liste-table' }, [
    elt('thead', {}, [
      elt('tr', {}, [
        elt('th', {}, ['Élément']),
        elt('th', {}, ['Coût']),
        elt('th', {}, ['Note WSJF']),
        elt('th', { 'aria-label': 'Actions' }, ['']),
      ]),
    ]),
    tableCorps,
  ]);

  const element = elt('aside', { class: 'panneau panneau-resultat' }, [
    elt('div', { class: 'surtitre' }, ['Résultat']),
    elt('h2', {}, ['Note de priorité']),
    carteResultat,
    elt('h3', {}, ['Liste priorisée']),
    tableListe,
    ctaComparaison,
  ]);

  function setSlot(slot: HTMLElement, valeur: number | null): void {
    if (valeur === null) {
      slot.textContent = '?';
      slot.classList.remove('rempli');
    } else {
      slot.textContent = String(valeur);
      slot.classList.add('rempli');
    }
  }

  function mettreAJour(etat: EtatApplication): void {
    const b = etat.brouillon;
    const init = enInitiativeProvisoire(b);
    const r = calc.calculer(init);

    setSlot(slotValeur, b.valeur?.valeur() ?? null);
    setSlot(slotTemps, b.temps?.valeur() ?? null);
    setSlot(slotRisque, b.risque?.valeur() ?? null);
    setSlot(slotTaille, b.taille?.valeur() ?? null);

    if (r.complet) {
      // Étape somme (numérateur calculé)
      vider(etapeSomme);
      etapeSomme.style.display = '';
      etapeSomme.appendChild(elt('span', { class: 'op op-egal' }, ['=']));
      etapeSomme.appendChild(elt('span', { class: 'slot slot-somme rempli' }, [String(r.coutDuDelai)]));
      etapeSomme.appendChild(elt('span', { class: 'op op-division' }, ['/']));
      etapeSomme.appendChild(elt('span', { class: 'slot slot-taille rempli' }, [String(r.taille)]));
      etapeSomme.appendChild(elt('span', { class: 'mention-cout' }, ["(coût d'attente)"]));

      // Résultat final
      vider(etapeResultat);
      etapeResultat.style.display = '';
      etapeResultat.appendChild(elt('span', { class: 'op op-egal' }, ['=']));
      etapeResultat.appendChild(elt('span', { class: 'note-finale' }, [r.noteBrute.formatFr()]));

      // Note pondérée par confiance (si différente de la note brute)
      vider(blocPonderee);
      if (r.facteurConfiance !== 1) {
        blocPonderee.style.display = '';
        const facteurStr = r.facteurConfiance.toFixed(2).replace('.', ',');
        blocPonderee.appendChild(elt('div', { class: 'note-ponderee-titre' }, [
          'Note pondérée par la confiance',
        ]));
        blocPonderee.appendChild(elt('div', { class: 'note-ponderee-detail' }, [
          r.noteBrute.formatFr() + ' × ' + facteurStr + ' = ',
          elt('b', {}, [r.notePonderee.formatFr()]),
          ' (Confiance ' + b.confiance.libelle() + ')',
        ]));
      } else {
        blocPonderee.style.display = 'none';
      }
    } else {
      etapeSomme.style.display = 'none';
      etapeResultat.style.display = 'none';
      blocPonderee.style.display = 'none';
    }

    // Liste priorisée
    vider(tableCorps);
    const trie = [...etat.initiatives].sort((a, b2) =>
      calc.calculer(b2).noteBrute.valeur() - calc.calculer(a).noteBrute.valeur(),
    );
    trie.forEach((ii) => {
      const res = calc.calculer(ii);
      const tr = elt('tr', {}, [
        elt('td', {}, [ii.nom() || 'Sans titre']),
        elt('td', {}, [String(res.coutDuDelai)]),
        elt('td', {}, [res.noteBrute.formatFr()]),
        elt('td', { class: 'actions-cellule' }, [
          elt('button', {
            class: 'mini-btn mini-btn-detail', 'data-action': 'detail', 'data-id': ii.id(),
            'aria-label': 'Voir le détail de ' + ii.nom(),
          }, ['Détail']),
          elt('button', {
            class: 'mini-btn', 'data-action': 'retirer', 'data-id': ii.id(),
            'aria-label': 'Retirer ' + ii.nom(),
          }, ['Retirer']),
        ]),
      ]);
      tableCorps.appendChild(tr);
    });

    ctaCompteur.textContent = String(etat.initiatives.length);
  }

  function enInitiativeProvisoire(b: BrouillonInitiative): import('../../domain/index.js').Initiative {
    return {
      id: () => 'preview', nom: () => b.nom || 'aperçu', domaine: () => b.domaine,
      elementRepere: () => b.elementRepere, resultatAttendu: () => b.resultatAttendu,
      valeur: () => b.valeur, temps: () => b.temps, risque: () => b.risque, taille: () => b.taille,
      preuves: () => b.preuves, facteursTaille: () => b.facteursTaille,
      qualifications: () => b.qualifications,
      qualiteDecision: () => ({
        confiance: b.confiance, decision: b.decision, arbitrage: b.arbitrage,
      }),
      dateCreation: () => new Date(),
      estComplete: () => b.valeur !== null && b.temps !== null && b.risque !== null && b.taille !== null,
      coutDuDelai: () => (b.valeur?.valeur() ?? 0) + (b.temps?.valeur() ?? 0) + (b.risque?.valeur() ?? 0),
    } as unknown as import('../../domain/index.js').Initiative;
  }

  return { element, mettreAJour };
}
