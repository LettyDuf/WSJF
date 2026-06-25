/**
 * Store applicatif unique.
 * Centralise l'état (brouillon + référentiel + onglet actif).
 */

import {
  EchelleFibonacci,
  NiveauConfiance,
  DecisionPriorisation,
  QualificationSousCritere,
  Initiative,
  FACTEURS_TAILLE,
  type FacteurTaille,
  type PreuvesInitiative,
  type QualificationsParComposante,
} from '../../domain/index.js';
import type { ClefComposanteCatalogue } from '../../domain/index.js';

export type IdentifiantOnglet = 'evaluation' | 'comparaison';

export interface BrouillonInitiative {
  id: string;
  nom: string;
  domaine: string;
  elementRepere: string;
  resultatAttendu: string;
  valeur: EchelleFibonacci | null;
  temps: EchelleFibonacci | null;
  risque: EchelleFibonacci | null;
  taille: EchelleFibonacci | null;
  preuves: PreuvesInitiative;
  facteursTaille: ReadonlySet<FacteurTaille>;
  qualifications: QualificationsParComposante;
  confiance: NiveauConfiance;
  decision: DecisionPriorisation;
  arbitrage: string;
}

export interface EtatApplication {
  brouillon: BrouillonInitiative;
  initiatives: ReadonlyArray<Initiative>;
  ongletActif: IdentifiantOnglet;
}

export type ObservateurEtat = (etat: EtatApplication) => void;

export function brouillonVide(): BrouillonInitiative {
  return {
    id: Initiative.genererId(),
    nom: '', domaine: '', elementRepere: '', resultatAttendu: '',
    valeur: null, temps: null, risque: null, taille: null,
    preuves: { valeur: '', temps: '', risque: '', taille: '' },
    facteursTaille: new Set<FacteurTaille>(),
    qualifications: Initiative.qualificationsVides(),
    confiance: NiveauConfiance.moyen(),
    decision: DecisionPriorisation.aArbitrer(),
    arbitrage: '',
  };
}

export class StoreApplication {
  private etat: EtatApplication;
  private readonly abonnes = new Set<ObservateurEtat>();

  constructor(initiatives: ReadonlyArray<Initiative> = []) {
    this.etat = { brouillon: brouillonVide(), initiatives, ongletActif: 'evaluation' };
  }

  obtenirEtat(): Readonly<EtatApplication> { return this.etat; }

  abonner(fn: ObservateurEtat): () => void {
    this.abonnes.add(fn);
    fn(this.etat);
    return () => this.abonnes.delete(fn);
  }

  private propager(): void { for (const a of this.abonnes) a(this.etat); }

  changerOnglet(onglet: IdentifiantOnglet): void {
    if (this.etat.ongletActif === onglet) return;
    this.etat = { ...this.etat, ongletActif: onglet };
    this.propager();
  }

  modifierBrouillon(patch: Partial<BrouillonInitiative>): void {
    this.etat = { ...this.etat, brouillon: { ...this.etat.brouillon, ...patch } };
    this.propager();
  }

  basculerFacteurTaille(facteur: FacteurTaille): void {
    if (!(FACTEURS_TAILLE as readonly string[]).includes(facteur)) return;
    const nouveau = new Set(this.etat.brouillon.facteursTaille);
    if (nouveau.has(facteur)) nouveau.delete(facteur);
    else nouveau.add(facteur);
    this.modifierBrouillon({ facteursTaille: nouveau });
  }

  /**
   * Met à jour la qualification d'un sous-critère.
   * "Non qualifié" supprime l'entrée (équivalent à pas de qualification).
   */
  modifierQualification(
    composante: ClefComposanteCatalogue,
    lettre: string,
    qual: QualificationSousCritere,
  ): void {
    const q = this.etat.brouillon.qualifications;
    const nouveau = new Map(q[composante]);
    if (qual.estQualifie()) nouveau.set(lettre, qual);
    else nouveau.delete(lettre);
    const qualifs: QualificationsParComposante = { ...q, [composante]: nouveau };
    this.modifierBrouillon({ qualifications: qualifs });
  }

  reinitialiserBrouillon(): void {
    this.etat = { ...this.etat, brouillon: brouillonVide() };
    this.propager();
  }

  validerEtAjouterBrouillon(): Initiative | null {
    const b = this.etat.brouillon;
    if (!b.nom.trim()) return null;
    if (!b.valeur || !b.temps || !b.risque || !b.taille) return null;
    const init = Initiative.creer({
      id: b.id, nom: b.nom.trim(),
      domaine: b.domaine.trim(),
      elementRepere: b.elementRepere.trim(),
      resultatAttendu: b.resultatAttendu.trim(),
      valeur: b.valeur, temps: b.temps, risque: b.risque, taille: b.taille,
      preuves: b.preuves,
      facteursTaille: b.facteursTaille,
      qualifications: b.qualifications,
      qualiteDecision: {
        confiance: b.confiance, decision: b.decision,
        arbitrage: b.arbitrage.trim(),
      },
      dateCreation: new Date(),
    });
    this.etat = {
      ...this.etat,
      initiatives: [...this.etat.initiatives, init],
      brouillon: brouillonVide(),
    };
    this.propager();
    return init;
  }

  retirerInitiative(id: string): void {
    this.etat = { ...this.etat, initiatives: this.etat.initiatives.filter((x) => x.id() !== id) };
    this.propager();
  }
  remplacerInitiatives(initiatives: ReadonlyArray<Initiative>): void {
    this.etat = { ...this.etat, initiatives };
    this.propager();
  }
  viderInitiatives(): void {
    this.etat = { ...this.etat, initiatives: [] };
    this.propager();
  }
  /**
   * Charge une initiative existante dans le brouillon pour modification.
   * L'initiative source est retirée de la liste (sera re-ajoutée après modification).
   */
  chargerBrouillonDepuisInitiative(init: Initiative): void {
    const qualifications = init.qualifications();
    this.etat = {
      ...this.etat,
      initiatives: this.etat.initiatives.filter((x) => x.id() !== init.id()),
      brouillon: {
        id: init.id(),
        nom: init.nom(),
        domaine: init.domaine(),
        elementRepere: init.elementRepere(),
        resultatAttendu: init.resultatAttendu(),
        valeur: init.valeur(),
        temps: init.temps(),
        risque: init.risque(),
        taille: init.taille(),
        preuves: init.preuves(),
        facteursTaille: init.facteursTaille(),
        qualifications: {
          valeur: new Map(qualifications.valeur),
          temps: new Map(qualifications.temps),
          risque: new Map(qualifications.risque),
          taille: new Map(qualifications.taille),
        },
        confiance: init.qualiteDecision().confiance,
        decision: init.qualiteDecision().decision,
        arbitrage: init.qualiteDecision().arbitrage,
      },
      ongletActif: 'evaluation',
    };
    this.propager();
  }

}
