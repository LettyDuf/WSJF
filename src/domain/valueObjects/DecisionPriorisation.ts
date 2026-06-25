/**
 * Value object représentant la décision retenue suite à l'évaluation.
 *
 * La décision est saisie par l'utilisateur. Elle ne participe pas au calcul
 * mais documente l'arbitrage et alimente les indicateurs de gouvernance
 * (ex. nombre d'initiatives "à clarifier").
 */

export const DECISIONS_PRIORISATION = [
  'À arbitrer',
  'Traiter maintenant',
  'Planifier',
  'Découper',
  'Clarifier',
  'Mettre en attente',
  'Écarter',
] as const;

export type LibelleDecision = (typeof DECISIONS_PRIORISATION)[number];

export class DecisionPriorisation {
  private constructor(private readonly _libelle: LibelleDecision) {}

  static depuis(libelle: string): DecisionPriorisation {
    if (!DecisionPriorisation.estLibelleAdmis(libelle)) {
      throw new Error(
        `Décision invalide : "${libelle}". Valeurs admises : ${DECISIONS_PRIORISATION.join(', ')}.`,
      );
    }
    return new DecisionPriorisation(libelle);
  }

  static aArbitrer(): DecisionPriorisation {
    return new DecisionPriorisation('À arbitrer');
  }

  static estLibelleAdmis(libelle: string): libelle is LibelleDecision {
    return (DECISIONS_PRIORISATION as readonly string[]).includes(libelle);
  }

  libelle(): LibelleDecision {
    return this._libelle;
  }

  egal(autre: DecisionPriorisation): boolean {
    return this._libelle === autre._libelle;
  }
}
