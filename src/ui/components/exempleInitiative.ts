/**
 * Initiative d'exemple — sert de modèle pour les nouveaux utilisateurs.
 *
 * Cas réaliste contexte bancaire / coopératif : refonte d'un parcours digital.
 * Toutes les composantes sont qualifiées et notées de façon cohérente.
 */

import {
  EchelleFibonacci, NiveauConfiance, DecisionPriorisation,
  QualificationSousCritere, Initiative,
} from '../../domain/index.js';
import type { BrouillonInitiative } from '../state/StoreApplication.js';

export function brouillonExemple(): BrouillonInitiative {
  const qual = (libelle: string) => QualificationSousCritere.depuis(libelle);
  return {
    id: Initiative.genererId(),
    nom: "Refonte du parcours d'ouverture de compte mobile",
    domaine: 'Acquisition · domaine Client',
    elementRepere: "Initiative repère : refonte de la connexion (notes 5, 3, 5 et 3)",
    resultatAttendu:
      "Réduire de 40 % le taux d'abandon en cours d'ouverture mesuré sur 12 semaines, sur la population des nouveaux clients mobiles.",
    valeur: EchelleFibonacci.depuis(8),
    temps: EchelleFibonacci.depuis(5),
    risque: EchelleFibonacci.depuis(3),
    taille: EchelleFibonacci.depuis(5),
    preuves: {
      valeur:
        "Taux d'abandon observé à 38 % sur les 6 derniers mois. Étude utilisateurs menée en mars : friction principale identifiée sur la validation KYC.",
      temps:
        "Campagne d'acquisition prévue à l'automne. Effet d'apprentissage souhaité avant la prochaine vague de candidats.",
      risque:
        "Réduit l'irritant client et lève une dépendance pour le programme Mobile First. Faible risque de conformité supplémentaire.",
      taille:
        "3 équipes touchées (Mobile, KYC, Back-office). Découpage en 2 phases envisageable.",
    },
    facteursTaille: new Set(['Plusieurs équipes', 'Dépendances externes']),
    qualifications: {
      valeur: new Map([
        ['A', qual('Fort')], ['B', qual('Fort')],
        ['C', qual('Moyen')], ['D', qual('Moyen')],
      ]),
      temps: new Map([
        ['A', qual('Moyen')], ['B', qual('Moyen')],
        ['C', qual('Moyen')], ['D', qual('Faible')],
      ]),
      risque: new Map([
        ['A', qual('Faible')], ['B', qual('Moyen')],
        ['C', qual('Moyen')], ['D', qual('Moyen')],
        ['E', qual('Faible')], ['F', qual('Faible')],
      ]),
      taille: new Map([
        ['A', qual('Moyen')], ['B', qual('Moyen')],
        ['C', qual('Moyen')], ['D', qual('Faible')],
        ['E', qual('Moyen')],
      ]),
    },
    confiance: NiveauConfiance.depuis('Moyen'),
    decision: DecisionPriorisation.depuis('Planifier'),
    arbitrage:
      "À planifier après la version actuelle de l'app mobile (T3). Hypothèse à valider : disponibilité de l'équipe KYC pour le sprint d'amorçage. Condition de réexamen : si le taux d'abandon dépasse 45 % au prochain mesurage.",
  };
}
