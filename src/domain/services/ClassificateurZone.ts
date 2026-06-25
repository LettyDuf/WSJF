/**
 * Classifie une initiative dans une zone du graphique à bulles
 * (coût du délai vs taille du travail).
 *
 * Quatre zones :
 *  - "prioritaire"   : coût élevé, taille limitée — à discuter en premier.
 *  - "decouper"      : coût élevé, taille grande — à découper avant engagement.
 *  - "gainRapide"    : coût faible, taille limitée — gain rapide possible.
 *  - "aChallenger"   : coût faible, taille grande — à challenger ou différer.
 *
 * Les seuils sont définis dans SeuilsPriorisation. Modifier les seuils
 * réoriente la lecture du graphique sans changer la logique.
 */

import { Initiative } from '../entities/Initiative.js';
import { SEUILS_ZONE } from '../constantes/SeuilsPriorisation.js';

export type ZoneInitiative =
  | 'prioritaire'
  | 'decouper'
  | 'gainRapide'
  | 'aChallenger';

export class ClassificateurZone {
  classifier(initiative: Initiative): ZoneInitiative {
    const cout = initiative.coutDuDelai();
    const taille = initiative.taille()?.valeur() ?? 0;
    const coutEleve = cout >= SEUILS_ZONE.COUT_ELEVE;
    const tailleImportante = taille > SEUILS_ZONE.TAILLE_IMPORTANTE;

    if (coutEleve && !tailleImportante) return 'prioritaire';
    if (coutEleve && tailleImportante) return 'decouper';
    if (!coutEleve && !tailleImportante) return 'gainRapide';
    return 'aChallenger';
  }

  libelleZone(zone: ZoneInitiative): { titre: string; description: string } {
    switch (zone) {
      case 'prioritaire':
        return {
          titre: 'À discuter en premier',
          description: "Attendre coûte cher ; l'effort reste limité.",
        };
      case 'decouper':
        return {
          titre: 'À découper ou cadrer',
          description: 'Attendre coûte cher ; le travail est gros.',
        };
      case 'gainRapide':
        return {
          titre: 'Gain rapide possible',
          description: "Attendre coûte peu ; l'effort est limité.",
        };
      case 'aChallenger':
        return {
          titre: 'À challenger ou attendre',
          description: 'Attendre coûte peu ; le travail est gros.',
        };
    }
  }
}
