/** Helpers de construction utilisés dans les tests du domaine. */

import { EchelleFibonacci } from '../../src/domain/valueObjects/EchelleFibonacci';
import { NiveauConfiance } from '../../src/domain/valueObjects/NiveauConfiance';
import { DecisionPriorisation } from '../../src/domain/valueObjects/DecisionPriorisation';
import {
  Initiative,
  type DonneesInitiative,
} from '../../src/domain/entities/Initiative';
import type { FacteurTaille } from '../../src/domain/constantes/SeuilsPriorisation';

interface OptionsInitiative {
  nom?: string;
  domaine?: string;
  valeur?: number | null;
  temps?: number | null;
  risque?: number | null;
  taille?: number | null;
  confiance?: 'Faible' | 'Moyen' | 'Élevé';
  decision?: string;
  facteurs?: ReadonlyArray<FacteurTaille>;
}

export function uneInitiative(opt: OptionsInitiative = {}): Initiative {
  const fibo = (cle: keyof OptionsInitiative, defaut: number) => {
    if (cle in opt) {
      const v = opt[cle] as number | null | undefined;
      return EchelleFibonacci.depuisOuNul(v);
    }
    return EchelleFibonacci.depuisOuNul(defaut);
  };

  const donnees: DonneesInitiative = {
    id: 'test-1',
    nom: opt.nom ?? 'Initiative de test',
    domaine: opt.domaine ?? 'Test',
    elementRepere: '',
    resultatAttendu: '',
    valeur: fibo('valeur', 5),
    temps: fibo('temps', 5),
    risque: fibo('risque', 5),
    taille: fibo('taille', 5),
    preuves: { valeur: '', temps: '', risque: '', taille: '' },
    facteursTaille: new Set(opt.facteurs ?? []),
    qualifications: Initiative.qualificationsVides(),
    qualiteDecision: {
      confiance: NiveauConfiance.depuis(opt.confiance ?? 'Moyen'),
      decision: DecisionPriorisation.depuis(opt.decision ?? 'À arbitrer'),
      arbitrage: '',
    },
    dateCreation: new Date('2026-06-13T00:00:00Z'),
  };
  return Initiative.creer(donnees);
}
