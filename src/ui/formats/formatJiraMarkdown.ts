/**
 * Format Markdown Jira (option C hybride) :
 *  - Titre + tableau de notes
 *  - Décision + confiance
 *  - Résultat attendu
 *  - Sous-critères : signaux Fort détaillés + signaux Faible détaillés + résumé Moyen
 *  - Arbitrage explicite
 *
 * Optimisé pour collage dans une description de billet Jira.
 */

import { CalculateurWsjf } from '../../domain/index.js';
import type { Initiative } from '../../domain/index.js';

const NOM_COMPOSANTES = {
  valeur: 'Valeur',
  temps: 'Temps',
  risque: 'Risque',
  taille: 'Taille',
} as const;

const LIBELLES_SC_COURTS: Record<string, Record<string, string>> = {
  valeur: { A: 'Clarté du problème', B: 'Population touchée', C: 'Confort / résultat métier', D: 'Objectifs stratégiques' },
  temps: { A: 'Fenêtre temporelle', B: 'Perte de valeur si report', C: 'Impact qualité pendant attente', D: 'Synchronisation parties prenantes' },
  risque: { A: 'Non-conformité / sécurité', B: 'Occasion produit / métier', C: 'Blocage actuel levé', D: 'Fragilité connue réduite', E: 'Inconnue technique levée', F: 'Décision irréversible évitée' },
  taille: { A: 'Périmètre', B: 'Systèmes touchés', C: 'Dépendances', D: 'Incertitude', E: 'Vérification / déploiement' },
};

export function construireMarkdownJira(init: Initiative): string {
  const calc = new CalculateurWsjf();
  const r = calc.calculer(init);
  const qd = init.qualiteDecision();

  const blocs: string[] = [];
  blocs.push(`# ${init.nom()}`);
  if (init.domaine().trim()) blocs.push(`**Domaine** : ${init.domaine()}`);

  blocs.push('## Note WSJF');
  blocs.push('| Valeur | Temps | Risque | Coût d\'attente | Taille | Note WSJF |');
  blocs.push('|---|---|---|---|---|---|');
  blocs.push(`| ${r.valeur} | ${r.temps} | ${r.risque} | ${r.coutDuDelai} | ${r.taille} | **${r.noteBrute.formatFr()}** |`);
  blocs.push('');
  blocs.push(`**Décision** : ${qd.decision.libelle()} · **Confiance** : ${qd.confiance.libelle()}`);

  if (init.resultatAttendu().trim()) {
    blocs.push('');
    blocs.push('## Résultat attendu');
    blocs.push(init.resultatAttendu().trim());
  }

  // Sous-critères : ventiler Fort / Faible / Moyen
  const forts: string[] = [];
  const faibles: string[] = [];
  let nbMoyens = 0;
  (['valeur', 'temps', 'risque', 'taille'] as const).forEach((c) => {
    init.qualifications()[c].forEach((q, lettre) => {
      const lib = LIBELLES_SC_COURTS[c]?.[lettre] ?? lettre;
      const ligne = `${NOM_COMPOSANTES[c]} · ${lettre}. ${lib}`;
      if (q.libelle() === 'Fort') forts.push(ligne);
      else if (q.libelle() === 'Faible') faibles.push(ligne);
      else if (q.libelle() === 'Moyen') nbMoyens++;
    });
  });

  if (forts.length > 0 || faibles.length > 0 || nbMoyens > 0) {
    blocs.push('');
    blocs.push('## Sous-critères qualifiés');
    if (forts.length > 0) {
      blocs.push('');
      blocs.push(`**${forts.length} signal(aux) Fort :**`);
      forts.forEach((l) => blocs.push(`- ${l}`));
    }
    if (faibles.length > 0) {
      blocs.push('');
      blocs.push(`**${faibles.length} signal(aux) Faible :**`);
      faibles.forEach((l) => blocs.push(`- ${l}`));
    }
    if (nbMoyens > 0) {
      blocs.push('');
      blocs.push(`*${nbMoyens} autre(s) sous-critère(s) qualifié(s) Moyen (aucun signal particulier).*`);
    }
  }

  if (qd.arbitrage.trim()) {
    blocs.push('');
    blocs.push('## Arbitrage');
    blocs.push(qd.arbitrage.trim());
  }

  return blocs.join('\n');
}
