/**
 * Entité Initiative — représente un élément à prioriser.
 *
 * Une initiative encapsule :
 *  - une identité (id, nom, domaine concerné)
 *  - les 4 composantes WSJF (valeur, temps, risque, taille) — note Fibonacci
 *  - les éléments factuels libres (preuves textuelles) par composante
 *  - les sous-critères qualifiés (A, B, C, D, ...) par composante — hors calcul
 *  - la qualité de la décision (confiance, décision, arbitrage) — hors calcul
 *  - les facteurs de taille cochés
 *
 * Les composantes WSJF peuvent être absentes (initiative en cours de saisie).
 * L'initiative est "complète" lorsque les 4 composantes Fibonacci sont saisies.
 *
 * Le calcul de la note WSJF est délégué au service CalculateurWsjf.
 */

import { EchelleFibonacci } from '../valueObjects/EchelleFibonacci.js';
import { NiveauConfiance } from '../valueObjects/NiveauConfiance.js';
import { DecisionPriorisation } from '../valueObjects/DecisionPriorisation.js';
import { QualificationSousCritere } from '../valueObjects/QualificationSousCritere.js';
import {
  FACTEURS_TAILLE,
  type FacteurTaille,
} from '../constantes/SeuilsPriorisation.js';

export interface PreuvesInitiative {
  valeur: string;
  temps: string;
  risque: string;
  taille: string;
}

export interface QualiteDecision {
  confiance: NiveauConfiance;
  decision: DecisionPriorisation;
  arbitrage: string;
}

/**
 * Qualifications des sous-critères pour les 4 composantes WSJF.
 * Indexées par lettre ("A", "B", "C", ...).
 * Une lettre absente vaut "Non qualifié".
 */
export interface QualificationsParComposante {
  valeur: ReadonlyMap<string, QualificationSousCritere>;
  temps: ReadonlyMap<string, QualificationSousCritere>;
  risque: ReadonlyMap<string, QualificationSousCritere>;
  taille: ReadonlyMap<string, QualificationSousCritere>;
}

export interface DonneesInitiative {
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
  qualiteDecision: QualiteDecision;
  dateCreation: Date;
}

export class Initiative {
  private constructor(private readonly donnees: DonneesInitiative) {}

  static creer(donnees: DonneesInitiative): Initiative {
    Initiative.validerNom(donnees.nom);
    Initiative.validerFacteurs(donnees.facteursTaille);
    return new Initiative(donnees);
  }

  static genererId(): string {
    const base = Date.now().toString(36);
    const aleatoire = Math.random().toString(36).slice(2, 8);
    return `init-${base}-${aleatoire}`;
  }

  static qualificationsVides(): QualificationsParComposante {
    return {
      valeur: new Map(),
      temps: new Map(),
      risque: new Map(),
      taille: new Map(),
    };
  }

  private static validerNom(nom: string): void {
    if (typeof nom !== 'string' || nom.trim().length === 0) {
      throw new Error("Le nom de l'initiative ne peut pas être vide.");
    }
  }

  private static validerFacteurs(facteurs: ReadonlySet<FacteurTaille>): void {
    for (const f of facteurs) {
      if (!(FACTEURS_TAILLE as readonly string[]).includes(f)) {
        throw new Error(`Facteur de taille inconnu : "${f}".`);
      }
    }
  }

  // ----- accesseurs -----
  id(): string { return this.donnees.id; }
  nom(): string { return this.donnees.nom; }
  domaine(): string { return this.donnees.domaine; }
  elementRepere(): string { return this.donnees.elementRepere; }
  resultatAttendu(): string { return this.donnees.resultatAttendu; }
  valeur(): EchelleFibonacci | null { return this.donnees.valeur; }
  temps(): EchelleFibonacci | null { return this.donnees.temps; }
  risque(): EchelleFibonacci | null { return this.donnees.risque; }
  taille(): EchelleFibonacci | null { return this.donnees.taille; }
  preuves(): PreuvesInitiative { return this.donnees.preuves; }
  facteursTaille(): ReadonlySet<FacteurTaille> { return this.donnees.facteursTaille; }
  qualifications(): QualificationsParComposante { return this.donnees.qualifications; }
  qualiteDecision(): QualiteDecision { return this.donnees.qualiteDecision; }
  dateCreation(): Date { return this.donnees.dateCreation; }

  estComplete(): boolean {
    return (
      this.donnees.valeur !== null &&
      this.donnees.temps !== null &&
      this.donnees.risque !== null &&
      this.donnees.taille !== null
    );
  }

  coutDuDelai(): number {
    const v = this.donnees.valeur?.valeur() ?? 0;
    const t = this.donnees.temps?.valeur() ?? 0;
    const r = this.donnees.risque?.valeur() ?? 0;
    return v + t + r;
  }
}
