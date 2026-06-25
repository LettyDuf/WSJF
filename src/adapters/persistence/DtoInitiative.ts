/**
 * DTO sérialisable d'une Initiative.
 *
 * Format pivot pour tous les adaptateurs.
 *
 * VERSION_SCHEMA :
 *  - "1.0.0" : version initiale, sans sous-critères qualifiés ni Responsable retiré
 *  - "2.0.0" : ajout des qualifications de sous-critères par composante,
 *              retrait du champ Responsable (intégré dans l'arbitrage textuel)
 *
 * Les imports v1 sont automatiquement migrés en v2 (sous-critères vides,
 * Responsable conservé en préfixe de l'arbitrage si présent).
 */

export const VERSION_SCHEMA = '2.0.0';

/** Qualifications d'un sous-critère, sérialisées : { "A": "Faible", "B": "Moyen", ... } */
export type DtoQualifications = Record<string, string>;

export interface DtoInitiative {
  id: string;
  nom: string;
  domaine: string;
  elementRepere: string;
  resultatAttendu: string;
  valeur: number | null;
  temps: number | null;
  risque: number | null;
  taille: number | null;
  preuveValeur: string;
  preuveTemps: string;
  preuveRisque: string;
  preuveTaille: string;
  facteursTaille: string[];
  qualificationsValeur: DtoQualifications;
  qualificationsTemps: DtoQualifications;
  qualificationsRisque: DtoQualifications;
  qualificationsTaille: DtoQualifications;
  confiance: string;
  decision: string;
  arbitrage: string;
  dateCreation: string;
}

export interface DtoFichierComplet {
  versionSchema: string;
  dateExport: string;
  initiatives: DtoInitiative[];
}
