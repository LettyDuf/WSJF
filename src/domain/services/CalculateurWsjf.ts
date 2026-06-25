/**
 * Service de calcul de la note WSJF.
 *
 * Stateless, sans effet de bord. Prend une initiative en entrée,
 * retourne un résultat structuré qui contient :
 *  - les composantes brutes
 *  - le coût du délai
 *  - la note brute (coût / taille)
 *  - la note pondérée par la confiance (utile pour comparer des
 *    initiatives évaluées avec des niveaux de confiance différents)
 *  - un booléen "complet" indiquant si le calcul s'applique réellement
 *
 * Une initiative incomplète renvoie un résultat avec note = 0
 * et complet = false. Ce choix évite que l'appelant n'ait à gérer null,
 * tout en signalant explicitement que la note n'est pas significative.
 */

import { Initiative } from '../entities/Initiative.js';
import { NoteWsjf } from '../valueObjects/NoteWsjf.js';

export interface ResultatWsjf {
  readonly complet: boolean;
  readonly valeur: number;
  readonly temps: number;
  readonly risque: number;
  readonly taille: number;
  readonly coutDuDelai: number;
  readonly noteBrute: NoteWsjf;
  readonly notePonderee: NoteWsjf;
  readonly facteurConfiance: number;
}

export class CalculateurWsjf {
  /**
   * Calcule la note WSJF pour une initiative.
   * Si l'initiative n'est pas complète, renvoie un résultat à zéro.
   * Si la taille est à zéro malgré la complétude (cas théorique impossible
   * avec l'échelle Fibonacci ≥ 1), renvoie également zéro pour éviter
   * une division par zéro silencieuse.
   */
  calculer(initiative: Initiative): ResultatWsjf {
    const valeur = initiative.valeur()?.valeur() ?? 0;
    const temps = initiative.temps()?.valeur() ?? 0;
    const risque = initiative.risque()?.valeur() ?? 0;
    const taille = initiative.taille()?.valeur() ?? 0;
    const coutDuDelai = valeur + temps + risque;
    const facteurConfiance = initiative
      .qualiteDecision()
      .confiance.facteurPonderation();

    const complet = initiative.estComplete() && taille > 0;
    if (!complet) {
      return {
        complet: false,
        valeur,
        temps,
        risque,
        taille,
        coutDuDelai,
        noteBrute: NoteWsjf.zero(),
        notePonderee: NoteWsjf.zero(),
        facteurConfiance,
      };
    }

    const noteBrute = NoteWsjf.depuis(coutDuDelai / taille);
    const notePonderee = NoteWsjf.depuis(noteBrute.valeur() * facteurConfiance);

    return {
      complet: true,
      valeur,
      temps,
      risque,
      taille,
      coutDuDelai,
      noteBrute,
      notePonderee,
      facteurConfiance,
    };
  }
}
