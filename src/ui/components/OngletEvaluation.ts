/**
 * Onglet "Évaluer une initiative" (v2).
 * Orchestre les 4 blocs WSJF (avec sous-critères) + bloc Qualité de la décision (refondu) + panneau résultat.
 */

import {
  NiveauConfiance,
  DecisionPriorisation,
  NIVEAUX_CONFIANCE,
  DECISIONS_PRIORISATION,
  SOUS_ELEMENTS_QUALITE_DECISION,
} from '../../domain/index.js';
import { elt } from '../helpers/dom.js';
import type { StoreApplication } from '../state/StoreApplication.js';
import type { NotificateurUtilisateur } from '../../ports/NotificateurUtilisateur.js';
import type { PressePapier } from '../../ports/PressePapier.js';
import type { RepositoryInitiatives } from '../../ports/RepositoryInitiatives.js';
import { creerBlocComposante } from './BlocComposante.js';
import {
  CONFIG_VALEUR, CONFIG_TEMPS, CONFIG_RISQUE, CONFIG_TAILLE,
} from './configurationsBlocs.js';
import { creerPanneauResultat } from './PanneauResultat.js';
import { creerBandeauAccueil } from './BandeauAccueil.js';
import { brouillonExemple } from './exempleInitiative.js';
import { creerRadioPills } from './RadioPills.js';
import { afficherModaleInitiative } from './ModaleInitiative.js';
import { termeAvecAide } from './Glossaire.js';

export interface DepsOngletEvaluation {
  store: StoreApplication;
  repository: RepositoryInitiatives;
  notificateur: NotificateurUtilisateur;
  pressePapier: PressePapier;
}

export function creerOngletEvaluation(deps: DepsOngletEvaluation): HTMLElement {
  const { store, repository, notificateur, pressePapier } = deps;

  // -- identité --
  const champNom = elt('input', { id: 'nom', type: 'text', placeholder: "Ex. Authentification unifiée du domaine Client" }) as HTMLInputElement;
  const champDomaine = elt('input', { id: 'domaine', type: 'text', placeholder: "Ex. Paiement, architecture, opérations" }) as HTMLInputElement;
  const champRepere = elt('input', { id: 'repere', type: 'text', placeholder: "Ex. Initiative A déjà notée à 5, 3, 5 et 3" }) as HTMLInputElement;
  const champResultat = elt('textarea', { id: 'resultat', placeholder: "Décrire le changement attendu, la population concernée et l'indicateur qui montrera que le résultat est atteint." }) as HTMLTextAreaElement;
  champNom.addEventListener('input', () => store.modifierBrouillon({ nom: champNom.value }));
  champDomaine.addEventListener('input', () => store.modifierBrouillon({ domaine: champDomaine.value }));
  champRepere.addEventListener('input', () => store.modifierBrouillon({ elementRepere: champRepere.value }));
  champResultat.addEventListener('input', () => store.modifierBrouillon({ resultatAttendu: champResultat.value }));

  // -- 4 blocs --
  const blocValeur = creerBlocComposante(CONFIG_VALEUR, {
    surChangement: (v) => store.modifierBrouillon({ valeur: v }),
    surTexte: (t) => store.modifierBrouillon({ preuves: { ...store.obtenirEtat().brouillon.preuves, valeur: t } }),
    surQualification: (l, q) => store.modifierQualification('valeur', l, q),
  });
  const blocTemps = creerBlocComposante(CONFIG_TEMPS, {
    surChangement: (v) => store.modifierBrouillon({ temps: v }),
    surTexte: (t) => store.modifierBrouillon({ preuves: { ...store.obtenirEtat().brouillon.preuves, temps: t } }),
    surQualification: (l, q) => store.modifierQualification('temps', l, q),
  });
  const blocRisque = creerBlocComposante(CONFIG_RISQUE, {
    surChangement: (v) => store.modifierBrouillon({ risque: v }),
    surTexte: (t) => store.modifierBrouillon({ preuves: { ...store.obtenirEtat().brouillon.preuves, risque: t } }),
    surQualification: (l, q) => store.modifierQualification('risque', l, q),
  });
  const blocTaille = creerBlocComposante(CONFIG_TAILLE, {
    surChangement: (v) => store.modifierBrouillon({ taille: v }),
    surTexte: (t) => store.modifierBrouillon({ preuves: { ...store.obtenirEtat().brouillon.preuves, taille: t } }),
    surQualification: (l, q) => store.modifierQualification('taille', l, q),
  });

  // -- bloc 5 : Qualité de la décision (Hors calcul, 3 sous-éléments A/B/C) --
  const [scA, scB, scC] = SOUS_ELEMENTS_QUALITE_DECISION;
  const pillsConfiance = creerRadioPills(
    NIVEAUX_CONFIANCE, 'Moyen',
    (lib) => store.modifierBrouillon({ confiance: NiveauConfiance.depuis(lib) }),
    scA!.libelle,
  );

  const selectDecision = elt('select', { id: 'decision', 'aria-label': scB!.libelle }) as HTMLSelectElement;
  DECISIONS_PRIORISATION.forEach((d) => selectDecision.appendChild(elt('option', { value: d }, [d])));
  selectDecision.value = 'À arbitrer';
  selectDecision.addEventListener('change', () =>
    store.modifierBrouillon({ decision: DecisionPriorisation.depuis(selectDecision.value) }),
  );

  const champArbitrage = elt('textarea', {
    id: 'arbitrage',
    placeholder: "Décision retenue, compromis accepté, hypothèses restantes et condition qui ferait revoir l'ordre de priorité.",
  }) as HTMLTextAreaElement;
  champArbitrage.addEventListener('input', () => store.modifierBrouillon({ arbitrage: champArbitrage.value }));

  function carteSousElement(scLettre: string, scLibelle: string, scExemples: readonly string[], controle: HTMLElement): HTMLElement {
    const aide = elt('div', { class: 'sc-aide' });
    aide.style.display = 'none';
    aide.appendChild(elt('div', { class: 'sc-aide-titre' }, ['Exemples à discuter']));
    aide.appendChild(elt('ul', {}, scExemples.map((e) => elt('li', {}, [e]))));
    const btnAide = elt('button', {
      type: 'button', class: 'sc-bouton-aide',
      'aria-label': 'Afficher les exemples', 'aria-expanded': 'false',
    }, ['?']);
    btnAide.addEventListener('click', () => {
      const ouvert = aide.style.display !== 'none';
      aide.style.display = ouvert ? 'none' : 'block';
      btnAide.setAttribute('aria-expanded', String(!ouvert));
    });
    return elt('div', { class: 'qd-sous-element' }, [
      elt('div', { class: 'sc-entete' }, [
        elt('div', { class: 'sc-titre' }, [
          elt('span', { class: 'sc-lettre' }, [scLettre + '.']),
          ' ' + scLibelle,
        ]),
        btnAide,
      ]),
      controle, aide,
    ]);
  }

  const blocDecision = elt('section', { class: 'bloc bloc--rouge' }, [
    elt('div', { class: 'entete-bloc' }, [
      elt('div', {}, [
        elt('div', { class: 'titre-bloc' }, [
          elt('div', { class: 'numero' }, ['5']),
          elt('h2', {}, ['Qualité de la décision']),
        ]),
        elt('p', { class: 'aide' }, [
          "Ces informations ne modifient pas la note. Elles servent à qualifier la fiabilité de l'ordonnancement et à expliciter le choix retenu.",
        ]),
      ]),
      elt('div', { class: 'pastille' }, ['Hors calcul']),
    ]),
    elt('div', { class: 'qd-bloc-interne' }, [
      elt('div', { class: 'qd-titre' }, ["Décision et trace d'arbitrage"]),
      elt('p', { class: 'aide qd-amorce' }, [
        "Cette section ne recommande rien. Elle sert à conserver la décision, le niveau de confiance et le raisonnement qui permet de la réviser plus tard.",
      ]),
      elt('div', { class: 'qd-grille-deux' }, [
        carteSousElement(scA!.lettre, scA!.libelle, scA!.exemples, pillsConfiance.element),
        carteSousElement(scB!.lettre, scB!.libelle, scB!.exemples, selectDecision),
      ]),
      carteSousElement(scC!.lettre, scC!.libelle, scC!.exemples, champArbitrage),
    ]),
  ]);

  // -- actions --
  const btnAjouter = elt('button', { class: 'btn-principal', id: 'btnAjouter' }, ['Ajouter à la liste priorisée']);
  const btnReinit = elt('button', { class: 'btn-secondaire', id: 'btnReinit' }, ['Réinitialiser']);
  const btnExemple = elt('button', { class: 'btn-exemple', type: 'button', id: 'btnExemple' }, ['Charger un exemple']);
  btnExemple.addEventListener('click', () => {
    const ex = brouillonExemple();
    store.modifierBrouillon(ex);
    notificateur.notifier('info', 'Exemple chargé. Tu peux le modifier librement.');
  });

  btnAjouter.addEventListener('click', async () => {
    const init = store.validerEtAjouterBrouillon();
    if (!init) {
      notificateur.notifier('avertissement', "Compléter le nom et les quatre composantes avant d'ajouter.");
      return;
    }
    await repository.sauvegarder(store.obtenirEtat().initiatives);
    notificateur.notifier('succes', 'Initiative ajoutée et sauvegardée.');
  });
  btnReinit.addEventListener('click', () => {
    store.reinitialiserBrouillon();
    [champNom, champDomaine, champRepere].forEach((c) => (c.value = ''));
    champResultat.value = ''; champArbitrage.value = '';
    pillsConfiance.setSelection('Moyen'); selectDecision.value = 'À arbitrer';
    notificateur.notifier('info', 'Formulaire réinitialisé.');
  });

  // -- panneau résultat --
  const panneau = creerPanneauResultat();
  panneau.element.addEventListener('click', async (e) => {
    const cible = e.target as HTMLElement;
    if (cible.matches('button[data-action="retirer"]')) {
      const id = cible.getAttribute('data-id');
      if (!id) return;
      store.retirerInitiative(id);
      await repository.sauvegarder(store.obtenirEtat().initiatives);
      notificateur.notifier('info', 'Initiative retirée.');
    } else if (cible.matches('button[data-action="detail"]')) {
      const id = cible.getAttribute('data-id');
      const init = store.obtenirEtat().initiatives.find((x) => x.id() === id);
      if (!init) return;
      afficherModaleInitiative(init, {
        pressePapier, notificateur,
        surModification: (i) => {
          store.chargerBrouillonDepuisInitiative(i);
          notificateur.notifier('info', 'Initiative chargée dans le formulaire. Modifie et ré-ajoute.');
        },
      });
    }
  });

  // -- assemblage --
  const bandeauAccueil = creerBandeauAccueil();
  const formulaire = elt('section', { class: 'panneau' }, [
    elt('div', { class: 'surtitre' }, ["Priorisation par coût d'attente"]),
    elt('h1', {}, ['Comparer les initiatives sur une base commune']),
    elt('p', { class: 'aide' }, [
      "Cet outil aide à comparer plusieurs initiatives. La note sert à ordonner les éléments entre eux, à partir d'un repère commun.",
    ]),
    elt('div', { class: 'formule' }, [
      "Note WSJF = Coût d'attente / Taille du travail",
      elt('br', {}),
      "Coût d'attente = Valeur + Temps + Risque/opportunité",
    ]),
    elt('div', { class: 'grille-2' }, [
      elt('div', {}, [elt('label', { for: 'nom' }, ["Nom de l'initiative"]), champNom]),
      elt('div', {}, [elt('label', { for: 'domaine' }, ['Domaine ou équipe concernée']), champDomaine]),
    ]),
    elt('div', { class: 'grille-1' }, [
      elt('div', {}, [
        elt('label', { for: 'repere' }, [termeAvecAide('élément de repère'), ' pour comparer']),
        champRepere,
        elt('div', { class: 'petit' }, [
          "Utiliser un élément de repère limite les notes arbitraires et rend la comparaison plus stable.",
        ]),
      ]),
      elt('div', {}, [elt('label', { for: 'resultat' }, ['Résultat attendu']), champResultat]),
    ]),
    blocValeur.element, blocTemps.element, blocRisque.element, blocTaille.element,
    blocDecision,
    elt('div', { class: 'actions' }, [btnAjouter, btnReinit, btnExemple]),
  ]);

  const racine = elt('div', { class: 'application-conteneur' }, [
    bandeauAccueil,
    elt('main', { class: 'application' }, [formulaire, panneau.element]),
  ]);

  store.abonner((etat) => {
    const b = etat.brouillon;
    if (champNom.value !== b.nom) champNom.value = b.nom;
    if (champDomaine.value !== b.domaine) champDomaine.value = b.domaine;
    if (champRepere.value !== b.elementRepere) champRepere.value = b.elementRepere;
    if (champResultat.value !== b.resultatAttendu) champResultat.value = b.resultatAttendu;
    if (champArbitrage.value !== b.arbitrage) champArbitrage.value = b.arbitrage;
    pillsConfiance.setSelection(b.confiance.libelle());
    if (selectDecision.value !== b.decision.libelle()) selectDecision.value = b.decision.libelle();
    blocValeur.mettreAJour(b.valeur, b.preuves.valeur, b.qualifications.valeur);
    blocTemps.mettreAJour(b.temps, b.preuves.temps, b.qualifications.temps);
    blocRisque.mettreAJour(b.risque, b.preuves.risque, b.qualifications.risque);
    blocTaille.mettreAJour(b.taille, b.preuves.taille, b.qualifications.taille);
    panneau.mettreAJour(etat);
  });

  return racine;
}
