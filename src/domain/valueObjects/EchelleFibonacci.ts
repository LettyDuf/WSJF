/**
 * Value object représentant une note sur l'échelle Fibonacci modifiée SAFe.
 *
 * Invariant : la valeur appartient à la liste {1, 2, 3, 5, 8, 13}.
 * Toute tentative de création avec une autre valeur lève une erreur explicite.
 *
 * Objet immuable : une fois construit, sa valeur ne change plus.
 */

import {
  ECHELLE_FIBONACCI,
  type ValeurFibonacci,
} from '../constantes/SeuilsPriorisation.js';

export class EchelleFibonacci {
  private constructor(private readonly _valeur: ValeurFibonacci) {}

  /**
   * Crée une instance à partir d'une valeur numérique.
   * Lève une erreur si la valeur n'est pas Fibonacci-admise.
   */
  static depuis(valeur: number): EchelleFibonacci {
    if (!EchelleFibonacci.estValeurAdmise(valeur)) {
      throw new Error(
        `Valeur Fibonacci invalide : ${valeur}. Valeurs admises : ${ECHELLE_FIBONACCI.join(', ')}.`,
      );
    }
    return new EchelleFibonacci(valeur);
  }

  /**
   * Tente de créer une instance, retourne null en cas d'échec
   * (utile dans l'interface où l'absence de sélection est un état légitime).
   */
  static depuisOuNul(valeur: number | null | undefined): EchelleFibonacci | null {
    if (valeur === null || valeur === undefined) return null;
    if (!EchelleFibonacci.estValeurAdmise(valeur)) return null;
    return new EchelleFibonacci(valeur);
  }

  static estValeurAdmise(valeur: number): valeur is ValeurFibonacci {
    return (ECHELLE_FIBONACCI as readonly number[]).includes(valeur);
  }

  static valeursAdmises(): readonly ValeurFibonacci[] {
    return ECHELLE_FIBONACCI;
  }

  valeur(): ValeurFibonacci {
    return this._valeur;
  }

  egal(autre: EchelleFibonacci): boolean {
    return this._valeur === autre._valeur;
  }

  toString(): string {
    return String(this._valeur);
  }
}
