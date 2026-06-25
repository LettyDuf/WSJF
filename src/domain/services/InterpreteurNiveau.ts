/**
 * Interprète une note WSJF en niveau qualitatif et en recommandation textuelle.
 *
 * Quatre niveaux : Très élevé / Élevé / Moyen / Faible.
 * Les seuils sont définis dans SeuilsPriorisation.
 *
 * Important : le niveau sert à orienter la discussion, jamais à décider seul.
 */

import { NoteWsjf } from '../valueObjects/NoteWsjf.js';
import { SEUILS_NIVEAU } from '../constantes/SeuilsPriorisation.js';

export type NiveauNote = 'Très élevée' | 'Élevée' | 'Moyenne' | 'Faible';

export class InterpreteurNiveau {
  niveau(note: NoteWsjf): NiveauNote {
    const v = note.valeur();
    if (v >= SEUILS_NIVEAU.TRES_ELEVE) return 'Très élevée';
    if (v >= SEUILS_NIVEAU.ELEVE) return 'Élevée';
    if (v >= SEUILS_NIVEAU.MOYEN) return 'Moyenne';
    return 'Faible';
  }

  recommandation(note: NoteWsjf): string {
    switch (this.niveau(note)) {
      case 'Très élevée':
        return "Candidat à traiter tôt, sous réserve de capacité et d'arbitrage.";
      case 'Élevée':
        return 'À comparer avec le haut de la liste.';
      case 'Moyenne':
        return 'À comparer avec les autres éléments.';
      case 'Faible':
        return 'À challenger ou à planifier plus tard.';
    }
  }
}
