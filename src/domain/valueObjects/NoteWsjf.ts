/**
 * Value object représentant une note WSJF calculée.
 *
 * Invariant : la note est un nombre fini et non négatif.
 * Objet immuable.
 */

export class NoteWsjf {
  private constructor(private readonly _valeur: number) {}

  static depuis(valeur: number): NoteWsjf {
    if (!Number.isFinite(valeur)) {
      throw new Error(`Note WSJF invalide : valeur non finie (${valeur}).`);
    }
    if (valeur < 0) {
      throw new Error(`Note WSJF invalide : valeur négative (${valeur}).`);
    }
    return new NoteWsjf(valeur);
  }

  static zero(): NoteWsjf {
    return new NoteWsjf(0);
  }

  valeur(): number {
    return this._valeur;
  }

  /** Représentation décimale française avec 2 chiffres après la virgule. */
  formatFr(): string {
    return this._valeur.toFixed(2).replace('.', ',');
  }

  estSuperieureA(autre: NoteWsjf): boolean {
    return this._valeur > autre._valeur;
  }
}
