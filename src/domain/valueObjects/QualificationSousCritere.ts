/**
 * Value object représentant la qualification d'un sous-critère par l'utilisateur.
 *
 * Quatre valeurs admises : "Non qualifié" (état initial), "Faible", "Moyen", "Fort".
 * Aucune influence sur la note WSJF — la qualification structure la discussion
 * et documente l'évaluation.
 *
 * Objet immuable.
 */

import {
  QUALIFICATIONS,
  type LibelleQualification,
} from '../constantes/CatalogueSousCriteres.js';

export class QualificationSousCritere {
  private constructor(private readonly _libelle: LibelleQualification) {}

  static depuis(libelle: string): QualificationSousCritere {
    if (!QualificationSousCritere.estLibelleAdmis(libelle)) {
      throw new Error(
        `Qualification invalide : "${libelle}". Valeurs admises : ${QUALIFICATIONS.join(', ')}.`,
      );
    }
    return new QualificationSousCritere(libelle);
  }

  static nonQualifie(): QualificationSousCritere {
    return new QualificationSousCritere('Non qualifié');
  }

  static estLibelleAdmis(libelle: string): libelle is LibelleQualification {
    return (QUALIFICATIONS as readonly string[]).includes(libelle);
  }

  libelle(): LibelleQualification {
    return this._libelle;
  }

  estQualifie(): boolean {
    return this._libelle !== 'Non qualifié';
  }

  egal(autre: QualificationSousCritere): boolean {
    return this._libelle === autre._libelle;
  }
}
