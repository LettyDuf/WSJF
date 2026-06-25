/**
 * Value object représentant le niveau de confiance dans l'évaluation.
 *
 * Trois niveaux admis : Faible | Moyen | Élevé.
 * Chaque niveau expose un facteur de pondération qui module la note WSJF.
 *
 * Objet immuable.
 */

import { FACTEURS_CONFIANCE } from '../constantes/SeuilsPriorisation.js';

export const NIVEAUX_CONFIANCE = ['Faible', 'Moyen', 'Élevé'] as const;
export type LibelleConfiance = (typeof NIVEAUX_CONFIANCE)[number];

export class NiveauConfiance {
  private constructor(private readonly _libelle: LibelleConfiance) {}

  static depuis(libelle: string): NiveauConfiance {
    if (!NiveauConfiance.estLibelleAdmis(libelle)) {
      throw new Error(
        `Niveau de confiance invalide : "${libelle}". Valeurs admises : ${NIVEAUX_CONFIANCE.join(', ')}.`,
      );
    }
    return new NiveauConfiance(libelle);
  }

  static moyen(): NiveauConfiance {
    return new NiveauConfiance('Moyen');
  }

  static estLibelleAdmis(libelle: string): libelle is LibelleConfiance {
    return (NIVEAUX_CONFIANCE as readonly string[]).includes(libelle);
  }

  libelle(): LibelleConfiance {
    return this._libelle;
  }

  /**
   * Facteur multiplicatif appliqué à la note WSJF.
   * Élevé : 1.0 (aucune pondération)
   * Moyen : 0.85
   * Faible : 0.6 (pénalité notable)
   */
  facteurPonderation(): number {
    switch (this._libelle) {
      case 'Élevé':
        return FACTEURS_CONFIANCE.ELEVE;
      case 'Moyen':
        return FACTEURS_CONFIANCE.MOYEN;
      case 'Faible':
        return FACTEURS_CONFIANCE.FAIBLE;
    }
  }

  egal(autre: NiveauConfiance): boolean {
    return this._libelle === autre._libelle;
  }
}
