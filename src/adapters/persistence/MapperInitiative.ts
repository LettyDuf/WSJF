/**
 * Conversion bidirectionnelle entre l'entité Initiative et son DTO.
 *
 * Politique stricte à l'import : valeurs Fibonacci hors échelle ou énumérations
 * inconnues lèvent une erreur explicite.
 *
 * Migration automatique v1 → v2 : si le DTO ne porte pas les champs de
 * qualifications, on les ajoute vides et on conserve un éventuel champ
 * "responsable" hérité en préfixe de l'arbitrage textuel.
 */

import {
  Initiative,
  EchelleFibonacci,
  NiveauConfiance,
  DecisionPriorisation,
  QualificationSousCritere,
  FACTEURS_TAILLE,
  type FacteurTaille,
  type QualificationsParComposante,
} from '../../domain/index.js';
import type { DtoInitiative, DtoQualifications } from './DtoInitiative.js';

export function initiativeVersDto(init: Initiative): DtoInitiative {
  const qd = init.qualiteDecision();
  const p = init.preuves();
  const q = init.qualifications();
  return {
    id: init.id(),
    nom: init.nom(),
    domaine: init.domaine(),
    elementRepere: init.elementRepere(),
    resultatAttendu: init.resultatAttendu(),
    valeur: init.valeur()?.valeur() ?? null,
    temps: init.temps()?.valeur() ?? null,
    risque: init.risque()?.valeur() ?? null,
    taille: init.taille()?.valeur() ?? null,
    preuveValeur: p.valeur,
    preuveTemps: p.temps,
    preuveRisque: p.risque,
    preuveTaille: p.taille,
    facteursTaille: Array.from(init.facteursTaille()),
    qualificationsValeur: mapVersDto(q.valeur),
    qualificationsTemps: mapVersDto(q.temps),
    qualificationsRisque: mapVersDto(q.risque),
    qualificationsTaille: mapVersDto(q.taille),
    confiance: qd.confiance.libelle(),
    decision: qd.decision.libelle(),
    arbitrage: qd.arbitrage,
    dateCreation: init.dateCreation().toISOString(),
  };
}

function mapVersDto(m: ReadonlyMap<string, QualificationSousCritere>): DtoQualifications {
  const out: DtoQualifications = {};
  for (const [lettre, q] of m) out[lettre] = q.libelle();
  return out;
}

function dtoVersMap(d: DtoQualifications | undefined): Map<string, QualificationSousCritere> {
  const m = new Map<string, QualificationSousCritere>();
  if (!d) return m;
  for (const [lettre, libelle] of Object.entries(d)) {
    if (typeof libelle === 'string' && libelle !== 'Non qualifié') {
      m.set(lettre, QualificationSousCritere.depuis(libelle));
    }
  }
  return m;
}

function fiboStrict(
  v: number | null | undefined,
  champ: string,
): EchelleFibonacci | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(champ + ' : valeur non numérique');
  }
  if (!EchelleFibonacci.estValeurAdmise(v)) {
    throw new Error(champ + ' : valeur ' + v + ' hors échelle Fibonacci');
  }
  return EchelleFibonacci.depuis(v);
}

/**
 * Migre les DTO v1 (sans champs de qualifications, avec éventuel "responsable")
 * vers la structure v2 attendue par le reste du pipeline.
 */
function migrerDepuisV1(dtoBrut: DtoInitiative): DtoInitiative {
  const enregistrement = dtoBrut as unknown as Record<string, unknown>;
  if (enregistrement['qualificationsValeur'] !== undefined) return dtoBrut;

  const responsable = typeof enregistrement['responsable'] === 'string'
    ? (enregistrement['responsable'] as string)
    : '';
  const arbitrageActuel = typeof enregistrement['arbitrage'] === 'string'
    ? (enregistrement['arbitrage'] as string)
    : '';
  const arbitrageMigre = responsable
    ? `[Responsable hérité v1 : ${responsable}]\n${arbitrageActuel}`.trim()
    : arbitrageActuel;

  return {
    ...dtoBrut,
    qualificationsValeur: {},
    qualificationsTemps: {},
    qualificationsRisque: {},
    qualificationsTaille: {},
    arbitrage: arbitrageMigre,
  };
}

export function dtoVersInitiative(dtoBrut: DtoInitiative): Initiative {
  const dto = migrerDepuisV1(dtoBrut);

  const facteursValides = new Set<FacteurTaille>(
    (dto.facteursTaille ?? []).filter((f): f is FacteurTaille =>
      (FACTEURS_TAILLE as readonly string[]).includes(f),
    ),
  );

  const qualifications: QualificationsParComposante = {
    valeur: dtoVersMap(dto.qualificationsValeur),
    temps: dtoVersMap(dto.qualificationsTemps),
    risque: dtoVersMap(dto.qualificationsRisque),
    taille: dtoVersMap(dto.qualificationsTaille),
  };

  return Initiative.creer({
    id: dto.id || Initiative.genererId(),
    nom: dto.nom,
    domaine: dto.domaine ?? '',
    elementRepere: dto.elementRepere ?? '',
    resultatAttendu: dto.resultatAttendu ?? '',
    valeur: fiboStrict(dto.valeur, 'Valeur'),
    temps: fiboStrict(dto.temps, 'Temps'),
    risque: fiboStrict(dto.risque, 'Risque'),
    taille: fiboStrict(dto.taille, 'Taille'),
    preuves: {
      valeur: dto.preuveValeur ?? '',
      temps: dto.preuveTemps ?? '',
      risque: dto.preuveRisque ?? '',
      taille: dto.preuveTaille ?? '',
    },
    facteursTaille: facteursValides,
    qualifications,
    qualiteDecision: {
      confiance: NiveauConfiance.depuis(dto.confiance),
      decision: DecisionPriorisation.depuis(dto.decision),
      arbitrage: dto.arbitrage ?? '',
    },
    dateCreation: dto.dateCreation ? new Date(dto.dateCreation) : new Date(),
  });
}
